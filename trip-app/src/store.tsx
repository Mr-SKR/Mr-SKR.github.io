import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { decodeShare, defaultState, importShare, metrics, sanitize } from "./model";
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

/** useState that persists to localStorage. */
export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => load(key, initial));
  useEffect(() => save(key, v), [key, v]);
  return [v, setV] as const;
}

export const KEYS = {
  state: "trip.state.v4",
  presets: "trip.presets.v2",
  prep: "trip.prep.v2",
  wx: "trip.wx.v2",
  compare: "trip.compare.v2",
  ui: "trip.ui.v2",
};

/* ---------- Trip state with undo ---------- */
interface UpdateOpts {
  /** Skip the undo snapshot. */
  noHistory?: boolean;
}

interface Store {
  st: TripState;
  m: Metrics & { plan: Plan };
  update: (fn: (d: TripState) => TripState | void, opts?: UpdateOpts) => void;
  undo: () => void;
  canUndo: boolean;
  notice: string | null;
}

const Ctx = createContext<Store | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<TripState>(() => sanitize(load(KEYS.state, null)) || defaultState());
  const [notice, setNotice] = useState<string | null>(null);
  const stack = useRef<TripState[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // A shared build in the URL wins over what is stored, once, then the hash is
  // cleared so a reload keeps the visitor's own edits.
  useEffect(() => {
    const m = location.hash.match(/^#b=([zj][A-Za-z0-9_-]+)$/);
    if (!m) return;
    history.replaceState(null, "", location.pathname + location.search);
    decodeShare(m[1])
      .then((sh) => {
        setSt((cur) => {
          stack.current.push(cur);
          setCanUndo(true);
          return importShare(cur, sh);
        });
        setNotice("Loaded a shared route");
      })
      .catch(() => setNotice("That share link could not be read"));
  }, []);

  useEffect(() => save(KEYS.state, st), [st]);

  const update = useCallback((fn: (d: TripState) => TripState | void, opts: UpdateOpts = {}) => {
    setSt((cur) => {
      if (!opts.noHistory) {
        stack.current.push(cur);
        if (stack.current.length > 60) stack.current.shift();
      }
      const draft = structuredClone(cur);
      return fn(draft) || draft;
    });
    if (!opts.noHistory) setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const prev = stack.current.pop();
    if (prev) setSt(prev);
    setCanUndo(stack.current.length > 0);
  }, []);

  const m = useMemo(() => metrics(st), [st]);
  const value = useMemo(() => ({ st, m, update, undo, canUndo, notice }), [st, m, update, undo, canUndo, notice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrip() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTrip outside TripProvider");
  return c;
}
