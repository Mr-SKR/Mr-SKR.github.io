import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef } from "react";
import { D } from "../data";
import { ago, dayDate, elev, isoDate, parseDate, photo } from "../format";
import { climateFor, P } from "../model";
import { useTrip } from "../store";
import { useWeather, wxWord } from "../weather";

export function useRoutePlaces() {
  const { m } = useTrip();
  return useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    m.flat.forEach((f) => {
      [f.from, ...f.c.legs.flatMap((l) => [l[0], l[1]]), f.to].forEach((id) => {
        if (!seen.has(id) && D.places[id]) {
          seen.add(id);
          out.push(id);
        }
      });
    });
    return out;
  }, [m.flat]);
}

/* ---------------- The sheet for one place ---------------- */
export function PlaceSheet({ id }: { id: string }) {
  const { st, m } = useTrip();
  const p = P(id);
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll({ container: scroller });
  const y = useTransform(scrollY, [0, 400], [0, reduce ? 0 : 120]);
  const credit = D.photoCredits[p.photo || id];
  const nights = m.flat.filter((f) => f.to === id).map((f) => f.day);

  return (
    <div className="sheet-scroll" ref={scroller}>
      <div className="sheet-photo">
        <motion.img src={photo(id)} alt={p.name} style={{ y }} />
        {credit && (
          <span className="credit">
            Photo:{" "}
            <a href={credit[2]} target="_blank" rel="noopener">
              {credit[0]}
            </a>
            , {credit[1]}
          </span>
        )}
      </div>
      <div className="sheet-body">
        <p className="eyebrow">
          {elev(p.alt)} · {p.region === "trek" ? "on the trail" : "on the way"}
          {nights.length > 0 && " · night" + (nights.length > 1 ? "s " : " ") + nights.map((d) => "day " + d).join(", ")}
        </p>
        <h2 className="sheet-title">{p.name}</h2>
        <p className="lead">{p.blurb}</p>

        <div className="stories">
          {p.facts.map((t, i) => (
            <motion.p key={i} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              {t}
            </motion.p>
          ))}
        </div>

        <dl className="facts-list">
          {p.notes.stay && (
            <>
              <dt>Stay</dt>
              <dd>{p.notes.stay}</dd>
            </>
          )}
          {p.notes.network && (
            <>
              <dt>Signal</dt>
              <dd>{p.notes.network}</dd>
            </>
          )}
          {p.notes.atm && (
            <>
              <dt>Cash</dt>
              <dd>{p.notes.atm}</dd>
            </>
          )}
        </dl>

        <Weather id={id} start={st.start} night={nights[0]} />

        <p className="detail-links">
          <a href={p.wiki} target="_blank" rel="noopener">
            Wikipedia
          </a>
          {(p.links || []).map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener">
              {l.label}
            </a>
          ))}
          <a href={"https://www.google.com/maps/search/?api=1&query=" + p.ll[0] + "," + p.ll[1]} target="_blank" rel="noopener">
            Google Maps
          </a>
        </p>
      </div>
    </div>
  );
}

function Weather({ id, start, night }: { id: string; start: string | null; night?: number }) {
  const wx = useWeather();
  const w = wx?.d[id];
  const today = isoDate(new Date());
  const tripDay = night ? dayDate(start, night) : null;
  const month = (tripDay || parseDate(start) || new Date()).getMonth();
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const from = w ? Math.max(0, w.t.indexOf(today)) : 0;
  return (
    <div className="weather">
      <h3 className="mini">Weather</h3>
      {w && wx ? (
        <>
          <div className="wx-strip">
            {w.t.slice(from, from + 7).map((t, i) => {
              const k = from + i;
              const d = parseDate(t)!;
              const mine = tripDay && isoDate(tripDay) === t;
              return (
                <div key={t} className={"wx-day" + (w.sn[k] > 0 ? " snow" : "") + (mine ? " mine" : "")}>
                  <span className="muted">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                  <b>{Math.round(w.hi[k])}°</b>
                  <span>{Math.round(w.lo[k])}°</span>
                  <span className="muted">{w.sn[k] > 0 ? w.sn[k] + " cm snow" : wxWord(w.c[k])}</span>
                </div>
              );
            })}
          </div>
          <p className="muted small">
            Forecast from Open-Meteo, saved {ago(wx.at)}
            {navigator.onLine ? "" : " (offline)"}.
          </p>
        </>
      ) : (
        <p className="muted small">{navigator.onLine ? "Loading the forecast." : "Go online once to keep a forecast for offline use."}</p>
      )}
      <div className="scroll-x">
        <table className="climate">
          <caption>Typical day and night °C by month (estimated)</caption>
          <tbody>
            <tr>
              {months.map((mm, i) => (
                <th key={i} className={i === month ? "cur" : ""}>
                  {mm}
                </th>
              ))}
            </tr>
            <tr>
              {months.map((_, i) => {
                const c = climateFor(id, i);
                return (
                  <td key={i} className={i === month ? "cur" : ""}>
                    {c.hi}
                    <br />
                    <span className="muted">{c.lo}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
