import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useMemo, useState } from "react";
import { D } from "../data";
import { elev, fmtNum, ft } from "../format";
import { dayBlocks, P } from "../model";
import { useTrip } from "../store";
import { useUI } from "../ui";

const RealMap = lazy(() => import("./RealMap"));

type View = "profile" | "map" | "real";

export function AltitudeSection() {
  const [view, setView] = useState<View>("profile");
  return (
    <section id="altitude" className="section">
      <div className="wrap">
        <header className="section-head row">
          <div>
            <p className="eyebrow">02 · Altitude</p>
            <h2>How high, how fast</h2>
            <p className="lead">Every place on the trail, from the jeep out of Pokhara to the jeep back. Altitude sickness comes from climbing too fast: nights that climb more than 500 m above 3,000 m show in amber or red.</p>
          </div>
          <div className="seg" role="tablist" aria-label="View">
            {(
              [
                ["profile", "Profile"],
                ["map", "Trail map"],
                ["real", "Real map"],
              ] as [View, string][]
            ).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)}>
                {label}
                {view === k && <motion.span className="seg-pill" layoutId="alt-seg" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              </button>
            ))}
          </div>
        </header>
        {view === "profile" && <Profile />}
        {view === "map" && <TrailMap />}
        {view === "real" && (
          <Suspense fallback={<div className="map-frame loading">Loading map</div>}>
            <RealMap />
          </Suspense>
        )}
      </div>
    </section>
  );
}

/* The trail between two stops, waypoint by waypoint. Going up follows the
   ladder in the data; coming down, the trail leaves the valley at Chhomrong
   for Jhinu Danda and the road head at Motkyu. */
const DOWN_LADDER = ["motkyu", "jhinu", "chhomrong", "sinuwa", "bamboo", "dovan", "himalaya", "deurali", "mbc", "abc"];
function trailBetween(a: string, b: string): string[] {
  for (const lad of [D.trailLadder, DOWN_LADDER]) {
    const i = lad.indexOf(a);
    const j = lad.indexOf(b);
    if (i >= 0 && j >= 0 && i !== j) return i < j ? lad.slice(i + 1, j + 1) : lad.slice(j, i).reverse();
  }
  return [b];
}

/** "MBC" and "ABC" rather than the full names, and "Pokhara" rather than its airport code. */
const labelName = (id: string) => {
  const p = P(id);
  return p.short && (p.short.length > 3 || id === "abc" || id === "mbc") ? p.short : p.name;
};

interface TrailPoint {
  id: string;
  /** Distance along the route (km on foot; road legs count as a short gap). */
  d: number;
  nights: number[];
  ams?: "warn" | "bad";
}

/** Every place the trek passes, from the jeep out of Pokhara to the jeep back. */
function useTrailPoints() {
  const { m } = useTrip();
  return useMemo(() => {
    const blocks = dayBlocks(m.flat);
    const pts: TrailPoint[] = [];
    let d = 0;
    m.flat.forEach((f, i) => {
      if (!["up", "abc", "down"].includes(blocks[i])) return;
      if (!pts.length) pts.push({ id: f.from, d: 0, nights: [] });
      f.c.legs.forEach((l) => {
        if (l[0] === l[1]) return;
        const trek = l[2] === "trek";
        const seq = trek ? trailBetween(l[0], l[1]) : [l[1]];
        const km = trek ? (l[3] + l[4]) / 2 : 4;
        seq.forEach((id) => {
          d += km / seq.length;
          pts.push({ id, d, nights: [] });
        });
      });
      const last = pts[pts.length - 1];
      if (f.to !== "pokhara") {
        last.nights.push(f.day);
        if (f.ams) last.ams = f.ams;
      }
    });
    return pts;
  }, [m.flat]);
}

