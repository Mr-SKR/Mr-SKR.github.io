import { describe, expect, it } from "vitest";
import { D } from "./data";
import { cleanPrep } from "./prep";

describe("stored prep ticks", () => {
  it("moves milestone ticks kept by position to their ids", () => {
    const i = D.milestones.findIndex((m) => m.id === "ms-forecast");
    expect(cleanPrep({ ms: { [i]: true } }).ms).toEqual({ "ms-forecast": true });
  });

  it("keeps only true ticks and known rent choices", () => {
    const back = cleanPrep({ done: { fit: true, acap: "yes", npr: false }, rent: { a: "rent", b: "borrow" }, ms: { "ms-offline": 1 } });
    expect(back).toEqual({ done: { fit: true }, rent: { a: "rent" }, ms: {} });
  });

  it("starts empty from anything else", () => {
    for (const raw of [null, "x", 3, []]) expect(cleanPrep(raw)).toEqual({ done: {}, rent: {}, ms: {} });
  });
});
