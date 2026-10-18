import { useState } from "react";
import { D } from "../data";
import { money, npr } from "../format";
import { addonUnit } from "../model";
import { useTrip } from "../store";
import { useUI } from "../ui";

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
        update(
          (d) => {
            d.edits["addon:" + id] = { v: Math.round(v) };
            if (!d.addons.includes(id)) d.addons.push(id);
          }
        );
        ui.close();
      }}
    >
      <p>{a.note}</p>
      <label className="field">
        <span>
          Price in ₹
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

export function Settings() {
  const { st, update } = useTrip();
  return (
    <div className="sheet-body form">
      <p className="muted">All prices are in Indian rupees (₹). Nepali rupees are shown alongside for reference when paying in Nepal.</p>
      <label className="field">
        <span>Nepali rupees per ₹1</span>
        <input
          type="number"
          step={0.01}
          min={0.1}
          defaultValue={st.rate}
          onBlur={(e) => {
            const r = parseFloat(e.target.value);
            if (r > 0 && r !== st.rate) update((d) => void (d.rate = r));
          }}
        />
      </label>
      <p className="muted small">The Nepali rupee has been pegged at 1.6 to the Indian rupee since the 1990s, so this rarely needs changing.</p>
      <label className="field">
        <span>People travelling</span>
        <input
          type="number"
          min={1}
          max={30}
          defaultValue={st.people}
          onBlur={(e) => {
            const n = parseInt(e.target.value, 10);
            if (n >= 1 && n !== st.people) update((d) => void (d.people = Math.min(30, n)));
          }}
        />
      </label>
      <p className="muted small">Prices stay per person. The total for the group shows under the per-person figure.</p>
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