function Profile() {
  const ui = useUI();
  const reduce = useReducedMotion();
  const pts = useTrailPoints();
  const W = 1000;
  const H = 430;
  const L = 64;
  const R = 64;
  const T = 120;
  const B = 40;
  if (pts.length < 2) return <p className="muted">Add some days to see the profile.</p>;
  const dMax = pts[pts.length - 1].d;
  const lo = 500;
  const hi = 4500;
  const x = (d: number) => L + ((W - L - R) * d) / dMax;
  const y = (a: number) => T + (H - T - B) * (1 - (a - lo) / (hi - lo));
  const xy = pts.map((p) => [x(p.d), y(P(p.id).alt)] as const);
  const line = "M" + xy.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L");
  const area = line + " L" + x(dMax) + "," + y(lo) + " L" + x(0) + "," + y(lo) + " Z";
  const named = new Set<string>();
  return (
    <div className="profile">
      <div className="profile-scroll">
        <svg viewBox={"0 0 " + W + " " + H} role="img" aria-label={"Altitude along the trek, every place from Pokhara to Annapurna Base Camp and back"}>
          <rect x={L} y={y(hi)} width={W - L - R} height={y(3000) - y(hi)} className="zone" />
          <text x={L + 8} y={y(hi) + 18} className="zone-label">
            above 3,000 m (9,840 ft)
          </text>
          {[1000, 2000, 3000, 4000].map((a) => (
            <g key={a}>
              <line x1={L} x2={W - R} y1={y(a)} y2={y(a)} className="grid" />
              <text x={L - 8} y={y(a) + 4} textAnchor="end" className="axis">
                {fmtNum(a)} m
              </text>
              <text x={W - R + 8} y={y(a) + 4} className="axis">
                {ft(a)} ft
              </text>
            </g>
          ))}
          <motion.path d={area} className="area" initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
          <motion.path
            d={line}
            className="line"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
          {pts.map((p, i) => {
            const [px, py] = xy[i];
            const night = p.nights.length > 0;
            // Name each place once (where you first reach it), and every place you sleep.
            const label = !named.has(p.id) || night;
            named.add(p.id);
            const place = P(p.id);
            return (
              <g
                key={i}
                className={"pt" + (night ? " night" : "")}
                tabIndex={0}
                role="button"
                aria-label={place.name + ", " + elev(place.alt) + (night ? ", night " + p.nights.join(" and ") : "")}
                onClick={() => ui.open({ kind: "place", id: p.id })}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ui.open({ kind: "place", id: p.id })}
              >
                <circle cx={px} cy={py} r={12} className="hit" />
                {night && <line x1={px} x2={px} y1={py + 6} y2={H - B} className="night-tick" />}
                <circle cx={px} cy={py} r={night ? 5 : 3.5} className={"dot " + (night ? "on " : "off ") + (p.ams || "")} />
                {label && (
                  <text transform={`translate(${px + 3},${py - 11}) rotate(-58)`} className={"pt-label " + (night ? "" : "pass ") + (p.ams || "")}>
                    {labelName(p.id)}
                    <tspan className="pt-alt" dx="6">
                      {fmtNum(place.alt)} m
                    </tspan>
                  </text>
                )}
                {night && (
                  <text x={px} y={H - B + 18} textAnchor="middle" className="axis day-n">
                    {p.nights.length > 1 ? "Days " + p.nights[0] + "–" + p.nights[p.nights.length - 1] : "Day " + p.nights[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="muted small profile-key">
        <span className="key-dot on" /> where you sleep, with the day <span className="key-dot off" /> on the way. Spaced by distance walked. Tap a place to read about it.
      </p>
    </div>
  );
}

function TrailMap() {
  const { m } = useTrip();
  const ui = useUI();
  const on = new Set<string>();
  const legs: { a: [number, number]; b: [number, number]; mode: string }[] = [];
  m.flat.forEach((f) => {
    on.add(f.from).add(f.to);
    f.c.legs.forEach((l) => {
      on.add(l[0]).add(l[1]);
      if (l[0] !== l[1]) legs.push({ a: P(l[0]).map, b: P(l[1]).map, mode: l[2] });
    });
  });
  const peaks: [number, number, number, number, string, number, number, "start" | "middle" | "end"][] = [
    [620, 70, 190, 130, "Annapurna South", 560, 92, "middle"],
    [715, 110, 120, 95, "Hiunchuli", 700, 168, "middle"],
    [850, -10, 230, 90, "Annapurna I · 8,091 m (26,545 ft)", 735, -40, "end"],
    [968, 20, 110, 85, "Gangapurna", 992, 82, "end"],
    [952, 200, 84, 160, "Machhapuchhre", 992, 262, "end"],
  ];
  return (
    <div className="map-frame">
      <svg viewBox="0 -70 1000 790" className="trailmap" role="img" aria-label="Illustrated map of the route, not to scale">
        {peaks.map((p) => (
          <polygon key={p[4]} points={`${p[0] - p[2] / 2},${p[1] + 40} ${p[0]},${p[1] - p[3]} ${p[0] + p[2] / 2},${p[1] + 40}`} className="peak" />
        ))}
        {peaks.map((p) => (
          <text key={p[4]} x={p[5]} y={p[6]} textAnchor={p[7]} className="peak-label">
            {p[4]}
          </text>
        ))}
        <path d="M842,96 C850,150 812,190 790,232 S748,280 730,320 S700,380 712,420 S690,520 700,560" className="river" />
        <line x1="0" x2="1000" y1="560" y2="560" className="plains" />
        <text x="14" y="582" className="peak-label">
          Plains and cities, not to scale
        </text>
        {legs.map((l, i) =>
          l.mode === "flight" ? (
            <path key={i} d={`M${l.a} Q${(l.a[0] + l.b[0]) / 2},${Math.min(l.a[1], l.b[1]) - 60} ${l.b}`} className="leg flight" />
          ) : (
            <line key={i} x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} className={"leg " + (l.mode === "trek" ? "foot" : "road")} />
          ),
        )}
        {Object.entries(D.places).map(([id, p]) => {
          const tx = p.label === "left" ? p.map[0] - 14 : p.label === "top" ? p.map[0] : p.map[0] + 14;
          const ty = p.label === "top" ? p.map[1] - 16 : p.map[1] + 5;
          return (
            <g
              key={id}
              className={"stop" + (on.has(id) ? " on" : "")}
              tabIndex={0}
              role="button"
              aria-label={p.name + ", " + elev(p.alt)}
              onClick={() => ui.open({ kind: "place", id })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ui.open({ kind: "place", id })}
            >
              <circle cx={p.map[0]} cy={p.map[1]} r={16} className="hit" />
              <circle cx={p.map[0]} cy={p.map[1]} r={on.has(id) ? 5.5 : 4} className="dot" />
              <text x={tx} y={ty} textAnchor={p.label === "left" ? "end" : p.label === "top" ? "middle" : "start"}>
                {p.short}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="legend">
        <span className="foot">On foot</span>
        <span className="road">Road</span>
        <span className="flight">Flight</span>
      </div>
    </div>
  );
}
