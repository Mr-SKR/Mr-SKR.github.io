import { describe, expect, it } from "vitest";
import { allChoices, applyGoal, blockOf, cardCost, costItems, itemShare, decodeShare, defaultState, encodeShare, importShare, goalChoices, matchingGoal, metrics, MY_PLAN, quickPick, sanitize, shareOf, shareState, suggestions } from "./model";
import { moneyShort } from "./format";

const st = defaultState();

describe("my plan", () => {
  it("flies to Kathmandu, spends a day there, flies to Pokhara and comes home via Gorakhpur", () => {
    const m = metrics(st);
    expect(m.flat.slice(0, 3).map((f) => f.id)).toEqual(["arr-ktm", "ktm-explore", "pkr-arrive-fly"]);
    expect(m.flat.at(-1)?.id).toBe("home-gop");
    expect(m.flat.at(-2)?.id).toBe("pkr-explore");
    expect(m.cost).toBe(73275);
    expect(m.days).toBe(14);
    expect(m.abc).toBe(true);
    expect(m.breaks).toHaveLength(0);
  });

  it("the Gorakhpur version takes 13 days", () => {
    const m = metrics(st, { ...MY_PLAN, arrive: "gop" });
    expect(m.cost).toBe(56675);
    expect(m.days).toBe(13);
  });

  it("skipping the Kathmandu day saves exactly one day", () => {
    expect(metrics(st, { ...MY_PLAN, ktmDay: false }).days).toBe(13);
  });

  it("flags Deurali to ABC as a big altitude jump", () => {
    const abc = metrics(st).ams.find((a) => a.to === "abc");
    expect(abc?.lvl).toBe("bad");
    expect(abc?.gain).toBe(900);
  });
});

describe("groups", () => {
  it("splits rooms two to a room and taxis four to a car", () => {
    expect(shareOf(1, 2)).toBe(1);
    expect(shareOf(2, 2)).toBe(0.5);
    expect(shareOf(3, 2)).toBeCloseTo(2 / 3);
    expect(shareOf(5, 4)).toBeCloseTo(2 / 5);
    expect(shareOf(7)).toBe(1);
    expect(shareOf(2, 2, 4 / 3) * 1500).toBeCloseTo(1000);
    expect(shareOf(3, 2, 4 / 3) * 1500).toBeCloseTo((2000 + 1500) / 3);
  });

  it("a Pokhara room is ₹1,500 alone and ₹2,000 for two, so each of two pays ₹1,000", () => {
    const solo = cardCost(st, "pkr-explore").v;
    const duo = cardCost({ ...st, people: 2 }, "pkr-explore").v;
    expect(solo - duo).toBe(500);
  });

  it("a teahouse night is half a twin room even solo", () => {
    expect(cardCost(st, "up-ghandruk-chhomrong").v).toBe(cardCost({ ...st, people: 2 }, "up-ghandruk-chhomrong").v);
  });

  it("four people in taxis pay about what one person pays by bus in town", () => {
    const road = (s: typeof st) => costItems(s, "ktm-explore").filter((it) => it[5]?.road).reduce((t, it) => t + it[2] * itemShare(s.people, it), 0);
    expect(road({ ...st, people: 4, road: "car" })).toBe(road(st));
  });

  it("counts bus lines by bus and car lines by car, never both", () => {
    const bus = cardCost(st, "arr-gop").v;
    const car = cardCost({ ...st, road: "car" }, "arr-gop").v;
    expect(bus).toBe(8000 + 200 + 200 + 1200 + 150 + 1000);
    expect(car).toBe(8000 + 3000 + 12000 + 1000);
    expect(cardCost({ ...st, road: "car", people: 4 }, "arr-gop").v).toBe(8000 + 750 + 3000 + 1000);
  });

  it("splits a porter between two people, and an edited price is the price of one porter", () => {
    const base = { ...st, addons: ["porter"], edits: { "addon:porter": { v: 2000 } } };
    const one = metrics(base);
    const two = metrics({ ...base, people: 2 });
    expect(one.addonCost).toBe(2000 * one.trekDays);
    expect(two.addonCost).toBe(1000 * two.trekDays);
  });

  it("a day's own road choice changes that day only", () => {
    const s = { ...st, roads: { "arr-gop": "car" as const } };
    expect(cardCost(s, "arr-gop").v).toBe(cardCost({ ...st, road: "car" }, "arr-gop").v);
    expect(cardCost(s, "home-gop").v).toBe(cardCost(st, "home-gop").v);
  });

  it("keeps per-day road choices only for real days with a road leg", () => {
    const back = sanitize({ ...st, roads: { "arr-gop": "car", "home-gop": "bus", "up-dovan-deurali": "car", nope: "car", "pkr-explore": "plane" } });
    expect(back.roads).toEqual({ "arr-gop": "car" });
  });

  it("keeps the road choice across reloads and drops nonsense", () => {
    expect(sanitize({ ...st, road: "car" }).road).toBe("car");
    expect(sanitize({ ...st, road: "plane" }).road).toBe("bus");
  });
});

describe("every combination", () => {
  it("is a continuous route that reaches ABC", () => {
    for (const c of allChoices()) {
      const m = metrics(st, c);
      expect(m.breaks, JSON.stringify(c)).toHaveLength(0);
      expect(m.abc).toBe(true);
    }
  });
});

