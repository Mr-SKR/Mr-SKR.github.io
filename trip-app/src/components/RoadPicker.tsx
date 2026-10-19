import { roadFor } from "../model";
import { useTrip } from "../store";

/**
 * Buses, shared jeeps and ride-hail, or private cars and taxis split between
 * the group. With a day `id` it sets that day only; without, it sets the
 * default for every day and clears the per-day choices.
 */
export function RoadPicker({ id }: { id?: string }) {
  const { st, update } = useTrip();
  const current = id ? roadFor(st, id) : st.road;
  const pick = (v: "bus" | "car") =>
    update((d) => {
      if (!id) {
        d.road = v;
        d.roads = {};
      } else if (v === d.road) delete d.roads[id];
      else d.roads[id] = v;
    });
  return (
    <p className="road-pick">
      <span className="muted small">{id ? "Getting around this day" : "Getting around, every day"}</span>
      <span className="seg tiny" role="group" aria-label="Getting around">
        {(
          [
            ["bus", "Bus"],
            ["car", "Car and taxi"],
          ] as const
        ).map(([v, label]) => (
          <button key={v} aria-pressed={current === v} onClick={() => pick(v)}>
            {label}
          </button>
        ))}
      </span>
    </p>
  );
}
