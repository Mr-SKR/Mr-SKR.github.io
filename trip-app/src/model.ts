/**
 * Pure trip logic: no React, no DOM.
 *
 * The plan is a handful of choices (see CHOICES). `buildPlan` turns them into
 * the list of days; `metrics` measures that list. Everything takes the state
 * it needs as an argument, which is what lets the page price every
 * alternative instantly and the tests pin the plan's totals.
 */
import { D } from "./data";
import type { Card, Choices, CostItem, Day, Metrics, Place, Road, TripState } from "./types";

export function P(id: string): Place {
  return (
    D.places[id] || {
      name: id,
      short: id,
      alt: 0,
      ll: [0, 0],
      map: [0, 0],
      label: "right",
      region: "gateway",
      blurb: "",
      facts: [],
      notes: {},
      wiki: "",
    }
  );
}

/* ================================================================== */
/* Choices                                                             */
/* ================================================================== */

/** Suresh's own plan: the defaults everyone starts from. */
export const MY_PLAN: Choices = {
  arrive: "ktm-fly",
  ktmDay: true,
  pokhara: 2,
  pace: "standard",
  down: "slow",
  buffer: true,
  home: "gop",
};

export interface ChoiceOption<V> {
  v: V;
  label: string;
  note: string;
}

export interface ChoiceDef<K extends keyof Choices = keyof Choices> {
  key: K;
  title: string;
  /** Toggles render as a switch; the rest as a segmented control. */
  toggle?: { note: string };
  options?: ChoiceOption<Choices[K]>[];
  /** Hidden when it would not change anything. */
  show?: (c: Choices) => boolean;
}

export const CHOICES: ChoiceDef[] = [
  {
    key: "arrive",
    title: "Getting to Pokhara",
    options: [
      { v: "gop", label: "Gorakhpur", note: "Fly to Gorakhpur, cross at Sonauli, night bus to Pokhara." },
      { v: "ktm-bus", label: "Kathmandu, bus", note: "Fly to Kathmandu, tourist bus to Pokhara the same day." },
      { v: "ktm-fly", label: "Kathmandu, fly", note: "Fly to Kathmandu, then a 30 minute hop to Pokhara." },
    ],
  },
  {
    key: "ktmDay",
    title: "A day in Kathmandu",
    toggle: { note: "See the city and get the trek permit before going on to Pokhara." },
    show: (c) => c.arrive !== "gop",
  },
  {
    key: "pokhara",
    title: "Free day in Pokhara after the trek",
    options: [
      { v: 2, label: "Include", note: "A slow day by the lake once you are back down." },
      { v: 1, label: "Skip", note: "Head home straight after the trek (and any spare day)." },
    ],
  },
  {
    key: "pace",
    title: "Walking up",
    options: [
      { v: "standard", label: "4 days", note: "Nights in Ghandruk, Chhomrong, Dovan and Deurali." },
      { v: "fast", label: "3 days", note: "Skips the Chhomrong night. Longer days, a bigger climb." },
    ],
  },
  {
    key: "down",
    title: "Walking down",
    options: [
      { v: "slow", label: "3 days", note: "Via the hot springs at Jhinu Danda." },
      { v: "fast", label: "2 days", note: "Straight down to the jeep road. One long day." },
    ],
  },
  {
    key: "buffer",
    title: "Spare day for the trek",
    toggle: { note: "Held back in case weather or altitude slows the trek." },
  },
  {
    key: "home",
    title: "Getting home",
    options: [
      { v: "gop", label: "Gorakhpur", note: "Night bus to the border, cross, fly home from Gorakhpur." },
      { v: "ktm", label: "Kathmandu", note: "Fly Pokhara to Kathmandu and connect home the same day." },
    ],
  },
];

