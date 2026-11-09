import { describe, expect, it } from "vitest";
import { allChoices, applyGoal, blockOf, addonCost, cardCost, decodeShare, shareCodeFromHash, defaultState, encodeShare, importShare, goalChoices, matchingGoal, metrics, MY_PLAN, quickPick, P, sanitize, shareOf, shareState, suggestions, trailBetween } from "./model";
import { moneyShort } from "./format";
import { D } from "./data";
import indexHtml from "../index.html?raw";

const st = defaultState();

describe("my plan", () => {
  it("flies to Kathmandu, spends a day there, flies to Pokhara and comes home via Gorakhpur", () => {
    const m = metrics(st);
    expect(m.flat.slice(0, 3).map((f) => f.id)).toEqual(["arr-ktm", "ktm-explore", "pkr-arrive-fly"]);
    expect(m.flat.at(-1)?.id).toBe("home-gop");
    expect(m.flat.at(-2)?.id).toBe("pkr-explore");
    expect(m.cost).toBe(75175);
    expect(m.days).toBe(14);
    expect(m.abc).toBe(true);
    expect(m.breaks).toHaveLength(0);
  });

  it("starts with gear rentals and an NTC SIM ticked", () => {
    expect(st.addons).toEqual(["rentals", "sim_ntc"]);
    expect(metrics(st).addonCost).toBe(350 * 8 + 600);
  });

  it("the Gorakhpur version takes 13 days", () => {
    const m = metrics(st, { ...MY_PLAN, arrive: "gop" });
    expect(m.cost).toBe(58575);
    expect(m.days).toBe(13);
  });

  it("skipping the Kathmandu day saves exactly one day", () => {
    expect(metrics(st, { ...MY_PLAN, ktmDay: false }).days).toBe(13);
  });

  it("pays no room on the last Pokhara day, since that night is on the bus", () => {
    const m = metrics(st);
    const last = m.flat.at(-2)!;
    expect(last.noBed).toBeTruthy();
    expect(cardCost(st, last.id, true).v).toBe(cardCost(st, last.id).v - 1500);
    expect(m.pkrNights).toBe(3);
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
  });

  it("a full room costs its full price, then a part-full one the single price", () => {
    expect(cardCost({ ...st, people: 3 }, "pkr-explore").v - cardCost({ ...st, people: 2 }, "pkr-explore").v).toBe(Math.round((2000 + 1500) / 3) - 1000);
  });

  it("an edited room price is the room's price however many share it", () => {
    const s = { ...st, people: 2, edits: { "pkr-explore": { stay: 3000 } } };
    expect(cardCost(s, "pkr-explore").v - cardCost({ ...s, people: 1 }, "pkr-explore").v).toBe(-1500);
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
    const roadOnly = { ...st, edits: { "ktm-explore": { stay: 0, food: 0, sights: 0 } } };
    expect(cardCost({ ...roadOnly, people: 4, road: "car" }, "ktm-explore").v).toBe(cardCost(roadOnly, "ktm-explore").v);
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

  it("an add on's shown share a day times its days is its total", () => {
    const m = metrics({ ...st, people: 3, addons: ["porter"] });
    const c = addonCost({ ...st, people: 3 }, "porter", m);
    expect(c.each * c.count).toBe(m.addonCost);
    expect(Number.isInteger(m.cost)).toBe(true);
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
  it("never takes the night bus home on the day you come down from the trek", () => {
    for (const c of allChoices()) {
      const flat = metrics(st, c).flat;
      const i = flat.findIndex((f) => f.id === "home-gop");
      if (i > 0) expect(flat[i - 1].c.type, JSON.stringify(c)).toBe("stay");
    }
  });

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
    expect(m.cost).toBe(49375);
    expect(m.days).toBe(10);
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

  it("carries the group size and how it gets around, so prices match", async () => {
    const s = { ...st, people: 4, road: "car" as const, roads: { "arr-ktm": "bus" as const } };
    const back = importShare(defaultState(), await decodeShare(await encodeShare(shareState(s))));
    expect([back.people, back.road, back.roads]).toEqual([4, "car", { "arr-ktm": "bus" }]);
    expect(metrics(back).cost).toBe(metrics(s).cost);
  });

  it("replaces the visitor's own price edits, so the total is the sender's", async () => {
    const visitor = { ...st, edits: { "arr-ktm": { [D.cards["arr-ktm"].costs[0][0]]: 99999 } } };
    const back = importShare(visitor, await decodeShare(await encodeShare(shareState(st))));
    expect(back.edits).toEqual({});
    expect(metrics(back).cost).toBe(metrics(st).cost);
  });

  it("reads a link from the location hash, and nothing else", async () => {
    const code = await encodeShare(shareState(st));
    expect(shareCodeFromHash("#b=" + code)).toBe(code);
    expect(shareCodeFromHash("#route")).toBeNull();
    expect(shareCodeFromHash("#b=x123")).toBeNull();
    expect(shareCodeFromHash("#b=" + code + "&x=1")).toBeNull();
    const back = importShare(defaultState(), await decodeShare(shareCodeFromHash("#b=" + code)!));
    expect(metrics(back).cost).toBe(metrics(st).cost);
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
    expect(metrics(cheap).cost).toBe(49375);
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

describe("places", () => {
  it("lists a card's walk-through places in trail order, inside its first leg", () => {
    Object.entries(D.cards).forEach(([id, c]) => {
      if (!c.via) return;
      const trail = trailBetween(c.legs[0][0], c.legs[0][1]);
      const at = c.via.map((v) => trail.indexOf(v));
      expect(at.every((i, k) => i >= 0 && i < trail.length - 1 && (k === 0 || i > at[k - 1])), id).toBe(true);
    });
  });

  it("keeps home on the route but out of the places", () => {
    expect(D.places[D.home.id]).toBeUndefined();
    expect(P(D.home.id).name).toBe("Bengaluru");
    expect(P(D.home.id).ll).toEqual(D.home.ll);
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

describe("stored state from older builds", () => {
  it("keeps what is still valid and fills in the rest", () => {
    const old = { choices: { arrive: "gop", pace: "slow-ish", buffer: "yes" }, addons: ["porter", "gone-addon"], people: 2.7, rate: "1.6", road: "plane", start: "9 Oct" };
    const back = sanitize(old);
    expect(back.choices).toEqual({ ...MY_PLAN, arrive: "gop" });
    expect(back.addons).toEqual(["porter"]);
    expect([back.people, back.rate, back.road, back.start]).toEqual([2, D.inrToNpr, "bus", null]);
    expect(back.edits).toEqual({});
  });

  it("falls back to my plan for anything that is not a state", () => {
    for (const raw of [null, 7, "x", [], { choices: null }]) expect(sanitize(raw)).toEqual(defaultState());
  });
});

describe("metrics", () => {
  it("gives the same answer from its cache as fresh, and follows every priced field", () => {
    const a = metrics(st);
    expect(metrics(structuredClone(st))).toBe(a);
    expect(metrics({ ...st, people: 2 }).cost).not.toBe(a.cost);
    const day = a.flat[0];
    expect(metrics({ ...st, edits: { [day.id]: { [day.c.costs[0][0]]: 99999 } } }).cost).toBeGreaterThan(a.cost);
    expect(metrics({ ...st, road: "car" }).cost).not.toBe(a.cost);
    expect(metrics({ ...st, addons: [] }).cost).toBeLessThan(a.cost);
  });
});

describe("index.html", () => {
  // The no-JavaScript summary describes my plan in words; the numbers are
  // filled in at build time. If MY_PLAN changes, rewrite that sentence too.
  it("describes my plan, and takes its numbers from the build", () => {
    expect(MY_PLAN).toEqual({ arrive: "ktm-fly", ktmDay: true, pokhara: 2, pace: "standard", down: "slow", buffer: true, home: "gop" });
    const html = indexHtml;
    expect(html).toContain("%PLAN_DAYS% days");
    expect(html).toContain("INR %PLAN_COST%");
    expect(html).not.toMatch(/\b1[0-9]-day\b|INR \d/);
  });
});

describe("stories", () => {
  it("every story has a body with sources, and every body belongs to a story", async () => {
    const { STORIES } = await import("./stories");
    const ids = Object.values(D.places).flatMap((p) => p.stories.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(STORIES).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      expect(STORIES[id].parts.length).toBeGreaterThan(0);
      expect(STORIES[id].sources.length).toBeGreaterThan(0);
    }
  });
});
