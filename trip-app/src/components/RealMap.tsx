import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { D } from "../data";
import { elev } from "../format";
import { P } from "../model";
import { useTrip } from "../store";
import { useUI } from "../ui";

/** Leaflet + OpenTopoMap. Loaded as its own chunk only when this view is opened. */
export default function RealMap() {
  const { m } = useTrip();
  const ui = useUI();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [offline] = useState(() => !navigator.onLine);

  useEffect(() => {
    if (!el.current) return;
    const mp = L.map(el.current, { scrollWheelZoom: false, zoomControl: true });
    map.current = mp;
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 16,
      crossOrigin: true,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    }).addTo(mp);
    fit("trek");
    return () => {
      mp.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mp = map.current;
    if (!mp) return;
    const layer = L.layerGroup().addTo(mp);
    const on = new Set<string>();
    m.flat.forEach((f) =>
      f.c.legs.forEach((l) => {
        on.add(l[0]).add(l[1]);
        if (l[0] === l[1]) return;
        const style =
          l[2] === "trek"
            ? { color: "#1d4ed8", weight: 4 }
            : l[2] === "flight"
              ? { color: "#0f1720", weight: 1.5, dashArray: "6 6" }
              : { color: "#0f1720", weight: 2, dashArray: "1 6" };
        L.polyline([P(l[0]).ll, P(l[1]).ll], style).addTo(layer);
      }),
    );
    Object.entries(D.places).forEach(([id, p]) => {
      L.circleMarker(p.ll, { radius: on.has(id) ? 6 : 4, color: "#fff", weight: 2, fillColor: on.has(id) ? "#0f1720" : "#8a94a3", fillOpacity: 1 })
        .addTo(layer)
        .bindTooltip(p.name + " · " + elev(p.alt))
        .on("click", () => ui.open({ kind: "place", id }));
    });
    return () => {
      layer.remove();
    };
  }, [m, ui]);

  function fit(which: "trek" | "all") {
    const ids = Object.keys(D.places).filter((id) => which === "all" || (D.places[id].region === "trek" && id !== "pokhara"));
    map.current?.fitBounds(ids.map((id) => P(id).ll), { padding: [24, 24] });
  }

  return (
    <div className="map-frame real">
      <div ref={el} className="leaflet-box" />
      <div className="map-tools">
        <button onClick={() => fit("trek")}>Trek</button>
        <button onClick={() => fit("all")}>Whole journey</button>
      </div>
      {offline && <p className="map-note">Offline: only areas you have viewed before will show. The trail map always works.</p>}
    </div>
  );
}