describe("quick picks", () => {
  const costs = allChoices().map((c) => metrics(st, c));

  it("cheapest really is the lowest cost of all combinations", () => {
    const m = metrics(st, quickPick(st, "cheapest"));
    expect(m.cost).toBe(Math.min(...costs.map((x) => x.cost)));
    expect(m.cost).toBe(45675);
    expect(m.days).toBe(9);
  });

  it("shortest really has the fewest days", () => {
    const m = metrics(st, quickPick(st, "shortest"));
    expect(m.days).toBe(Math.min(...costs.map((x) => x.days)));
    expect(m.days).toBe(9);
  });

  it("follows edited prices: an expensive bus makes Kathmandu the cheaper way in", () => {
    const pricey = { ...st, edits: { "arr-gop": { bus: 20000 } } };
    expect(quickPick(pricey, "cheapest").arrive).not.toBe("gop");
  });
});

describe("share links", () => {
  it("round-trips choices, edits and add-ons", async () => {
    const s = { ...st, choices: { ...MY_PLAN, home: "ktm" as const, ktmDay: false }, addons: ["porter"], edits: { "arr-gop": { flight: 9000 } } };
    const back = importShare(defaultState(), await decodeShare(await encodeShare(shareState(s))));
    expect(back.choices).toEqual(s.choices);
    expect(metrics(back).cost).toBe(metrics(s).cost);
    expect(back.edits).toEqual(s.edits);
  });

  it("drops edits and add-ons that are not real numbers, cards or items", () => {
    const bad = {
      v: 2,
      c: MY_PLAN,
      a: ["porter", "constructor", "porter", 7],
      e: {
        "arr-gop": { flight: "9000", nope: 5 },
        "arr-ktm": { flight: -1 },
        "addon:porter": { v: 1200 },
        "addon:toString": { v: 1 },
        "no-such-card": { flight: 1 },
        constructor: null,
      },
    } as unknown as Parameters<typeof importShare>[1];
    const back = importShare(defaultState(), bad);
    expect(back.addons).toEqual(["porter"]);
    expect(back.edits).toEqual({ "addon:porter": { v: 1200 } });
    expect(Number.isFinite(metrics(back).cost)).toBe(true);
  });
});

describe("goals", () => {
  it("applying every 'spend less' suggestion lands on the true cheapest", () => {
    const c = applyGoal(st, "cost");
    expect(metrics(st, c).cost).toBe(metrics(st, quickPick(st, "cheapest")).cost);
  });

  it("applying every 'fewer days' suggestion lands on the fewest days", () => {
    expect(metrics(st, applyGoal(st, "days")).days).toBe(metrics(st, quickPick(st, "shortest")).days);
  });

  it("'spend less' on my plan suggests skipping the optional days", () => {
    const ids = suggestions(st, "cost").map((s) => s.block.id);
    expect(ids).toEqual(expect.arrayContaining(["pokhara", "buffer"]));
    expect(suggestions(st, "cost").every((s) => s.cost < 0)).toBe(true);
  });

  it("picking a goal sets the plan to it, and the page recognises it", () => {
    const cheap = { ...st, choices: goalChoices(st, "cost") };
    expect(metrics(cheap).cost).toBe(45675);
    expect(matchingGoal(cheap)).toBe("cost");
    expect(matchingGoal(st)).toBe("mine");
    expect(matchingGoal({ ...cheap, choices: { ...cheap.choices, buffer: true } })).toBe(null);
  });

  it("'fewer days' flies via Kathmandu: same days as Gorakhpur, far less time on the road", () => {
    const fast = goalChoices(st, "days");
    expect(fast.arrive).toBe("ktm-fly");
    expect(fast.ktmDay).toBe(false);
    const viaGop = metrics(st, { ...fast, arrive: "gop" });
    expect(metrics(st, fast).days).toBe(viaGop.days);
    expect(metrics(st, fast).travelHours).toBeLessThan(viaGop.travelHours);
    expect(matchingGoal({ ...st, choices: fast }, "days")).toBe("days");
  });

  it("goals always start from my plan, whatever was edited before", () => {
    const edited = { ...st, choices: { ...MY_PLAN, arrive: "ktm-fly" as const, home: "ktm" as const } };
    expect(goalChoices(edited, "cost")).toEqual(goalChoices(st, "cost"));
  });

  it("the Machhapuchhre Base Camp night is never part of the plan", () => {
    for (const c of allChoices()) expect(metrics(st, c).flat.some((f) => f.to === "mbc")).toBe(false);
  });

  it("every day belongs to a block", () => {
    for (const c of allChoices()) metrics(st, c).flat.forEach((f) => expect(blockOf(f.id), f.id).toBeDefined());
  });
});

describe("moneyShort", () => {
  it("switches unit on the rounded value", () => {
    expect(moneyShort(950)).toBe("₹950");
    expect(moneyShort(7500)).toBe("₹7.5K");
    expect(moneyShort(75700)).toBe("₹76K");
    expect(moneyShort(99999)).toBe("₹1L");
    expect(moneyShort(123456)).toBe("₹1.23L");
  });
});
