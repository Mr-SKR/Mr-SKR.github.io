import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { D } from "../data";
import { dayDate, elev, fmtDate, fmtNum, ft, legSummary, money, moneyShort, npr, photo, routeNames } from "../format";
import { addonCost, addonUnit, BLOCKS, blockOption, blockShown, cardStops, dayBlocks, cardCost, costItems, goalChoices, hasRoadChoice, itemCost, GOALS, matchingGoal, metrics, MY_PLAN, myOption, P, type Block, type BlockOption, type Goal } from "../model";
import { KEYS, useLocal, useTrip } from "../store";
import type { Day } from "../types";
import { useUI } from "../ui";
import { Icon } from "./Icon";
import { RoadPicker } from "./RoadPicker";

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
                {allOpen ? "Collapse all" : "Expand all days"}
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
      b.cost += cardCost(st, f.id, !!f.noBed).v;
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
      {m.amsScore > mine.amsScore && (
        <p className="gp-warn" role="note">
          Climbs faster than my plan: {m.ams.map((a) => "+" + fmtNum(a.gain) + " m to " + P(a.to).short).join(", then ")}. Altitude sickness is much more
          likely. Walking up in 4 days spreads the climb out.
        </p>
      )}

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
  // A place gets its big card the first time the route sleeps there, and a
  // small "on the way" row the first time the route passes it without a night.
  const { firstArrival, passing } = useMemo(() => {
    const slept = new Set<string>([D.home.id]);
    const shown = new Set<string>();
    const firstArrival = new Set<number>();
    const passing = new Map<number, string[]>();
    m.flat.forEach((f) => {
      const pass: string[] = [];
      cardStops(f.c).forEach((id) => {
        if (id === f.to || shown.has(id) || !D.places[id]) return;
        shown.add(id);
        pass.push(id);
      });
      if (pass.length) passing.set(f.day, pass);
      if (!slept.has(f.to)) firstArrival.add(f.day);
      slept.add(f.to);
      shown.add(f.to);
    });
    return { firstArrival, passing };
  }, [m.flat]);
  return (
    <ol className="blocks">
      {BLOCKS.filter((b) => blockShown(b, st.choices)).map((b) => (
        <BlockCard key={b.id} b={b} data={data[b.id]} open={open.has(b.id)} onToggle={() => toggle(b.id)} firstArrival={firstArrival} passing={passing} />
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
  passing,
}: {
  b: Block;
  data?: BlockData;
  open: boolean;
  onToggle: () => void;
  firstArrival: Set<number>;
  passing: Map<number, string[]>;
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
  const bodyId = "block-days-" + b.id;

  // The whole card opens its days. Its own controls keep their clicks, and a
  // drag to select text is not a click. The pill stays the keyboard way in.
  const faceClick = (e: MouseEvent) => {
    if (!included || (e.target as HTMLElement).closest("button, a, input, label") || getSelection()?.toString()) return;
    onToggle();
  };

  return (
    <motion.li
      layout="position"
      className={"block kind-" + b.kind + (included ? "" : " off") + (changed ? " changed" : "") + (open ? " open" : "")}
      transition={{ duration: 0.25 }}
      data-day={data?.first}
    >
      <div className="block-face" onClick={faceClick}>
        <div className="block-top">
          <span className={"block-tag tag-" + b.kind}>{tag}</span>
          {changed && <span className="block-tag tag-changed">Changed</span>}
          {included ? (
            <button className="block-when on" aria-expanded={open} aria-controls={bodyId} title={open ? "Hide the days" : "Show the days"} onClick={onToggle}>
              {when}
              <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <Icon name="down" size={14} />
              </motion.span>
            </button>
          ) : (
            <span className="block-when">{when}</span>
          )}
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
      </div>
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
                {passing.has(f.day) && <OnTheWay ids={passing.get(f.day)!} />}
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
        <button className="addons-toggle" aria-expanded={open} aria-controls="addons-list" onClick={() => setOpen(!open)}>
          <span>{open ? "Hide" : "Show"}</span>
          <span className="disc" aria-hidden>
            <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <Icon name="down" size={16} />
            </motion.span>
          </span>
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
                    const c = addonCost(st, id, m);
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
                          {money(c.v)}
                          <small className="npr-ref">{npr(st, c.v)}</small>
                          <small>
                            {a.per === "trekDay" ? money(c.each) + " a walking day × " + c.count : a.per === "pokharaNight" ? money(c.each) + " a night × " + c.count : "once"}
                            {c.split < 1 && " (your share of " + money(c.unit.v) + ")"}
                          </small>
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
  const { st, m, update } = useTrip();
  const ui = useUI();
  // Only what the plan shows counts: edits to lines or days not in it stay put but are not news.
  const edited = m.flat.some((f) => cardCost(st, f.id, !!f.noBed).edited) || st.addons.some((id) => addonUnit(st, id).edited);
  const mixed = m.flat.some((f) => Object.hasOwn(st.roads, f.id));
  return (
    <p className="muted small">
      Prices are per person in Indian rupees (₹), with rooms and vehicles split between you and Nepali rupees for reference at ₹1 = NPR {st.rate} ·{" "}
      <button className="link" onClick={() => ui.open({ kind: "settings" })}>
        {(st.people > 1 ? st.people + " people" : "Solo") + (st.road === "car" ? " by car and taxi" : " by bus") + (mixed ? ", some days not" : "")}
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
  const { st } = useTrip();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const cc = cardCost(st, f.id, !!f.noBed);
  const date = dayDate(st.start, f.day);
  const notes = f.c.tips || [];
  const warn = notes.some((t) => t.lvl === "warn");
  const sleepNote = f.c.sleepNote || f.noBed;
  const more = f.c.legs.length ? "Costs, route and notes" : "Costs and notes";
  // The row is one big button: its name is the day's title, the rest describes it.
  const uid = useId();
  const hasFlags = !!f.ams || notes.length > 0;
  return (
    <div className={"day" + (open ? " open" : "")} data-day={f.day}>
      <div className="day-num" aria-hidden>
        {pad(f.day)}
      </div>
      <div className="day-main">
        <button
          className="day-head"
          aria-expanded={open}
          aria-labelledby={uid + "t"}
          aria-describedby={uid + "m " + (hasFlags ? uid + "f " : "") + uid + "p"}
          title={open ? "Hide details" : more}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="day-text">
            <span className="day-title" id={uid + "t"}>
              <span className="sr-only">Day {f.day}: </span>
              {f.c.title}
            </span>
            <span className="day-meta" id={uid + "m"}>
              {date && <>{fmtDate(date)} · </>}
              {routeNames(f.c, f.to)}
              {legSummary(f.c) && <> · {legSummary(f.c)}</>}
              {sleepNote ? <> · {sleepNote}</> : f.to !== D.home.id && <> · sleep {elev(f.alt)}</>}
            </span>
            {hasFlags && (
              <span className="day-flags" id={uid + "f"}>
                {f.ams && <span className={"flag " + f.ams}>+{fmtNum(f.gain)} m ({ft(f.gain)} ft) above 3,000 m</span>}
                {notes.length > 0 && <span className={"notes" + (warn ? " warn" : "")}>{notes.length} {notes.length > 1 ? "notes" : "note"}</span>}
              </span>
            )}
          </span>
          <span className="day-side">
            <span className="day-price" id={uid + "p"}>
              <span className="price-main">
                {cc.edited && <span className="edited-dot" title="Edited price" />}
                {money(cc.v)}
              </span>
              <small>{npr(st, cc.v)}</small>
            </span>
            <span className="disc" aria-hidden>
              <motion.span className="chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <Icon name="down" size={14} />
              </motion.span>
            </span>
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
    </div>
  );
}

function DayDetail({ f }: { f: Day }) {
  const { st, update } = useTrip();
  const ui = useUI();
  const e = st.edits[f.id] || {};
  const items = costItems(st, f.id, !!f.noBed);
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
        <h4 className="mini">Costs in ₹</h4>
        <table className="costs">
          <tbody>
            {items.map((it) => {
              const edited = e[it[0]] != null;
              const v = edited ? e[it[0]] : it[2];
              const per = it[5]?.per;
              const each = Math.round(itemCost(st.people, it, v, edited));
              return (
                <tr key={it[0]}>
                  <td>
                    {it[1]}
                    <span className="range">
                      {per ? "a " + per + ", " : ""}usually {moneyShort(it[3])} to {moneyShort(it[4])}
                      {per && each < v && " · " + money(each) + " each"}
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
        {hasRoadChoice(f.id) && <RoadPicker id={f.id} />}
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
          {f.to !== D.home.id && (
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
        {p.story ? (
          <button className="tale-teaser" onClick={() => ui.open({ kind: "place", id: f.to, at: "story" })}>
            <span className="eyebrow">The story · {p.story.title}</span>
            <span className="tale-hook">{p.story.hook}</span>
            <span className="tale-read">
              Read the story <Icon name="arrow" size={14} />
            </span>
          </button>
        ) : (
          p.facts[0] && <p className="story">{p.facts[0]}</p>
        )}
        <button className="link" onClick={() => ui.open({ kind: "place", id: f.to })}>
          More about {p.name} <Icon name="arrow" size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/** Places a day walks or drives through without a night: one compact row each. */
function OnTheWay({ ids }: { ids: string[] }) {
  const ui = useUI();
  return (
    <div className="passing">
      <p className="eyebrow">On the way</p>
      <ul>
        {ids.map((id) => {
          const p = P(id);
          const line = p.story?.hook || p.origin || p.facts[0] || p.blurb;
          return (
            <li key={id}>
              <button className="pass" onClick={() => ui.open({ kind: "place", id, at: p.story ? "story" : undefined })}>
                <img src={photo(id)} alt="" loading="lazy" decoding="async" />
                <span className="pass-text">
                  <span className="pass-name">
                    {p.name} <small>{elev(p.alt)}</small>
                  </span>
                  {line && <span className="pass-line">{line}</span>}
                </span>
                <Icon name="right" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
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
