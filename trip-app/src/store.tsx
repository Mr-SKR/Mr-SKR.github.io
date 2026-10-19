import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { decodeShare, importShare, metrics, sanitize, type ShareV2 } from "./model";
import type { Metrics, TripState } from "./types";
import type { Plan } from "./model";

/* ---------- localStorage, guarded: private windows and blocked storage throw ---------- */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* the in-memory state still works */
  }
}

/**
 * useState that persists to localStorage. Stored values are untrusted (old
 * formats, hand edits), so pass `clean` to rebuild anything that is not a
 * primitive; without it only the type of the stored value is checked.
 */
export function useLocal<T>(key: string, initial: T, clean?: (raw: unknown) => T) {
  const [v, setV] = useState<T>(() => {
    const raw = load<unknown>(key, initial);
    if (clean) return clean(raw);
    return typeof raw === typeof initial ? (raw as T) : initial;
  });
  useEffect(() => save(key, v), [key, v]);
  return [v, setV] as const;
}

export const KEYS = {
  state: "trip.state.v4",
  prep: "trip.prep.v2",
  wx: "trip.wx.v2",
  ui: "trip.ui.v2",
  goal: "trip.goal.v4",
  addonsOpen: "trip.addons.open",
  addonDefaults: "trip.addons.defaults.v1",
};

/**
 * Add ons that became defaults after some visitors had saved a plan. They are
 * ticked once for those visitors too, then theirs to untick. Pure, so React
 * can run it twice; the flag is saved from an effect.
 */
const NEW_DEFAULT_ADDONS = ["rentals", "sim_ntc"];

function withNewDefaults(st: TripState): TripState {
  if (load(KEYS.addonDefaults, false)) return st;
  return { ...st, addons: [...new Set([...st.addons, ...NEW_DEFAULT_ADDONS])] };
}

/* ---------- Trip state with undo ---------- */
interface UpdateOpts {
  /** Skip the undo snapshot. */
  noHistory?: boolean;
}

/** A fresh object per notice, so the same message twice still shows twice. */
export interface Notice {
  msg: string;
  undo?: boolean;
}

interface Store {
  st: TripState;
  m: Metrics & { plan: Plan };
  update: (fn: (d: TripState) => TripState | void, opts?: UpdateOpts) => void;
  undo: () => void;
  canUndo: boolean;
  notice: Notice | null;
}

const Ctx = createContext<Store | null>(null);

// History lives in the reducer state rather than a ref so every transition is
// pure: React may run an updater twice, which used to push two snapshots.
interface History {
  st: TripState;
  past: TripState[];
}

type Action =
  | { type: "update"; fn: (d: TripState) => TripState | void; noHistory?: boolean }
  | { type: "import"; sh: ShareV2 }
  | { type: "undo" };

const MAX_UNDO = 60;

function reduce(h: History, a: Action): History {
  switch (a.type) {
    case "update": {
      const draft = structuredClone(h.st);
      const st = a.fn(draft) || draft;
      return { st, past: a.noHistory ? h.past : [...h.past, h.st].slice(-MAX_UNDO) };
    }
    case "import":
      return { st: importShare(h.st, a.sh), past: [...h.past, h.st].slice(-MAX_UNDO) };
    case "undo":
      return h.past.length ? { st: h.past[h.past.length - 1], past: h.past.slice(0, -1) } : h;
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [{ st, past }, dispatch] = useReducer(reduce, null, () => ({
    st: withNewDefaults(sanitize(load(KEYS.state, null))),
    past: [],
  }));
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => save(KEYS.addonDefaults, true), []);

  // A shared build in the URL wins over what is stored, then the hash is
  // cleared so a reload keeps the visitor's own edits. Checked on load and on
  // hashchange: following a link into an open tab or the installed app changes
  // only the hash, with no reload.
  useEffect(() => {
    const take = () => {
      const m = location.hash.match(/^#b=([zj][A-Za-z0-9_-]+)$/);
      if (!m) return;
      history.replaceState(null, "", location.pathname + location.search);
      decodeShare(m[1])
        .then((sh) => {
          if (!sh || sh.v !== 2) throw new Error("bad share");
          dispatch({ type: "import", sh });
          setNotice({ msg: "Loaded a shared route", undo: true });
        })
        .catch(() => setNotice({ msg: "That share link could not be read" }));
    };
    take();
    window.addEventListener("hashchange", take);
    return () => window.removeEventListener("hashchange", take);
  }, []);

  useEffect(() => save(KEYS.state, st), [st]);

  const update = useCallback(
    (fn: (d: TripState) => TripState | void, opts: UpdateOpts = {}) => dispatch({ type: "update", fn, noHistory: opts.noHistory }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const canUndo = past.length > 0;

  const m = useMemo(() => metrics(st), [st]);
  const value = useMemo(() => ({ st, m, update, undo, canUndo, notice }), [st, m, update, undo, canUndo, notice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrip() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTrip outside TripProvider");
  return c;
}
