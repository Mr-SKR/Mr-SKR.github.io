import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { D } from "./data";
import { AltitudeSection } from "./components/Altitude";
import { Hero } from "./components/Hero";
import { PrepSection } from "./components/Prep";
import { RouteSection, UndoBridge } from "./components/Route";
import { Sheet } from "./components/Sheet";
import { StickyBar } from "./components/StickyBar";
import { P } from "./model";
import { TripProvider, useTrip } from "./store";
import { UIProvider, useUI } from "./ui";

function Toast() {
  const { current, dismiss } = useUI();
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {current && (
          <motion.div key={current.id} className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {current.msg}
            {current.action && (
              <button
                onClick={() => {
                  current.action!.run();
                  dismiss();
                }}
              >
                {current.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Surfaces store notices (a shared link was loaded) as toasts. */
function Notices() {
  const { notice, undo } = useTrip();
  const { toast } = useUI();
  useEffect(() => {
    if (notice) toast(notice, notice.startsWith("Loaded") ? { label: "Undo", run: undo } : undefined);
  }, [notice, toast, undo]);
  return null;
}

function Shortcuts() {
  const { undo } = useTrip();
  const { sheet } = useUI();
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.key.toLowerCase() !== "z" || sheet) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      e.preventDefault();
      undo();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [undo, sheet]);
  return null;
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p>
          Planned by <a href="/">Suresh Reddy</a>. Prices are estimates from my plan and public sources (October 2026); permit rules change, so check them before you go.
        </p>
        <p className="credits">
          Hero photo: <a href="https://commons.wikimedia.org/wiki/File:Evening_view_of_Annapurna_Base_Camp.jpg" target="_blank" rel="noopener">Evening view of Annapurna Base Camp</a> by Mithunkunwar9 (CC BY-SA 4.0). Place photos from Wikimedia Commons:{" "}
          {Object.entries(D.photoCredits).map(([k, c], i, arr) => (
            <span key={k}>
              <a href={c[2]} target="_blank" rel="noopener">
                {k === "poonhill" ? "Poon Hill" : P(k).name}
              </a>{" "}
              by {c[0]} ({c[1]}){i < arr.length - 1 ? ", " : "."}
            </span>
          ))}{" "}
          Map tiles by OpenTopoMap, forecasts by Open-Meteo.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <TripProvider>
      <UIProvider>
        <UndoBridge />
        <Notices />
        <Shortcuts />
        <StickyBar />
        <Hero />
        <main id="main">
          <RouteSection />
          <AltitudeSection />
          <PrepSection />
        </main>
        <Footer />
        <Sheet />
        <Toast />
      </UIProvider>
    </TripProvider>
  );
}
