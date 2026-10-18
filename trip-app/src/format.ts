import { P } from "./model";
import type { Card, TripState } from "./types";

export const DAY_MS = 864e5;

export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Metres in feet, to the nearest 10 ft: 4,130 m is "13,550". */
export const ft = (m: number) => (Math.round((m * 3.28084) / 10) * 10).toLocaleString("en-US");

/** An altitude in both units: "4,130 m (13,550 ft)". */
export const elev = (m: number) => fmtNum(m) + " m (" + ft(m) + " ft)";

/**
 * Every price in the plan is in Indian rupees. Nepali rupees appear only as a
 * reference (via `npr`) for paying on the ground, at the fixed 1 INR = 1.6 NPR
 * peg (or whatever rate the visitor sets).
 */
export function money(_st: Pick<TripState, "rate">, inr: number) {
  return "₹" + fmtNum(inr);
}

export function moneyShort(_st: Pick<TripState, "rate">, inr: number) {
  if (inr >= 100000) return "₹" + parseFloat((inr / 100000).toFixed(2)) + "L";
  if (inr >= 1000) return "₹" + parseFloat((inr / 1000).toFixed(inr >= 10000 ? 0 : 1)) + "K";
  return "₹" + Math.round(inr);
}

/** The same amount in Nepali rupees, for reference: "NPR 1,04,000". */
export function npr(st: Pick<TripState, "rate">, inr: number) {
  return "NPR " + fmtNum(inr * st.rate);
}

export function span(a: number, b: number, unit: string) {
  const r = (x: number) => Math.round(x * 10) / 10;
  return a === b ? r(a) + unit : r(a) + "–" + r(b) + unit;
}

export function parseDate(s: string | null) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isoDate(d: Date) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function dayDate(start: string | null, day: number) {
  const s = parseDate(start);
  return s ? new Date(s.getTime() + (day - 1) * DAY_MS + 3600e3) : null;
}

export function fmtDate(d: Date, withYear = false) {
  return d.toLocaleDateString("en-IN", withYear ? { day: "numeric", month: "short", year: "numeric" } : { weekday: "short", day: "numeric", month: "short" });
}

export function todayStart() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** "BLR → GOP → PKR" for a day's legs, or "Stay in Pokhara". */
export function routeNames(c: Card, to: string) {
  const legs = c.legs || [];
  if (!legs.length) return "Stay in " + P(to).name;
  const names = [legs[0][0]];
  legs.forEach((l) => {
    if (names[names.length - 1] !== l[1]) names.push(l[1]);
  });
  return names.map((n) => P(n).short || P(n).name).join(" → ");
}

export function legSummary(c: Card) {
  let k0 = 0;
  let k1 = 0;
  let h0 = 0;
  let h1 = 0;
  (c.legs || []).forEach((l) => {
    if (l[2] === "trek") {
      k0 += l[3];
      k1 += l[4];
    }
    h0 += l[5];
    h1 += l[6];
  });
  const parts: string[] = [];
  if (k1) parts.push(span(k0, k1, " km"));
  if (h1) parts.push(span(h0, h1, " h"));
  return parts.join(" · ");
}

export const photo = (id: string) => "/trip/img/places/" + (P(id).photo || id) + ".webp";

export function ago(ms: number) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 48) return h + " h ago";
  return Math.round(h / 24) + " days ago";
}
