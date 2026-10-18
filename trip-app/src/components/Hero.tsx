import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { DAY_MS, daysBetween, fmtDate, isoDate, parseDate, todayStart } from "../format";
import { useTrip } from "../store";
import { useNow } from "../ui";
import { Icon } from "./Icon";

/**
 * Deterministic ridgeline, smoothed with Catmull-Rom curves so the layers read
 * as soft mist over the valley rather than cut-out polygons.
 */
function ridge(seed: number, base: number, amp: number, points: number, w = 1440, h = 320) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: [number, number][] = [];
  for (let i = -1; i <= points + 1; i++) {
    pts.push([(w * i) / points, base - amp * (0.35 + 0.65 * rnd())]);
  }
  let d = "M" + pts[1][0] + "," + pts[1][1];
  for (let i = 1; i < pts.length - 2; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += " C" + c1.map((v) => v.toFixed(1)).join(",") + " " + c2.map((v) => v.toFixed(1)).join(",") + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
  }
  return d + " L" + w + "," + h + " L0," + h + " Z";
}

function Mist({ id, d, top, bottom }: { id: string; d: string; top: number; bottom: number }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f7f9" stopOpacity={top} />
          <stop offset="1" stopColor="#f6f7f9" stopOpacity={bottom} />
        </linearGradient>
      </defs>
      <path d={d} fill={"url(#" + id + ")"} />
    </>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const k = reduce ? 0 : 1;
  const yPhoto = useTransform(scrollYProgress, [0, 1], ["0%", k * 18 + "%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.06 + k * 0.08]);
  const yTitle = useTransform(scrollYProgress, [0, 1], ["0%", k * 60 + "%"]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", k * 30 + "%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", k * 16 + "%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", k * 6 + "%"]);

  const paths = useMemo(() => [ridge(7, 150, 110, 5), ridge(31, 170, 90, 7), ridge(97, 190, 60, 9)], []);

  return (
    <header className="hero" ref={ref}>
      <motion.img
        className="hero-photo"
        src="/trip/img/abc-dusk-1200.webp"
        srcSet="/trip/img/abc-dusk-1200.webp 1200w, /trip/img/abc-dusk-1920.webp 1920w"
        sizes="100vw"
        alt="Annapurna Base Camp at dusk, with the last light on Machhapuchhre"
        style={{ y: yPhoto, scale }}
        fetchPriority="high"
      />
      <a className="hero-home" href="/">
        Suresh Reddy
      </a>
      <div className="hero-scrim" aria-hidden />
      <motion.svg className="ridge ridge-1" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ y: y1 }} aria-hidden>
        <Mist id="mist-1" d={paths[0]} top={0} bottom={0.45} />
      </motion.svg>
      <motion.div className="hero-title" style={{ y: yTitle, opacity: fade }}>
        <p className="kicker">Bengaluru to 4,130 m (13,550 ft)</p>
        <h1>Annapurna Base Camp</h1>
        <Countdown />
      </motion.div>
      <motion.svg className="ridge ridge-2" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ y: y2 }} aria-hidden>
        <Mist id="mist-2" d={paths[1]} top={0.35} bottom={0.95} />
      </motion.svg>
      <motion.svg className="ridge ridge-3" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ y: y3 }} aria-hidden>
        <Mist id="mist-3" d={paths[2]} top={1} bottom={1} />
      </motion.svg>
      <motion.a className="hero-cue" href="#route" style={{ opacity: fade }}>
        <span>Plan the route</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </motion.a>
    </header>
  );
}

/* ================================================================== */
/* Countdown to the departure date                                     */
/* ================================================================== */

/** Each digit rolls on its own, so only the ones that change move. */
function Roll({ value, width }: { value: number; width: number }) {
  const reduce = useReducedMotion();
  const chars = String(value).padStart(width, "0").split("");
  return (
    <span className="cd-digits">
      {chars.map((ch, i) => (
        <span className="cd-digit" key={i}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              initial={reduce ? false : { y: "-70%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={reduce ? undefined : { y: "70%", opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function Countdown() {
  const { st, m, update } = useTrip();
  const now = useNow(1000);
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const start = parseDate(st.start);

  const pick = () => {
    const el = input.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      // No showPicker (older Safari): show the field itself instead.
      setEditing(true);
      requestAnimationFrame(() => el.focus());
    }
  };

  const picker = (
    <input
      ref={input}
      className={"cd-input" + (editing ? " shown" : "")}
      type="date"
      min={isoDate(todayStart())}
      value={st.start || ""}
      aria-label="Departure date"
      tabIndex={editing ? 0 : -1}
      onChange={(e) => {
        update((d) => void (d.start = e.target.value || null));
        setEditing(false);
      }}
      onBlur={() => setEditing(false)}
    />
  );

  if (!start) {
    return (
      <div className="cd cd-empty">
        <button className="cd-pick" onClick={pick}>
          <Icon name="calendar" size={18} />
          <span>Pick your departure date</span>
        </button>
        <p className="cd-sub">and watch the days to the mountains count down</p>
        {picker}
      </div>
    );
  }

  const diff = start.getTime() - now;
  const dayN = daysBetween(start, todayStart()) + 1;
  const change = (
    <button className="cd-change" onClick={pick}>
      Change date
    </button>
  );

  if (diff <= 0) {
    const onTrail = dayN <= m.days;
    return (
      <div className="cd">
        <p className="cd-status">{onTrail ? <>Day {dayN} of {m.days} · on the trail</> : <>Back home · welcome back</>}</p>
        <p className="cd-foot">
          Left {fmtDate(start, true)} · {change}
        </p>
        {picker}
      </div>
    );
  }

  const units: [number, string, number][] = [
    [Math.floor(diff / DAY_MS), "days", 2],
    [Math.floor(diff / 3600e3) % 24, "hours", 2],
    [Math.floor(diff / 60e3) % 60, "minutes", 2],
    [Math.floor(diff / 1e3) % 60, "seconds", 2],
  ];
  return (
    <div className="cd" role="timer" aria-label={"Departure in " + units[0][0] + " days"}>
      <div className="cd-units" aria-hidden>
        {units.map(([v, label, w]) => (
          <div className="cd-unit" key={label}>
            <Roll value={v} width={w} />
            <span className="cd-label">{label}</span>
          </div>
        ))}
      </div>
      <p className="cd-foot">
        Until departure · {fmtDate(start, true)} · {change}
      </p>
      {picker}
    </div>
  );
}
