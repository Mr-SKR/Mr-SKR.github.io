// A zone with daylight saving, so a day that is 23 or 25 hours long is tested.
// Set before any Date is made; each test file runs in its own process.
declare const process: { env: Record<string, string | undefined> };
process.env.TZ = "America/New_York";

import { describe, expect, it } from "vitest";
import { addDays, countdown, dayDate } from "./format";

const at = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime();

describe("countdown", () => {
  const start = new Date(2026, 9, 9);

  it("counts down to local midnight of the start day", () => {
    expect(countdown(start, at(2026, 10, 8, 23, 59), 14)).toMatchObject({ kind: "before", days: 0, hours: 0, minutes: 1 });
    expect(countdown(start, at(2026, 10, 7, 12), 14)).toMatchObject({ kind: "before", days: 1, hours: 12 });
  });

  it("is day 1 from midnight, and day N on the Nth calendar day", () => {
    expect(countdown(start, at(2026, 10, 9), 14)).toEqual({ kind: "trail", day: 1 });
    expect(countdown(start, at(2026, 10, 9, 23, 59), 14)).toEqual({ kind: "trail", day: 1 });
    expect(countdown(start, at(2026, 10, 22, 23, 59), 14)).toEqual({ kind: "trail", day: 14 });
    expect(countdown(start, at(2026, 10, 23), 14)).toEqual({ kind: "back" });
  });

  it("keeps whole days across a daylight saving change", () => {
    // Clocks go back on 1 November 2026 here.
    const s = new Date(2026, 9, 30);
    expect(countdown(s, at(2026, 11, 1, 0, 30), 5)).toEqual({ kind: "trail", day: 3 });
    expect(countdown(s, at(2026, 11, 2, 0, 30), 5)).toEqual({ kind: "trail", day: 4 });
    expect(addDays(s, 3).getHours()).toBe(0);
    expect(dayDate("2026-10-30", 4)?.getDate()).toBe(2);
  });
});
