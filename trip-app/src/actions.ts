import { D } from "./data";
import { elev, moneyShort, photo } from "./format";
import { encodeShare, metrics, shareState } from "./model";
import { KEYS, load, save } from "./store";
import type { TripState } from "./types";
import { fetchWeather } from "./weather";

interface UILike {
  toast: (msg: string, action?: { label: string; run: () => void }) => void;
  open: (r: { kind: "share"; url: string }) => void;
}

export async function shareRoute(st: TripState, ui: UILike) {
  const code = await encodeShare(shareState(st));
  const url = location.origin + "/trip/#b=" + code;
  const m = metrics(st);
  const text = "My Annapurna Base Camp route: " + moneyShort(st, m.cost) + ", " + m.days + " days, up to " + elev(m.maxAlt);
  if (navigator.share) {
    try {
      await navigator.share({ title: "Annapurna Base Camp", text, url });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    ui.toast("Link copied. Anyone who opens it gets this route.");
  } catch {
    ui.open({ kind: "share", url });
  }
}

export function offlineSavedAt(): number | null {
  return load<{ offlineAt?: number }>(KEYS.ui, {}).offlineAt || null;
}

/** Pull every photo through the service worker so the trail has them all. */
export async function saveOffline(ui: UILike) {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
    ui.toast("Offline mode starts after the first full load. Reload once, then try again.");
    return;
  }
  const urls = Array.from(new Set([...Object.keys(D.places).map(photo), "/trip/img/hero-1920.webp"]));
  ui.toast("Saving photos and forecast...");
  let ok = 0;
  await Promise.all(
    urls.map((u) =>
      fetch(u)
        .then((r) => r.ok && ok++)
        .catch(() => undefined),
    ),
  );
  await fetchWeather(true);
  if (ok === urls.length) {
    save(KEYS.ui, { ...load(KEYS.ui, {}), offlineAt: Date.now() });
    ui.toast("Saved. The whole plan works with no signal.");
  } else {
    ui.toast("Saved " + ok + " of " + urls.length + " photos. Try again on a better connection.");
  }
}
