import { useEffect, useSyncExternalStore } from "react";
import { D } from "./data";
import { P } from "./model";
import { KEYS, load, save } from "./store";

export interface Wx {
  at: number;
  d: Record<string, { t: string[]; hi: number[]; lo: number[]; pr: number[]; sn: number[]; c: number[]; sr: string[] }>;
}

/** A stored forecast, or null if it is missing or not the shape this build writes. */
function cleanWx(raw: unknown): Wx | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Partial<Wx>;
  if (typeof w.at !== "number" || !w.d || typeof w.d !== "object") return null;
  const keys = ["t", "hi", "lo", "pr", "sn", "c", "sr"] as const;
  const d: Wx["d"] = {};
  for (const [id, f] of Object.entries(w.d)) {
    if (Object.hasOwn(D.places, id) && f && keys.every((k) => Array.isArray(f[k]))) d[id] = f;
  }
  return { at: w.at, d };
}

let current: Wx | null = cleanWx(load<unknown>(KEYS.wx, null));
let busy: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

function set(w: Wx) {
  current = w;
  save(KEYS.wx, w);
  listeners.forEach((l) => l());
}

/** Forecast for every place in one Open-Meteo call; kept in localStorage for offline use. */
export function fetchWeather(force = false): Promise<boolean> {
  if (busy) return busy;
  if (!navigator.onLine) return Promise.resolve(false);
  if (!force && current && Date.now() - current.at < 3 * 3600e3) return Promise.resolve(false);
  const ids = Object.keys(D.places);
  const q = (f: (id: string) => number) => ids.map(f).join(",");
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" + q((id) => P(id).ll[0]) +
    "&longitude=" + q((id) => P(id).ll[1]) +
    "&elevation=" + q((id) => P(id).alt) +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,sunrise&timezone=Asia%2FKathmandu&forecast_days=16";
  busy = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((data) => {
      const arr = Array.isArray(data) ? data : [data];
      const out: Wx = { at: Date.now(), d: {} };
      ids.forEach((id, i) => {
        const d = arr[i]?.daily;
        if (d) out.d[id] = { t: d.time, hi: d.temperature_2m_max, lo: d.temperature_2m_min, pr: d.precipitation_sum, sn: d.snowfall_sum, c: d.weather_code, sr: d.sunrise };
      });
      set(out);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      busy = null;
    });
  return busy;
}

export function useWeather() {
  const wx = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
  useEffect(() => {
    fetchWeather();
  }, []);
  return wx;
}

/** WMO weather code to a short word; the UI stays text-only. */
export function wxWord(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Fair";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Snow";
  if (code >= 95) return "Storm";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 80) return "Showers";
  return "Fair";
}
