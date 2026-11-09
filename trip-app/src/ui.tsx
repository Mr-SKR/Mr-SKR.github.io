import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type SheetReq =
  | { kind: "place"; id: string; at?: "story" }
  | { kind: "addon"; id: string }
  | { kind: "settings" }
  | { kind: "share"; url: string };

interface Toast {
  id: number;
  msg: string;
  action?: { label: string; run: () => void };
}

interface UI {
  sheet: SheetReq | null;
  open: (r: SheetReq) => void;
  close: () => void;
  toast: (msg: string, action?: Toast["action"]) => void;
  current: Toast | null;
  dismiss: () => void;
}

const Ctx = createContext<UI | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetReq | null>(null);
  const [current, setCurrent] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string, action?: Toast["action"]) => {
    window.clearTimeout(timer.current);
    setCurrent({ id: Date.now(), msg, action });
    timer.current = window.setTimeout(() => setCurrent(null), action ? 6000 : 2800);
  }, []);
  const dismiss = useCallback(() => setCurrent(null), []);
  const open = useCallback((r: SheetReq) => setSheet(r), []);
  const close = useCallback(() => setSheet(null), []);

  const value = useMemo(() => ({ sheet, open, close, toast, current, dismiss }), [sheet, open, close, toast, current, dismiss]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useUI outside UIProvider");
  return c;
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** Re-renders every `ms` so countdowns stay live. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}

/** navigator.onLine, kept current as the connection comes and goes. */
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return online;
}

/**
 * Arrow keys for a group of role="radio" or role="tab" buttons: move to the
 * next or previous one, wrapping, and pick it, as those roles promise. Pair
 * with `rovingTab` so Tab enters the group once, at the picked button.
 */
export function arrowPick(e: KeyboardEvent<HTMLElement>) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  const edge = e.key === "Home" ? "first" : e.key === "End" ? "last" : null;
  if (!step && !edge) return;
  const all = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"], [role="tab"]'));
  const i = all.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  e.preventDefault();
  const next = edge === "first" ? all[0] : edge === "last" ? all[all.length - 1] : all[(i + step! + all.length) % all.length];
  next.focus();
  next.click();
}

/** tabIndex for one button of an `arrowPick` group: the picked one, or the first when none is. */
export const rovingTab = (picked: boolean, i: number, anyPicked: boolean) => (picked || (!anyPicked && i === 0) ? 0 : -1);

/** Up and down arrows, Home and End, between the role="menuitem" buttons inside a menu. */
export function arrowMenu(e: KeyboardEvent<HTMLElement>) {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const i = items.indexOf(document.activeElement as HTMLElement);
  const to = e.key === "ArrowDown" ? (i + 1) % items.length : e.key === "ArrowUp" ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
  if (to < 0) return;
  e.preventDefault();
  items[to].focus();
}
