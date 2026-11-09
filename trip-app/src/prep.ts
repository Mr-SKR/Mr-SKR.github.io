import { D } from "./data";

export interface PrepState {
  done: Record<string, boolean>;
  rent: Record<string, "own" | "rent">;
  ms: Record<string, boolean>;
}

/** Ticks keyed by checklist or milestone id, rebuilt from whatever storage holds. */
export function cleanPrep(raw: unknown): PrepState {
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