/** The day cards a set of choices produces, in order. */
export function daysFor(c: Choices): string[] {
  const ids: string[] = [];
  if (c.arrive === "gop") ids.push("arr-gop", "pkr-permits");
  else if (c.ktmDay) ids.push("arr-ktm", "ktm-explore", c.arrive === "ktm-bus" ? "pkr-arrive-bus" : "pkr-arrive-fly");
  else ids.push(c.arrive === "ktm-bus" ? "arr-ktm-bus" : "arr-ktm-fly", "pkr-permits");
  ids.push("up-kimche-ghandruk");
  if (c.pace === "standard") ids.push("up-ghandruk-chhomrong", "up-chhomrong-dovan", "up-dovan-deurali");
  else ids.push("up-ghandruk-sinuwa", "up-sinuwa-deurali");
  ids.push("top-deurali-abc");
  ids.push("down-abc-bamboo");
  if (c.down === "slow") ids.push("down-bamboo-jhinu", "down-jhinu-pokhara");
  else ids.push("down-bamboo-pokhara");
  if (c.buffer) ids.push("buf-pokhara");
  if (c.pokhara === 2) ids.push("pkr-explore");
  if (c.home === "gop") ids.push("home-gop");
  else ids.push("home-ktm-direct");
  return ids;
}

/* ================================================================== */
/* State                                                               */
/* ================================================================== */
export function defaultState(): TripState {
  return {
    choices: { ...MY_PLAN },
    addons: [],
    edits: {},
    rate: D.inrToNpr,
    people: 1,
    road: "bus",
    roads: {},
    start: D.defaultStartDate,
  };
}

/**
 * Price edits keep only known cards and their cost items, known add ons (as
 * "addon:<id>" with a single `v`), and finite amounts of zero or more. Anything
 * else would turn totals into string concatenation or NaN, and then persist.
 */
function sanitizeEdits(raw: unknown): TripState["edits"] {
  const out: TripState["edits"] = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  const ok = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;
  for (const [id, e] of Object.entries(raw as Record<string, unknown>)) {
    if (!e || typeof e !== "object") continue;
    const items = e as Record<string, unknown>;
    if (id.startsWith("addon:")) {
      if (Object.hasOwn(D.addons, id.slice(6)) && ok(items.v)) out[id] = { v: items.v };
      continue;
    }
    if (!Object.hasOwn(D.cards, id)) continue;
    const keep: Record<string, number> = {};
    for (const it of D.cards[id].costs) if (ok(items[it[0]])) keep[it[0]] = items[it[0]] as number;
    if (Object.keys(keep).length) out[id] = keep;
  }
  return out;
}

/** Rebuild a state from untrusted input (storage, share links), keeping only what is valid. */
export function sanitize(raw: unknown): TripState {
  const out = defaultState();
  if (!raw || typeof raw !== "object") return out;
  const st = raw as Partial<TripState>;
  if (st.choices && typeof st.choices === "object") {
    const c = { ...MY_PLAN };
    for (const def of CHOICES) {
      const v = (st.choices as unknown as Record<string, unknown>)[def.key];
      const ok = def.toggle ? typeof v === "boolean" : def.options!.some((o) => o.v === v);
      if (ok) (c as unknown as Record<string, unknown>)[def.key] = v;
    }
    out.choices = c;
  }
  if (Array.isArray(st.addons)) out.addons = [...new Set(st.addons.filter((a) => typeof a === "string" && Object.hasOwn(D.addons, a)))];
  out.edits = sanitizeEdits(st.edits);
  // Prices are always INR now; NPR is shown alongside as a reference.
  if (typeof st.rate === "number" && st.rate > 0) out.rate = st.rate;
  if (typeof st.people === "number" && st.people >= 1) out.people = Math.min(30, Math.floor(st.people));
  const isRoad = (v: unknown): v is Road => v === "bus" || v === "car";
  if (isRoad(st.road)) out.road = st.road;
  if (st.roads && typeof st.roads === "object")
    for (const [id, v] of Object.entries(st.roads)) if (Object.hasOwn(D.cards, id) && hasRoadChoice(id) && isRoad(v) && v !== out.road) out.roads[id] = v;
  if (st.start === null || (typeof st.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(st.start))) out.start = st.start;
  return out;
}

