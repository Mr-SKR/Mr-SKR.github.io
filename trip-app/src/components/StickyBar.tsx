import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { fmtNum, ft, moneyShort } from "../format";
import { useTrip } from "../store";
import { useUI } from "../ui";
import { Icon } from "./Icon";
import { saveOffline, shareRoute } from "../actions";

export const SECTIONS = [
  ["route", "Route"],
  ["altitude", "Altitude"],
  ["prep", "Prep"],
] as const;

function Ticker({ value, format }: { value: number; format: (v: number) => string }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  useEffect(() => spring.set(value), [spring, value]);
  const text = useTransform(spring, format);
  return <motion.span>{text}</motion.span>;
}

export function StickyBar() {
  const { st, m, undo, canUndo } = useTrip();
  const ui = useUI();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>("route");
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Appears once the hero has scrolled away.
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { rootMargin: "-60px 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Underline the section in the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const pick = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };

  return (
    <motion.nav
      className="bar"
      aria-label="Trip sections"
      initial={false}
      animate={{ y: visible ? 0 : -72, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="bar-inner">
        <a className="bar-brand" href="#top" onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}>
          ABC
        </a>
        <ul className="bar-links">
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a href={"#" + id} aria-current={active === id ? "true" : undefined}>
                {label}
                {active === id && <motion.span className="bar-underline" layoutId="bar-underline" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="bar-right">
          <span className="bar-totals" aria-live="polite">
            <Ticker value={m.cost} format={(v) => moneyShort(v)} />
            <span className="bar-dim">
              {" · "}
              {m.days} d · {fmtNum(m.maxAlt)} m<span className="bar-ft"> · {ft(m.maxAlt)} ft</span>
            </span>
          </span>
          <button className="icon-btn" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo">
            <Icon name="undo" />
          </button>
          <div className="menu-wrap" ref={menuRef}>
            <button className="icon-btn" aria-label="More" aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu((v) => !v)}>
              <Icon name="more" size={20} />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div
                  className="menu"
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                >
                  <button role="menuitem" onClick={pick(() => shareRoute(st, ui))}>
                    <Icon name="share" /> Share this route
                  </button>
                  <button role="menuitem" onClick={pick(() => saveOffline(ui))}>
                    <Icon name="download" /> Save for offline
                  </button>
                  <button role="menuitem" onClick={pick(() => ui.open({ kind: "settings" }))}>
                    <Icon name="split" /> People and exchange rate
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
