import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { D } from "../data";
import { money, npr } from "../format";
import { addonUnit } from "../model";
import { useTrip } from "../store";
import { useUI } from "../ui";
import { RoadPicker } from "./RoadPicker";

export function AddonPrice({ id }: { id: string }) {
  const { st, update } = useTrip();
  const ui = useUI();
  const a = D.addons[id];
  const [v, setV] = useState(Math.round(addonUnit(st, id).v));
  return (
    <form
      className="sheet-body form"
      onSubmit={(e) => {
        e.preventDefault();
        // Saving the default price is no edit. Saving never ticks the add on:
        // the sheet is also where people look a price up.
        const inr = Math.round(v);
        if (inr !== Math.round(addonUnit(st, id).v))
          update((d) => {
            if (inr === a.inr) delete d.edits["addon:" + id];
            else d.edits["addon:" + id] = { v: inr };
          });
        ui.close();
      }}
    >
      <p>{a.note}</p>
      <label className="field">
        <span>
          Price in ₹
          {a.unit ? " for one " + a.unit : ""}
          {a.per === "trekDay" ? " per walking day" : a.per === "pokharaNight" ? " per night in Pokhara" : ""}
        </span>
        <input type="number" min={0} step={50} value={v} onChange={(e) => setV(Number(e.target.value))} autoFocus />
      </label>
      <p className="muted small">That is about {npr(st, v)} in Nepal.</p>
      <p className="muted small">
        Typical: {money(a.min)} to {money(a.max)} ({npr(st, a.min)} to {npr(st, a.max)}).
      </p>
      <div className="form-actions">
        <button className="btn" type="submit">
          Save
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            update((d) => void delete d.edits["addon:" + id]);
            ui.close();
          }}
        >
          Reset to {money(a.inr)}
        </button>
      </div>
    </form>
  );
}

/**
 * The fields keep what is typed and save it on blur (Enter blurs), and when
 * the sheet closes: Escape unmounts the fields without a blur.
 */
const blurOnEnter = (e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && e.currentTarget.blur();

export function Settings() {
  const { st, update } = useTrip();
  const [rate, setRate] = useState(String(st.rate));
  const [people, setPeople] = useState(String(st.people));
  const save = useRef(() => {});
  save.current = () => {
    const r = parseFloat(rate);
    const n = parseInt(people, 10);
    const okRate = r > 0 && r !== st.rate;
    const okPeople = n >= 1 && Math.min(30, n) !== st.people;
    if (okRate || okPeople)
      update((d) => {
        if (okRate) d.rate = r;
        if (okPeople) d.people = Math.min(30, n);
      });
  };
  useEffect(() => () => save.current(), []);
  return (
    <div className="sheet-body form">
      <p className="muted">All prices are in Indian rupees (₹). Nepali rupees are shown alongside for reference when paying in Nepal.</p>
      <label className="field">
        <span>Nepali rupees per ₹1</span>
        <input type="number" step={0.01} min={0.1} value={rate} onChange={(e) => setRate(e.target.value)} onBlur={() => save.current()} onKeyDown={blurOnEnter} />
      </label>
      <p className="muted small">The Nepali rupee has been pegged at 1.6 to the Indian rupee since the 1990s, so this rarely needs changing.</p>
      <label className="field">
        <span>People travelling</span>
        <input type="number" min={1} max={30} value={people} onChange={(e) => setPeople(e.target.value)} onBlur={() => save.current()} onKeyDown={blurOnEnter} />
      </label>
      <p className="muted small">Prices are each person's share: two to a hotel room, four to a car or taxi, six to a jeep, one porter for two. On the trail, teahouse rooms are always counted as half a twin, since solo trekkers pair up too. The total for the group shows under the per-person figure.</p>
      <RoadPicker />
      <p className="muted small">This sets every day; change a single day from its cost details. Solo, take buses, shared jeeps and ride-hail, with VIP sofa buses on the long rides. For three or four people, taxis in town cost about the same each as going by bus; a private car between towns costs more each but is door to door and faster.</p>
    </div>
  );
}

export function ShareUrl({ url }: { url: string }) {
  return (
    <div className="sheet-body form">
      <label className="field">
        <span>Copy this link</span>
        <input readOnly value={url} onFocus={(e) => e.target.select()} autoFocus />
      </label>
    </div>
  );
}