/* ================================================================== */
/* Plan: the day cards in order                                        */
/* ================================================================== */
export interface Plan {
  ids: string[];
}

export const card = (id: string): Card => D.cards[id];

export function buildPlan(choices: Choices): Plan {
  return { ids: daysFor(choices) };
}

export function flatten(plan: Plan): Day[] {
  const out: Day[] = [];
  plan.ids.forEach((id, i) => {
    const c = card(id);
    if (!c) return;
    out.push({ si: i, ci: 0, id, c, from: c.from as string, to: c.to as string, day: out.length + 1, alt: 0, gain: 0 });
  });
  return out;
}

type RoadSt = Pick<TripState, "road" | "roads">;
type CostSt = Pick<TripState, "edits" | "people"> & RoadSt;

/** How this day's road legs are done: its own choice, or the default. */
export const roadFor = (st: RoadSt, id: string): Road => st.roads[id] ?? st.road;

/**
 * Each person's share of something priced per room, vehicle or porter: a
 * group of 3 needs 2 rooms of 2, so each pays 2/3 of a room.
 */
export function shareOf(people: number, cap?: number) {
  if (!cap) return 1;
  const n = Math.max(1, people);
  return Math.ceil(n / cap) / n;
}

/**
 * Each person's part of one cost line at `price` for one. A full room costs
 * `full`, the same amount more than for one across the usual range. An edited
 * price is what the room costs however many share it.
 */
export function itemCost(people: number, it: CostItem, price: number, edited = false) {
  const o = it[5];
  if (!o?.cap) return price;
  const full = edited || !o.full ? price : price + o.full - it[2];
  const n = Math.max(1, people);
  return (Math.floor(n / o.cap) * full + (n % o.cap ? price : 0)) / n;
}

/** The cost lines that count for the way the group travels. */
export function costItems(st: RoadSt, id: string) {
  const road = roadFor(st, id);
  return (card(id)?.costs || []).filter((it) => !it[5]?.road || it[5].road === road);
}

/** Does this day change with the bus or car choice? */
export const hasRoadChoice = (id: string) => (card(id)?.costs || []).some((it) => it[5]?.road);

/**
 * Per person: shared rooms and vehicles are split between the people
 * travelling. Each line is rounded to the rupee, so the day is the sum of the
 * lines shown and the trip the sum of the days.
 */
export function cardCost(st: CostSt, id: string) {
  const e = st.edits[id] || {};
  const r = { v: 0, lo: 0, hi: 0, edited: false };
  costItems(st, id).forEach((it) => {
    const ed = e[it[0]];
    const at = (price: number) => Math.round(itemCost(st.people, it, price, ed != null));
    if (ed != null) {
      r.v += at(ed);
      r.lo += at(ed);
      r.hi += at(ed);
      r.edited = true;
    } else {
      r.v += at(it[2]);
      r.lo += at(it[3]);
      r.hi += at(it[4]);
    }
  });
  return r;
}

/** The price of one unit of an add on (one porter for a day, one policy), before any split. */
export function addonUnit(st: Pick<TripState, "edits">, id: string) {
  const a = D.addons[id];
  const e = st.edits["addon:" + id];
  if (e && e.v != null) return { v: e.v, lo: e.v, hi: e.v, edited: true };
  return { v: a.inr, lo: a.min, hi: a.max, edited: false };
}

export function addonCount(per: string, m: Pick<Metrics, "trekDays" | "pkrNights">) {
  return per === "trekDay" ? m.trekDays : per === "pokharaNight" ? m.pkrNights : 1;
}

/**
 * What one person pays for an add on: their share of one unit, rounded to the
 * rupee, times how many days or nights it runs, so the shown sum adds up.
 */
export function addonCost(st: Pick<TripState, "edits" | "people">, id: string, m: Pick<Metrics, "trekDays" | "pkrNights">) {
  const a = D.addons[id];
  const unit = addonUnit(st, id);
  const split = shareOf(st.people, a.cap);
  const count = addonCount(a.per, m);
  const each = (v: number) => Math.round(v * split);
  return { unit, split, count, each: each(unit.v), v: each(unit.v) * count, lo: each(unit.lo) * count, hi: each(unit.hi) * count };
}

