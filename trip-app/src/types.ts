export type Mode = "flight" | "bus" | "jeep" | "car" | "trek" | "walk";

/** [from, to, mode, kmMin, kmMax, hoursMin, hoursMax, note?] */
export type Leg = [string, string, Mode | string, number, number, number, number, string?];

/** How the group gets between towns: buses and shared jeeps, or a private car or jeep. */
export type Road = "bus" | "car";

/**
 * Optional extras on a cost line. With `per`, the price is for one room or
 * vehicle that up to `cap` people share; `full` is the default price when it
 * is full, if that costs more than for one. With `road`, the line only counts
 * when the group travels that way.
 */
export interface CostOpts {
  per?: string;
  cap?: number;
  full?: number;
  road?: Road;
}

/** [id, label, defaultInr, minInr, maxInr, opts?] */
export type CostItem = [string, string, number, number, number, CostOpts?];

export interface Tip {
  lvl: "warn" | "info";
  t: string;
}

export interface Link {
  label: string;
  url: string;
}

export interface Place {
  name: string;
  short: string;
  alt: number;
  ll: [number, number];
  map: [number, number];
  label: "left" | "right" | "top";
  region: "gateway" | "trek";
  photo?: string;
  blurb: string;
  facts: string[];
  notes: { stay?: string; network?: string; atm?: string };
  wiki: string;
  links?: Link[];
}

export interface Card {
  title: string;
  emoji?: string;
  type: "transit" | "stay" | "trek" | "rest";
  from?: string;
  to?: string;
  comfort: number;
  legs: Leg[];
  costs: CostItem[];
  tips?: Tip[];
  links?: Link[];
  custom?: boolean;
  /** Links shown inline on a leg, keyed by the leg's index. */
  legLinks?: Record<string, Link[]>;
  /** Links shown inline on a cost line, keyed by the cost item id. */
  costLinks?: Record<string, Link[]>;
  /** Replaces "sleep N m" when the night is not spent in a bed (an overnight bus). */
  sleepNote?: string;
  /** The day really starts the evening before (a night bus); the previous day shows this instead of its sleep. */
  nightBefore?: string;
  /** Things to do with the free part of the day. */
  todo?: string[];
}

export interface Addon {
  title: string;
  emoji?: string;
  per: "trip" | "trekDay" | "pokharaNight";
  inr: number;
  min: number;
  max: number;
  comfort: number;
  note: string;
  /** The price is for one of these (a porter, a guide), shared by up to `cap` people. */
  unit?: string;
  cap?: number;
  /** Heading the add-on is listed under. */
  group: string;
}

export interface TripData {
  version: number;
  title: string;
  defaultStartDate: string | null;
  inrToNpr: number;
  places: Record<string, Place>;
  trailLadder: string[];
  cards: Record<string, Card>;
  addons: Record<string, Addon>;
  checklist: { cat: string; rentable?: boolean; items: { id: string; t: string; optional?: boolean }[] }[];
  /** Ticks follow `link` (a checklist item) or, failing that, `id`; never the position. */
  milestones: ({ d: number; t: string; optional?: boolean } & ({ link: string; id?: never } | { id: string; link?: never }))[];
  climate: { base: string; max: number[]; min: number[]; rain: number[] };
  photoCredits: Record<string, [string, string, string]>;
}

/** A slot on the board: a swappable stage (g + o) or a single day card (c). */
export interface Slot {
  u: string;
  g?: string;
  o?: number;
  c?: string;
}

/** The handful of decisions the planner offers. Everything else follows from these. */
export interface Choices {
  arrive: "gop" | "ktm-bus" | "ktm-fly";
  pokhara: 1 | 2;
  pace: "standard" | "fast";
  down: "slow" | "fast";
  buffer: boolean;
  home: "gop" | "ktm";
  /** A day in Kathmandu before going on to Pokhara (Kathmandu arrivals only). */
  ktmDay: boolean;
}

export interface TripState {
  choices: Choices;
  addons: string[];
  edits: Record<string, Record<string, number>>;
  rate: number;
  people: number;
  /** The default for every day; `roads` overrides it day by day. */
  road: Road;
  roads: Record<string, Road>;
  start: string | null;
}

export interface Day {
  si: number;
  ci: number;
  id: string;
  c: Card;
  from: string;
  to: string;
  day: number;
  alt: number;
  gain: number;
  ams?: "warn" | "bad";
  /** Tonight is on a night bus (the next day's `nightBefore`), so no room is paid for. */
  noBed?: string;
}

export interface AmsFlag {
  i: number;
  day: number;
  gain: number;
  to: string;
  lvl: "warn" | "bad";
  si: number;
}

export interface Metrics {
  flat: Day[];
  days: number;
  cost: number;
  lo: number;
  hi: number;
  km: number;
  /** Hours spent on buses, jeeps and planes (walking not counted). */
  travelHours: number;
  maxAlt: number;
  maxAt: string | null;
  trekDays: number;
  pkrNights: number;
  ams: AmsFlag[];
  amsScore: number;
  breaks: { i: number; si: number; from: string; to: string }[];
  abc: boolean;
  comfort: number;
  comfortRaw: number;
  addonCost: number;
}
