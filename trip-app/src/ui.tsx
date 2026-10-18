import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type SheetReq =
  | { kind: "place"; id: string }
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