export function metrics(st: TripState, choices: Choices = st.choices): Metrics & { plan: Plan } {
  const plan = buildPlan(choices);
  const flat = flatten(plan);
  const m: Metrics & { plan: Plan } = {
    plan,
    flat,
    days: flat.length,
    cost: 0,
    lo: 0,
    hi: 0,
    km: 0,
    maxAlt: 0,
    maxAt: null,
    travelHours: 0,
    trekDays: 0,
    pkrNights: 0,
    ams: [],
    amsScore: 0,
    breaks: [],
    abc: false,
    comfort: 0,
    comfortRaw: 0,
    addonCost: 0,
  };
  let prevAlt: number | null = null;
  let rested = false;
  let comfortSum = 0;
  flat.forEach((f, i) => {
    const cc = cardCost(st, f.id);
    m.cost += cc.v;
    m.lo += cc.lo;
    m.hi += cc.hi;
    comfortSum += f.c.comfort || 3;
    if (f.c.type === "trek") m.trekDays++;
    if (f.to === "pokhara") m.pkrNights++;
    (f.c.legs || []).forEach((l) => {
      if (l[2] === "trek") m.km += (l[3] + l[4]) / 2;
      else m.travelHours += (l[5] + l[6]) / 2;
    });
    if (i > 0 && flat[i - 1].to !== f.from) m.breaks.push({ i, si: f.si, from: flat[i - 1].to, to: f.from });
    const alt = P(f.to).alt;
    f.alt = alt;
    f.gain = prevAlt == null ? 0 : alt - prevAlt;
    if (alt > m.maxAlt) {
      m.maxAlt = alt;
      m.maxAt = f.to;
    }
    if (f.to === "abc") m.abc = true;
    // Above 3,000 m the usual guideline is to sleep no more than ~500 m higher
    // each night. A rest night at the same height softens the next jump.
    if (prevAlt != null && alt >= 3000 && f.gain > 500) {
      const lvl = f.gain > 700 && !rested ? "bad" : "warn";
      m.ams.push({ i, day: f.day, gain: f.gain, to: f.to, lvl, si: f.si });
      f.ams = lvl;
    }
    rested = f.gain === 0 && alt >= 2500;
    prevAlt = alt;
  });
  let bonus = 0;
  st.addons.forEach((id) => {
    const a = D.addons[id];
    if (!a) return;
    const c = addonCost(st, id, m);
    m.cost += c.v;
    m.lo += c.lo;
    m.hi += c.hi;
    m.addonCost += c.v;
    bonus += a.comfort || 0;
  });
  m.comfortRaw = flat.length ? comfortSum / flat.length + bonus : 0;
  m.comfort = Math.min(5, m.comfortRaw);
  m.amsScore = m.ams.reduce((s, a) => s + (a.lvl === "bad" ? 2 : 1), 0);
  return m;
}

