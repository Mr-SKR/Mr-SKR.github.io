import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { D } from "../data";
import { dayDate, elev, fmtDate, fmtNum, ft, legSummary, money, moneyShort, npr, photo, routeNames } from "../format";
import { addonCount, addonUnit, BLOCKS, blockOption, blockShown, dayBlocks, cardCost, goalChoices, GOALS, matchingGoal, metrics, MY_PLAN, myOption, P, type Block, type BlockOption, type Goal } from "../model";
import { KEYS, useLocal, useTrip } from "../store";
import type { Day } from "../types";
import { useUI } from "../ui";
import { Icon } from "./Icon";

const pad = (n: number) => String(n).padStart(2, "0");

/* ================================================================== */
export function RouteSection() {
  const { st, m } = useTrip();
  const [activeDay, setActiveDay] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  // The block or day nearest the middle of the screen drives the altitude marker.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveDay(Number((e.target as HTMLElement).dataset.day));
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    root.querySelectorAll("[data-day]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [m, open]);

  const shown = BLOCKS.filter((b) => blockShown(b, st.choices));
  const allOpen = shown.every((b) => open.has(b.id));
  const toggle = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section id="route" className="section">
      <div className="wrap">
        <header className="section-head">
          <p className="eyebrow">01 · The trip</p>
          <h2>Plan the trek</h2>
          <p className="lead">
            It starts as my plan. Pick what matters most to you, or change any part yourself. Open a part to see its days, prices and
            the places on the way.
          </p>
        </header>
        <div className="trip-grid">
          <aside className="goal-panel" aria-label="Your total and goals">
            <GoalPanel />
          </aside>
          <div className="blocks-col" ref={listRef}>
            <TrekStrip activeDay={activeDay} />
            <div className="blocks-tools">
              <PriceNote />
              <button className="link small" onClick={() => setOpen(allOpen ? new Set() : new Set(shown.map((b) => b.id)))}>
                {allOpen ? "Collapse all" : "Show every day"}
              </button>
            </div>
            <Blocks open={open} toggle={toggle} />
            <Extras />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */
function diffText(cost: number, days: number) {
  const parts: string[] = [];
  const c = Math.abs(cost);
  if (c >= 1) parts.push((cost > 0 ? "+" : "\u2212") + "\u20b9" + fmtNum(c));
  if (days) parts.push((days > 0 ? "+" : "\u2212") + Math.abs(days) + (Math.abs(days) === 1 ? " day" : " days"));
  return parts.join(" · ");
}

/** "saves ₹3,000 and a day", "adds ₹4,000 and a day", "costs ₹9,000 more" */
function effectText(cost: number, days: number) {
  const money = "\u20b9" + fmtNum(Math.abs(cost));
  const d = Math.abs(days) === 1 ? "a day" : Math.abs(days) + " days";
  if (cost < 0 && days < 0) return "saves " + money + " and " + d;
  if (cost < 0 && days > 0) return "saves " + money + ", adds " + d;
  if (cost < 0) return "saves " + money;
  if (days < 0 && cost > 0) return "saves " + d + ", costs " + money + " more";
  if (days < 0) return "saves " + d;
  if (cost > 0 && days > 0) return "adds " + money + " and " + d;
  if (cost > 0) return "costs " + money + " more";
  if (days > 0) return "adds " + d;
  return "same cost and length";
}

interface BlockData {
  first: number;
  last: number;
  days: Day[];
  cost: number;
}

function useBlockData() {
  const { st, m } = useTrip();
  return useMemo(() => {
    const out: Record<string, BlockData> = {};
    const owner = dayBlocks(m.flat);
    m.flat.forEach((f, i) => {
      const b = (out[owner[i]] ||= { first: f.day, last: f.day, days: [], cost: 0 });
      b.last = f.day;
      b.days.push(f);
      b.cost += cardCost(st, f.id).v;
    });
    return out;
  }, [st, m]);
}

/** "A free day in Pokhara" -> "the free day in Pokhara" */
const the = (t: string) => "the " + lower(t.replace(/^(A|An) /, ""));

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/* ================================================================== */
/* Goal panel: total, what matters most, what changed                  */
/* ================================================================== */
function GoalPanel() {
  const { st, m, update } = useTrip();
  const [last, setLast] = useLocal<Goal | null>(KEYS.goal, null, (raw) => GOALS.find((g) => g.id === raw)?.id ?? null);
  const mine = useMemo(() => metrics(st, MY_PLAN), [st]);
  const active = useMemo(() => matchingGoal(st, last), [st, last]);
  const edited = !active && last && last !== "mine" ? last : null;
  const shown = GOALS.find((g) => g.id === (active || edited));

  const pick = (g: Goal) => {
    setLast(g);
    update((d) => {
      d.choices = goalChoices(d, g);
    });
  };

  // Blocks that differ from my plan, with what each change does on its own.
  const changes = useMemo(
    () =>
      BLOCKS.filter((b) => b.options && blockShown(b, st.choices) && blockOption(b, st.choices) !== myOption(b)).map((b) => {
        const back = metrics(st, { ...st.choices, ...b.options![myOption(b)].set });
        return { b, label: b.options![blockOption(b, st.choices)]?.label, cost: m.cost - back.cost, days: m.days - back.days };
      }),
    [st, m],
  );

  return (
    <div className="gp">
      <div className="gp-total">
        <p className="eyebrow">Per person, in Indian rupees{st.people > 1 ? " · " + st.people + " people: " + moneyShort(m.cost * st.people) : ""}</p>
        <p className="gp-money">{money(m.cost)}</p>
        <p className="gp-npr">about {npr(st, m.cost)} in Nepali rupees</p>
        <p className="gp-meta">
          {m.days} days · {fmtNum(m.km)} km on foot · up to {elev(m.maxAlt)}
        </p>
        <p className={"gp-diff" + (active === "mine" ? "" : m.cost - mine.cost <= 0 ? " less" : " more")}>
          {active === "mine" ? "This is my plan." : (diffText(m.cost - mine.cost, m.days - mine.days) || "Same cost and length") + " compared with my plan"}
        </p>
      </div>

      <p className="gp-ask">What matters most to you?</p>
      <div className="goals" role="radiogroup" aria-label="What matters most">
        {GOALS.map((g) => (
          <button
            key={g.id}
            role="radio"
            aria-checked={active === g.id}
            className={"goal" + (active === g.id ? " on" : "") + (edited === g.id ? " edited" : "")}
            onClick={() => pick(g.id)}
          >
            {g.label}
            {active === g.id && <motion.span className="goal-pill" layoutId="goal-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
          </button>
        ))}
      </div>
      <p className="gp-hint">
        {active ? shown!.hint : edited ? "Based on “" + shown!.label + "”, with your own changes. Tap it again to reset." : "Your own mix. Tap one to start from it."}
      </p>

      <AnimatePresence initial={false}>
        {changes.length > 0 && (
          <motion.div className="changes" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <p className="changes-head">Changed from my plan</p>
            <ul>
              <AnimatePresence initial={false}>
                {changes.map((c) => (
                  <motion.li key={c.b.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span className="ch-text">
                      <span className="ch-title">
                        {c.b.kind === "optional" ? (c.label === "Skip" ? "Skipping " : "Including ") + the(c.b.title) : c.b.title + ": " + c.label}
                      </span>
                      <span className={"ch-effect" + (c.cost < 0 ? " good" : c.cost > 0 ? " more" : "")}>{effectText(c.cost, c.days)}</span>
                    </span>
                    <button
                      className="link small"
                      onClick={() => update((d) => void (d.choices = { ...d.choices, ...c.b.options![myOption(c.b)].set }))}
                      aria-label={"Back to my pick for " + c.b.title}
                    >
                      my pick
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/* The blocks                                                          */
/* ================================================================== */
function Blocks({ open, toggle }: { open: Set<string>; toggle: (id: string) => void }) {
  const { st, m } = useTrip();
  const data = useBlockData();
  // A place gets its story the first time the route sleeps there.
  const firstArrival = useMemo(() => {
    const seen = new Set<string>(["blr"]);
    const out = new Set<number>();
    m.flat.forEach((f) => {
      if (!seen.has(f.to)) out.add(f.day);
      seen.add(f.to);
    });
    return out;
  }, [m.flat]);
  return (
    <ol className="blocks">
      {BLOCKS.filter((b) => blockShown(b, st.choices)).map((b) => (
        <BlockCard key={b.id} b={b} data={data[b.id]} open={open.has(b.id)} onToggle={() => toggle(b.id)} firstArrival={firstArrival} />
      ))}
    </ol>
  );
}

function BlockCard({
  b,
  data,
  open,
  onToggle,
  firstArrival,
}: {
  b: Block;
  data?: BlockData;
  open: boolean;
  onToggle: () => void;
  firstArrival: Set<number>;
}) {
  const { st, m, update } = useTrip();
  const reduce = useReducedMotion();
  const cur = blockOption(b, st.choices);
  const included = !!data;
  const changed = !!b.options && cur !== myOption(b);
  const delta = (o: BlockOption) => {
    const t = metrics(st, { ...st.choices, ...o.set });
    return diffText(t.cost - m.cost, t.days - m.days) || "same";
  };
  const tag = b.kind === "core" ? "Must-do" : b.kind === "optional" ? "Optional" : "Your choice";
  const when = data ? (data.first === data.last ? "Day " + data.first : "Days " + data.first + "\u2013" + data.last) : "Skipped";
  const note = b.kind === "swap" ? b.options![cur]?.note : b.note;
  const nDays = data?.days.length || 0;
  const bodyId = "block-days-" + b.id;

  return (
    <motion.li
      layout="position"
      className={"block kind-" + b.kind + (included ? "" : " off") + (changed ? " changed" : "") + (open ? " open" : "")}
      transition={{ duration: 0.25 }}
      data-day={data?.first}
    >
      <div className="block-top">
        <span className={"block-tag tag-" + b.kind}>{tag}</span>
        {changed && <span className="block-tag tag-changed">Changed</span>}
        <span className="block-when">{when}</span>
        <span className="block-cost">
          {included ? money(data!.cost) : "\u2013"}
          {included && <small>{npr(st, data!.cost)}</small>}
        </span>
      </div>
      <h4 className="block-title">{b.title}</h4>
      {b.options && (
        <div className="options" role="radiogroup" aria-label={b.title} style={{ gridTemplateColumns: `repeat(${b.options.length}, minmax(0, 1fr))` }}>
          {b.options.map((o, i) => {
            const on = i === cur;
            return (
              <button
                key={o.label}
                role="radio"
                aria-checked={on}
                className={"option" + (on ? " on" : "") + (b.kind === "optional" && o.label === "Skip" ? " skip" : "")}
                onClick={() => update((d) => void (d.choices = { ...d.choices, ...o.set }))}
              >
                <span className="option-label">
                  {o.label}
                  {i === myOption(b) && <span className="pick-dot" title="My pick" />}
                </span>
                <span className="option-delta">{on ? "chosen" : delta(o)}</span>
              </button>
            );
          })}
        </div>
      )}
      {note && <p className="block-note">{note}</p>}
      {included && (
        <button className="block-more" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
          <span>{open ? "Hide the details" : nDays === 1 ? "Show the day" : "Show the " + nDays + " days"}</span>
          <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Icon name="down" size={16} />
          </motion.span>
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && included && (
          <motion.div
            id={bodyId}
            className="block-days"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {data!.days.map((f) => (
              <div key={f.id + f.day} className="block-day">
                <DayRow f={f} />
                {firstArrival.has(f.day) && <ArrivalCard f={f} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Extras() {
  const { st, m, update } = useTrip();
  const ui = useUI();
  const reduce = useReducedMotion();
  const [open, setOpen] = useLocal(KEYS.addonsOpen, true);
  const on = st.addons.length;
  const groups = useMemo(() => {
    const out: [string, string[]][] = [];
    Object.entries(D.addons).forEach(([id, a]) => {
      const g = out.find((x) => x[0] === a.group);
      if (g) g[1].push(id);
      else out.push([a.group, [id]]);
    });
    return out;
  }, []);
  return (
    <section className={"addons" + (open ? " open" : "")} aria-labelledby="addons-title">
      <div className="addons-head">
        <div>
          <h4 className="block-title" id="addons-title">
            Add ons
          </h4>
          <p className="muted small">
            {on ? on + " added · " + money(m.addonCost) + " (" + npr(st, m.addonCost) + ") in the total" : "Not in the total until you tick them. Prices per person."}
          </p>
        </div>
        <button className="block-more" aria-expanded={open} aria-controls="addons-list" onClick={() => setOpen(!open)}>
          <span>{open ? "Hide" : "Show"}</span>
          <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Icon name="down" size={16} />
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="addons-list"
            className="addons-body"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {groups.map(([g, ids]) => (
              <div key={g} className="addon-group">
                <h5 className="mini-sub">{g}</h5>
                <ul>
                  {ids.map((id) => {
                    const a = D.addons[id];
                    const active = st.addons.includes(id);
                    const u = addonUnit(st, id);
                    const n = addonCount(a.per, m);
                    return (
                      <li key={id} className={active ? "on" : ""}>
                        <label className="extra">
                          <input
                            type="checkbox"
                            className="tick"
                            checked={active}
                            onChange={() => update((d) => void (d.addons = active ? d.addons.filter((x) => x !== id) : [...d.addons, id]))}
                          />
                          <span>
                            <span className="extra-title">{a.title}</span>
                            <span className="extra-note">{a.note}</span>
                          </span>
                        </label>
                        <span className="extra-price">
                          {money(u.v * n)}
                          <small className="npr-ref">{npr(st, u.v * n)}</small>
                          <small>{a.per === "trekDay" ? money(u.v) + " a walking day × " + n : a.per === "pokharaNight" ? money(u.v) + " a night × " + n : "once"}</small>
                          <button className="link small" onClick={() => ui.open({ kind: "addon", id })} aria-label={"Edit price of " + a.title}>
                            edit
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PriceNote() {
  const { st, update } = useTrip();
  const ui = useUI();
  const edited = Object.keys(st.edits).length > 0;
  return (
    <p className="muted small">
      Prices are per person in Indian rupees (₹), with Nepali rupees for reference at ₹1 = NPR {st.rate} ·{" "}
      <button className="link" onClick={() => ui.open({ kind: "settings" })}>
        {st.people > 1 ? st.people + " people, rate" : "people and rate"}
      </button>
      {edited && (
        <>
          {" · "}
          <button
            className="link"
            onClick={() => {
              update((d) => void (d.edits = {}));
              ui.toast("Prices back to my defaults");
            }}
          >
            reset prices
          </button>
        </>
      )}
    </p>
  );
}

/* ================================================================== */
/* Days inside a block                                                 */
/* ================================================================== */
function DayRow({ f }: { f: Day }) {
  const { st, m } = useTrip();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const cc = cardCost(st, f.id);
  const date = dayDate(st.start, f.day);
  const notes = f.c.tips || [];
  const warn = notes.some((t) => t.lvl === "warn");
  // A night bus home starts this evening, so tonight is not spent in a bed.
  const sleepNote = f.c.sleepNote || m.flat.find((x) => x.day === f.day + 1)?.c.nightBefore;
  return (
    <div className={"day" + (open ? " open" : "")} data-day={f.day}>
      <div className="day-num" aria-hidden>
        {pad(f.day)}
      </div>
      <div className="day-main">
        <button className="day-head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className="day-title">
            <span className="sr-only">Day {f.day}: </span>
            {f.c.title}
          </span>
          <span className="day-meta">
            {date && <>{fmtDate(date)} · </>}
            {routeNames(f.c, f.to)}
            {legSummary(f.c) && <> · {legSummary(f.c)}</>}
            {sleepNote ? <> · {sleepNote}</> : f.to !== "blr" && <> · sleep {elev(f.alt)}</>}
          </span>
          {(f.ams || notes.length > 0) && (
            <span className="day-flags">
              {f.ams && <span className={"flag " + f.ams}>+{fmtNum(f.gain)} m ({ft(f.gain)} ft) above 3,000 m</span>}
              {notes.length > 0 && <span className={"notes" + (warn ? " warn" : "")}>{notes.length} {notes.length > 1 ? "notes" : "note"}</span>}
            </span>
          )}
          <span className="day-more" aria-hidden>
            {open ? "Hide details" : f.c.legs.length ? "Costs, route and notes" : "Costs and notes"}
            <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <Icon name="down" size={14} />
            </motion.span>
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              className="day-detail"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <DayDetail f={f} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="day-price">
        <span className="price-main">
          {cc.edited && <span className="edited-dot" title="Edited price" />}
          {money(cc.v)}
        </span>
        <small>{npr(st, cc.v)}</small>
      </div>
    </div>
  );
}

function DayDetail({ f }: { f: Day }) {
  const { st, update } = useTrip();
  const ui = useUI();
  const e = st.edits[f.id] || {};
  const setItem = (item: string, v: number, def: number) =>
    update((d) => {
      const inr = Math.round(v);
      d.edits[f.id] = d.edits[f.id] || {};
      if (Math.abs(inr - def) < 1) delete d.edits[f.id][item];
      else d.edits[f.id][item] = inr;
      if (!Object.keys(d.edits[f.id]).length) delete d.edits[f.id];
    });
  return (
    <div className="detail-grid">
      <div>
        <h4 className="mini">Costs per person, in ₹</h4>
        <table className="costs">
          <tbody>
            {f.c.costs.map((it) => {
              const edited = e[it[0]] != null;
              const v = edited ? e[it[0]] : it[2];
              return (
                <tr key={it[0]}>
                  <td>
                    {it[1]}
                    <span className="range">
                      usually {moneyShort(it[3])} to {moneyShort(it[4])}
                    </span>
                    <InlineLinks links={f.c.costLinks?.[it[0]]} />
                  </td>
                  <td>
                    <input
                      key={v}
                      className={edited ? "edited" : ""}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={50}
                      defaultValue={Math.round(v)}
                      aria-label={it[1] + " in Indian rupees"}
                      onBlur={(ev) => {
                        const n = parseFloat(ev.target.value);
                        if (n >= 0 && Math.round(n) !== Math.round(v)) setItem(it[0], n, it[2]);
                      }}
                      onKeyDown={(ev) => ev.key === "Enter" && (ev.target as HTMLInputElement).blur()}
                    />
                    <span className="npr-ref">{npr(st, v)}</span>
                    {edited && (
                      <button className="icon-btn sm" aria-label={"Reset " + it[1]} title={"Back to " + money(it[2])} onClick={() => setItem(it[0], it[2], it[2])}>
                        <Icon name="undo" size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div>
        {f.c.legs.length > 0 && (
          <>
            <h4 className="mini">Getting there</h4>
            <ul className="legs">
              {f.c.legs.map((l, i) =>
                l[0] === l[1] && !l[7] ? null : (
                  <li key={i}>
                    <span className="mode">{l[2]}</span> {P(l[0]).name} to {P(l[1]).name}
                    {l[4] ? " · " + (l[3] === l[4] ? l[3] : l[3] + "–" + l[4]) + " km" : ""}
                    {l[6] ? " · " + (l[5] === l[6] ? l[5] : l[5] + "–" + l[6]) + " h" : ""}
                    {l[7] && <span className="muted"> ({l[7]})</span>}
                    <InlineLinks links={f.c.legLinks?.[String(i)]} />
                  </li>
                ),
              )}
            </ul>
          </>
        )}
        {(f.c.todo || []).length > 0 && (
          <>
            <h4 className="mini">Things to do in {P(f.to).name}</h4>
            <ul className="todo">
              {f.c.todo!.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        {(f.c.tips || []).length > 0 && (
          <>
            <h4 className="mini">Notes</h4>
            <ul className="tips">
              {f.c.tips!.map((t, i) => (
                <li key={i} className={t.lvl}>
                  {t.t}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="detail-links">
          {f.to !== "blr" && (
            <button className="link" onClick={() => ui.open({ kind: "place", id: f.to })}>
              About {P(f.to).name}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

/** Links that belong to one leg or cost line, shown right under it. */
function InlineLinks({ links }: { links?: { label: string; url: string }[] }) {
  if (!links?.length) return null;
  return (
    <span className="inline-links">
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener">
          {l.label}
          <Icon name="arrow" size={12} />
        </a>
      ))}
    </span>
  );
}

/* ---- A stop introduces itself the first time the route sleeps there ---- */
function ArrivalCard({ f }: { f: Day }) {
  const ui = useUI();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  const p = P(f.to);
  const summit = f.to === "abc";
  return (
    <motion.div
      ref={ref}
      className={"arrival" + (summit ? " summit" : "")}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <button className="arrival-photo" onClick={() => ui.open({ kind: "place", id: f.to })} aria-label={"More about " + p.name}>
        <motion.img src={photo(f.to)} alt="" loading="lazy" decoding="async" style={{ y }} />
        {summit && <span className="arrival-alt">{fmtNum(p.alt)} m<small>{ft(p.alt)} ft</small></span>}
      </button>
      <div className="arrival-text">
        <p className="eyebrow">Arrive · {elev(p.alt)}</p>
        <h3>{p.name}</h3>
        <p>{p.blurb}</p>
        {p.facts[0] && <p className="story">{p.facts[0]}</p>}
        <button className="link" onClick={() => ui.open({ kind: "place", id: f.to })}>
          More about {p.name} <Icon name="arrow" size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ---- A slim sticky strip: the marker climbs as you scroll the days ---- */
function TrekStrip({ activeDay }: { activeDay: number }) {
  const { m } = useTrip();
  const W = 400;
  const H = 44;
  const n = m.flat.length;
  const x = (i: number) => (n <= 1 ? W / 2 : 6 + ((W - 12) * i) / (n - 1));
  const y = (a: number) => H - 4 - ((H - 10) * a) / 4400;
  const pts = m.flat.map((f, i) => [x(i), y(f.alt)] as const);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = pts.length ? "M" + x(0) + "," + H + " L" + line.replace(/ /g, " L") + " L" + x(n - 1) + "," + H + " Z" : "";
  const idx = Math.min(Math.max(activeDay - 1, 0), Math.max(n - 1, 0));
  const f = m.flat[idx];
  const cx = useSpring(pts[idx]?.[0] ?? 0, { stiffness: 160, damping: 24 });
  const cy = useSpring(pts[idx]?.[1] ?? 0, { stiffness: 160, damping: 24 });
  const alt = useSpring(f?.alt ?? 0, { stiffness: 120, damping: 22 });
  const altText = useTransform(alt, (v) => ft(v) + " ft");
  const left = useTransform(cx, (v) => (v / W) * 100 + "%");
  const top = useTransform(cy, (v) => (v / H) * 100 + "%");
  useEffect(() => {
    if (!pts[idx]) return;
    cx.set(pts[idx][0]);
    cy.set(pts[idx][1]);
    alt.set(f.alt);
  });
  if (!n || !f) return null;
  return (
    <div className="strip-alt" aria-hidden>
      <div className="sa-text">
        <span className="eyebrow">Day {f.day}</span>
        <span className="sa-place">{P(f.to).name}</span>
      </div>
      <div className="sa-chart">
        <svg viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" className="sa-svg">
          <line x1="0" x2={W} y1={y(3000)} y2={y(3000)} className="trek-3k" vectorEffect="non-scaling-stroke" />
          <path d={area} className="trek-area" />
          <polyline points={line} className="trek-line" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.span className="sa-dot" style={{ left, top }} />
      </div>
      <motion.span className="sa-alt">{altText}</motion.span>
    </div>
  );
}
