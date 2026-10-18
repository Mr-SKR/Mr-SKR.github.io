import { motion } from "motion/react";
import { D } from "../data";
import { addDays, fmtDate, parseDate, todayStart } from "../format";
import { KEYS, useLocal, useTrip } from "../store";

interface PrepState {
  done: Record<string, boolean>;
  rent: Record<string, "own" | "rent">;
  ms: Record<string, boolean>;
}

/** Ticks keyed by checklist or milestone id, rebuilt from whatever storage holds. */
function cleanPrep(raw: unknown): PrepState {
  const out: PrepState = { done: {}, rent: {}, ms: {} };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  const obj = (x: unknown) => (x && typeof x === "object" ? Object.entries(x as Record<string, unknown>) : []);
  for (const [k, v] of obj(r.done)) if (v === true) out.done[k] = true;
  for (const [k, v] of obj(r.rent)) if (v === "own" || v === "rent") out.rent[k] = v;
  for (const [k, v] of obj(r.ms)) {
    if (v !== true) continue;
    // Milestone ticks used to be keyed by position in D.milestones.
    const id = /^\d+$/.test(k) ? D.milestones[Number(k)]?.id : k;
    if (id) out.ms[id] = true;
  }
  return out;
}

export function usePrep() {
  return useLocal<PrepState>(KEYS.prep, { done: {}, rent: {}, ms: {} }, cleanPrep);
}

const daysBefore = (d: number) => (d === 1 ? "the day before" : d + " days before");

export function PrepSection() {
  const { st, m, update } = useTrip();
  const [prep, setPrep] = usePrep();
  const start = parseDate(st.start);
  const end = start ? addDays(start, m.days - 1) : null;
  const today = todayStart();
  const items = D.checklist.flatMap((c) => c.items).filter((i) => !i.optional);
  const done = items.filter((i) => prep.done[i.id]).length;
  const pct = Math.round((100 * done) / items.length);

  // Earliest first, whatever order the data lists them in.
  const steps = [...D.milestones].sort((a, b) => b.d - a.d);

  const toggle = (id: string, v: boolean) => setPrep({ ...prep, done: { ...prep.done, [id]: v } });

  return (
    <section id="prep" className="section">
      <div className="wrap">
        <header className="section-head">
          <p className="eyebrow">03 · Prep</p>
          <h2>Before you go</h2>
          <p className="lead">What to sort out and when, and what goes in the bag. Ticks are saved on this device.</p>
        </header>
        <div className="prep-grid">
          <div>
            <h3 className="mini">Timeline</h3>
            <div className="prep-dates">
              <label className="date-inline">
                <span>Leaving</span>
                <input type="date" value={st.start || ""} aria-label="Departure date" onChange={(e) => update((d) => void (d.start = e.target.value || null))} />
              </label>
              {end ? (
                <span className="muted">
                  back {fmtDate(end)} · {m.days} days
                </span>
              ) : (
                <span className="muted">Pick a date to put real dates on the timeline.</span>
              )}
            </div>
            <ol className="tl">
              {steps.map((ms) => {
                const isDone = ms.link === undefined ? !!prep.ms[ms.id] : !!prep.done[ms.link];
                const due = start ? addDays(start, -ms.d) : null;
                const late = !!due && !isDone && due < today;
                return (
                  <li key={ms.link ?? ms.id} className={(isDone ? "done" : "") + (late ? " late" : "")}>
                    <input
                      type="checkbox"
                      className="tick"
                      checked={isDone}
                      aria-label={ms.t}
                      onChange={(e) => (ms.link === undefined ? setPrep({ ...prep, ms: { ...prep.ms, [ms.id]: e.target.checked } }) : toggle(ms.link, e.target.checked))}
                    />
                    <div className="tl-body">
                      <span className="tl-when">
                        {due ? fmtDate(due) + " · " : ""}
                        {daysBefore(ms.d)}
                        {late && " · overdue"}
                      </span>
                      <span className="tl-text">
                        {ms.t}
                        {ms.optional && <span className="tag-opt">Optional</span>}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <div className="progress-head">
              <h3 className="mini">Packing and paperwork</h3>
              <span className="muted small">
                {done} of {items.length}
              </span>
            </div>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Checklist progress">
              <motion.div animate={{ width: pct + "%" }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            {D.checklist.map((c) => (
              <div key={c.cat} className={"check-group" + (c.cat === "Optional" ? " optional" : "")}>
                <h4 className="mini-sub">{c.cat}</h4>
                {c.cat === "Optional" && <p className="muted small group-note">Not counted in the progress. To budget for it, add it under Add ons in the plan.</p>}
                <ul className="checks">
                  {c.items.map((it) => (
                    <li key={it.id} className={prep.done[it.id] ? "done" : ""}>
                      <label>
                        <input type="checkbox" className="tick" checked={!!prep.done[it.id]} onChange={(e) => toggle(it.id, e.target.checked)} />
                        <span>{it.t}</span>
                      </label>
                      {c.rentable && (
                        <span className="seg tiny" role="group" aria-label={"Own or rent: " + it.t}>
                          {(["own", "rent"] as const).map((v) => (
                            <button key={v} aria-pressed={(prep.rent[it.id] || "own") === v} onClick={() => setPrep({ ...prep, rent: { ...prep.rent, [it.id]: v } })}>
                              {v === "own" ? "Own" : "Rent"}
                            </button>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {Object.values(prep.rent).includes("rent") && !st.addons.includes("rentals") && (
              <p className="muted small">
                Renting gear?{" "}
                <button className="link" onClick={() => update((d) => void d.addons.push("rentals"))}>
                  Add rentals to the budget
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