/* ================================================================== */
/* Quick picks: every combination is checked, so these are exact        */
/* ================================================================== */
export function allChoices(): Choices[] {
  let combos: Choices[] = [{ ...MY_PLAN }];
  for (const def of CHOICES) {
    const values: unknown[] = def.toggle ? [true, false] : def.options!.map((o) => o.v);
    combos = combos.flatMap((c) => values.map((v) => ({ ...c, [def.key]: v }) as Choices));
  }
  // Drop combinations that only differ in a hidden choice.
  const seen = new Set<string>();
  return combos.filter((c) => {
    const key = CHOICES.filter((d) => !d.show || d.show(c))
      .map((d) => String(c[d.key]))
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type QuickPick = "mine" | "cheapest" | "shortest";

export function quickPick(st: TripState, which: QuickPick): Choices {
  if (which === "mine") return { ...MY_PLAN };
  const base = st;
  let best: { c: Choices; cost: number; days: number; hours: number } | null = null;
  for (const c of allChoices()) {
    const m = metrics(base, c);
    const better =
      !best ||
      (which === "cheapest"
        ? m.cost < best.cost - 0.5 || (Math.abs(m.cost - best.cost) < 0.5 && m.days < best.days)
        : m.days < best.days ||
          (m.days === best.days && (m.travelHours < best.hours - 0.25 || (Math.abs(m.travelHours - best.hours) < 0.25 && m.cost < best.cost - 0.5))));
    if (better) best = { c, cost: m.cost, days: m.days, hours: m.travelHours };
  }
  return best!.c;
}

export function sameChoices(a: Choices, b: Choices) {
  return CHOICES.every((d) => (d.show && !d.show(a) && !d.show(b)) || a[d.key] === b[d.key]);
}

/* ================================================================== */
/* Places, climate                                                     */
/* ================================================================== */
export function climateFor(pid: string, month: number) {
  const c = D.climate;
  const drop = (6.5 * (P(pid).alt - P(c.base).alt)) / 1000;
  return { hi: Math.round(c.max[month] - drop), lo: Math.round(c.min[month] - drop), rain: c.rain[month] };
}

/* ================================================================== */
/* Share links                                                         */
/* ================================================================== */
export interface ShareV2 {
  v: 2;
  c: Choices;
  a: string[];
  e: TripState["edits"];
  /** Group size and how it gets around, since both change the price each. Older links have none. */
  p?: number;
  r?: Road;
  rs?: TripState["roads"];
}

export function shareState(st: TripState): ShareV2 {
  return { v: 2, c: st.choices, a: st.addons, e: st.edits, p: st.people, r: st.road, rs: st.roads };
}

const b64u = (bytes: Uint8Array) => {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const unb64u = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};

export async function encodeShare(sh: ShareV2): Promise<string> {
  const json = JSON.stringify(sh);
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      return "z" + b64u(new Uint8Array(await new Response(stream).arrayBuffer()));
    } catch {
      /* fall back to plain */
    }
  }
  return "j" + b64u(new TextEncoder().encode(json));
}

export async function decodeShare(code: string): Promise<ShareV2> {
  const bytes = unb64u(code.slice(1));
  if (code[0] === "z") {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return JSON.parse(await new Response(stream).text());
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function importShare(st: TripState, sh: ShareV2): TripState {
  if (!sh || sh.v !== 2) throw new Error("bad share");
  return sanitize({
    ...st,
    people: sh.p ?? st.people,
    road: sh.r ?? st.road,
    roads: sh.r ? sh.rs || {} : st.roads,
    choices: sh.c,
    addons: sh.a,
    edits: { ...st.edits, ...(sh.e || {}) },
  });
}

/* ================================================================== */
/* Blocks: the plan as a few building blocks, each must-do, optional   */
/* or swappable. Goals turn into concrete remove/swap suggestions.     */
/* ================================================================== */
export interface BlockOption {
  label: string;
  note: string;
  set: Partial<Choices>;
}

export interface Block {
  id: string;
  title: string;
  kind: "core" | "optional" | "swap";
  note?: string;
  /** Optional blocks: [keep, skip]. Swappable: the alternatives. */
  options?: BlockOption[];
  /** Hidden when it does not apply to the current choices. */
  show?: (c: Choices) => boolean;
}

export const blockShown = (b: Block, c: Choices) => !b.show || b.show(c);

export const BLOCKS: Block[] = [
  {
    id: "arrive",
    title: "Getting to Pokhara",
    kind: "swap",
    options: [
      { label: "Kathmandu, then fly", note: "Fly to Kathmandu, then a 30 minute hop to Pokhara.", set: { arrive: "ktm-fly" } },
      { label: "Kathmandu, then bus", note: "Fly to Kathmandu, then a 7 to 8 hour tourist bus to Pokhara.", set: { arrive: "ktm-bus" } },
      { label: "Via Gorakhpur", note: "Fly to Gorakhpur, cross at Sonauli, night bus to Pokhara.", set: { arrive: "gop" } },
    ],
  },
  {
    id: "ktm",
    title: "A day in Kathmandu",
    kind: "optional",
    note: "Before Pokhara: Swayambhunath, Boudhanath, Pashupatinath and Durbar Square, and a chance to get the trek permit.",
    show: (c) => c.arrive !== "gop",
    options: [
      { label: "Include", note: "", set: { ktmDay: true } },
      { label: "Skip", note: "", set: { ktmDay: false } },
    ],
  },
  { id: "permits", title: "Permits and gear in Pokhara", kind: "core", note: "ACAP permit, gear rental and your last proper ATM. The rest of the day is free for Pokhara." },
  {
    id: "up",
    title: "Walking up to Deurali",
    kind: "swap",
    options: [
      { label: "4 days", note: "Nights in Ghandruk, Chhomrong, Dovan and Deurali.", set: { pace: "standard" } },
      { label: "3 days", note: "Skips the Chhomrong night. Longer days and a steeper climb.", set: { pace: "fast" } },
    ],
  },
  { id: "abc", title: "Annapurna Base Camp", kind: "core", note: "The goal: a night at 4,130 m under the south face of Annapurna I." },
  {
    id: "down",
    title: "Walking down",
    kind: "swap",
    options: [
      { label: "3 days", note: "Via the hot springs at Jhinu Danda, back to Pokhara.", set: { down: "slow" } },
      { label: "2 days", note: "Straight down to the jeep road. One long day.", set: { down: "fast" } },
    ],
  },
  {
    id: "buffer",
    title: "Spare day for the trek",
    kind: "optional",
    note: "Held back in case snow, rain or altitude slows the trek. Unused, it becomes an extra day in Pokhara.",
    options: [
      { label: "Include", note: "", set: { buffer: true } },
      { label: "Skip", note: "", set: { buffer: false } },
    ],
  },
  {
    id: "pokhara",
    title: "A free day in Pokhara",
    kind: "optional",
    note: "After the trek: Phewa Lake, the Peace Pagoda, paragliding if you fancy it.",
    options: [
      { label: "Include", note: "", set: { pokhara: 2 } },
      { label: "Skip", note: "", set: { pokhara: 1 } },
    ],
  },
  {
    id: "home",
    title: "Getting home",
    kind: "swap",
    options: [
      { label: "Via Gorakhpur", note: "Night bus to the border on your last evening in Pokhara, cross in the morning, fly home from Gorakhpur.", set: { home: "gop" } },
      { label: "Via Kathmandu", note: "Fly Pokhara to Kathmandu and connect home the same day.", set: { home: "ktm" } },
    ],
  },
];

const CARD_BLOCK: Record<string, string> = {
  "arr-gop": "arrive",
  "arr-ktm-bus": "arrive",
  "arr-ktm-fly": "arrive",
  "arr-ktm": "arrive",
  "ktm-explore": "ktm",
  "pkr-arrive-fly": "permits",
  "pkr-arrive-bus": "permits",
  "pkr-permits": "permits",
  "pkr-explore": "pokhara",
  "up-kimche-ghandruk": "up",
  "up-ghandruk-chhomrong": "up",
  "up-chhomrong-dovan": "up",
  "up-dovan-deurali": "up",
  "up-ghandruk-sinuwa": "up",
  "up-sinuwa-deurali": "up",
  "top-deurali-abc": "abc",
  "down-abc-bamboo": "down",
  "down-bamboo-jhinu": "down",
  "down-jhinu-pokhara": "down",
  "down-bamboo-pokhara": "down",
  "buf-pokhara": "buffer",
  "home-gop": "home",
  "home-ktm-direct": "home",
};

export const blockOf = (cardId: string) => CARD_BLOCK[cardId];

/** The block each day belongs to, in order. */
export const dayBlocks = (flat: { id: string }[]): string[] => flat.map((f) => CARD_BLOCK[f.id]);

/** Which option of a block the choices currently match (-1 if none). */
export function blockOption(b: Block, c: Choices) {
  return (b.options || []).findIndex((o) => Object.entries(o.set).every(([k, v]) => c[k as keyof Choices] === v));
}

export const myOption = (b: Block) => blockOption(b, MY_PLAN);

export type Goal = "mine" | "cost" | "days" | "comfort";

export const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: "mine", label: "My plan", hint: "Unhurried: a day in Kathmandu first, a spare day for the trek and a free day in Pokhara after it." },
  { id: "cost", label: "Spend less", hint: "The cheapest version: optional days skipped, cheaper legs picked." },
  { id: "days", label: "Fewer days", hint: "The shortest version, flying via Kathmandu to cut the long bus rides." },
  { id: "comfort", label: "More comfort", hint: "Flights instead of long bus rides, all the rest days kept." },
];

export interface Suggestion {
  block: Block;
  option: BlockOption;
  cost: number;
  days: number;
  hours: number;
  comfort: number;
  ams: number;
  /** Higher is better for the goal. */
  gain: number;
}

function gainFor(goal: Goal, d: { cost: number; days: number; hours: number; comfort: number; ams: number }) {
  switch (goal) {
    case "cost":
      return -d.cost - d.days * 0.01;
    case "days":
      // Fewer days first; with the same days, less time on the road.
      if (d.days < 0) return -d.days * 100000 - d.hours * 100;
      return d.days === 0 && d.hours < -0.5 ? -d.hours : 0;
    case "comfort":
      return d.comfort > 0.01 ? d.comfort : 0;
    case "mine":
      return 0;
  }
}

/** For each block, the single change that helps the goal most. */
export function suggestions(st: TripState, goal: Goal): Suggestion[] {
  const now = metrics(st);
  const out: Suggestion[] = [];
  for (const b of BLOCKS) {
    if (!b.options || !blockShown(b, st.choices)) continue;
    const cur = blockOption(b, st.choices);
    let best: Suggestion | null = null;
    b.options.forEach((o, i) => {
      if (i === cur) return;
      const t = metrics(st, { ...st.choices, ...o.set });
      const d = { cost: t.cost - now.cost, days: t.days - now.days, hours: t.travelHours - now.travelHours, comfort: t.comfortRaw - now.comfortRaw, ams: t.amsScore - now.amsScore };
      const gain = gainFor(goal, d);
      if (gain > 0.5 || (goal === "comfort" && gain > 0)) {
        if (!best || gain > best.gain) best = { block: b, option: o, ...d, gain };
      }
    });
    if (best) out.push(best);
  }
  return out.sort((a, b) => b.gain - a.gain);
}

/** The choices a goal stands for, always worked out from my plan so they never depend on earlier edits. */
export function goalChoices(st: TripState, goal: Goal): Choices {
  if (goal === "mine") return { ...MY_PLAN };
  return applyGoal({ ...st, choices: { ...MY_PLAN } }, goal);
}

/** Whether the current choices are exactly what a goal gives. */
export function goalMatches(st: TripState, goal: Goal) {
  return sameChoices(st.choices, goalChoices(st, goal));
}

/**
 * Which goal (if any) the current choices match exactly. Two goals can land on
 * the same plan (the cheapest is also the shortest), so the one the visitor
 * picked wins when it matches.
 */
export function matchingGoal(st: TripState, prefer?: Goal | null): Goal | null {
  if (prefer && goalMatches(st, prefer)) return prefer;
  return GOALS.find((g) => goalMatches(st, g.id))?.id || null;
}

/** Keep applying the best suggestion until none is left. */
export function applyGoal(st: TripState, goal: Goal): Choices {
  let s = { ...st, choices: { ...st.choices } };
  for (let i = 0; i < 12; i++) {
    const best = suggestions(s, goal)[0];
    if (!best) break;
    s = { ...s, choices: { ...s.choices, ...best.option.set } };
  }
  return s.choices;
}
