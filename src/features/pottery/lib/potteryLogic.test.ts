import { describe, expect, it } from "vitest";
import { POTTERY_RECIPE_BY_ID } from "@/features/pottery/data/recipes";
import {
  KILN_FUEL_OPTIONS,
  calcBeehiveKilnPlan,
  calcClayCost,
  calcCraftedOutput,
  calcFeasibility,
  calcMaxCraftable,
  calcPlanAvailability,
  calcPitKilnPlan,
} from "@/features/pottery/lib/potteryLogic";

function recipe(id: string) {
  const found = POTTERY_RECIPE_BY_ID.get(id);
  if (!found) throw new Error(`Missing recipe ${id}`);
  return found;
}

describe("pottery logic", () => {
  it("calculates normal item costs", () => {
    expect(calcClayCost(recipe("crock"), 8)).toBe(16);
    expect(calcClayCost(recipe("clay-oven"), 2)).toBe(138);
  });

  it("rounds shingles to real 12-output crafts", () => {
    expect(calcClayCost(recipe("shingles"), 1)).toBe(4);
    expect(calcClayCost(recipe("shingles"), 12)).toBe(4);
    expect(calcClayCost(recipe("shingles"), 13)).toBe(8);
    expect(calcCraftedOutput(recipe("shingles"), 13)).toBe(24);
  });

  it("uses fire clay after fire-only needs to cover any-clay items", () => {
    const plan = [
      { recipe: recipe("clay-oven"), quantity: 1 },
      { recipe: recipe("crock"), quantity: 10 },
    ];

    expect(calcFeasibility({ any: 20, fire: 69 }, plan)).toMatchObject({
      feasible: true,
      shortfallAny: 0,
      shortfallFire: 0,
      leftoverAny: 0,
      leftoverFire: 0,
    });

    expect(calcFeasibility({ any: 0, fire: 89 }, plan)).toMatchObject({
      feasible: true,
      shortfallAny: 0,
      shortfallFire: 0,
      leftoverFire: 0,
    });
  });

  it("reports separate shortfalls for fire-only and general clay", () => {
    const plan = [
      { recipe: recipe("clay-oven"), quantity: 1 },
      { recipe: recipe("storage-vessel"), quantity: 2 },
    ];

    expect(calcFeasibility({ any: 40, fire: 20 }, plan)).toMatchObject({
      feasible: false,
      shortfallAny: 30,
      shortfallFire: 49,
    });
  });

  it("calculates max craftable with fire clay substitution for general recipes", () => {
    expect(calcMaxCraftable({ any: 3, fire: 3 }, recipe("crock"))).toBe(3);
    expect(calcMaxCraftable({ any: 200, fire: 68 }, recipe("clay-oven"))).toBe(0);
  });

  it("reserves fire clay before row-level availability checks", () => {
    const plan = [
      { recipe: recipe("clay-oven"), quantity: 1 },
      { recipe: recipe("crock"), quantity: 10 },
    ];

    expect(calcPlanAvailability({ any: 0, fire: 70 }, plan)).toEqual([
      { maxCraftable: 1, short: false },
      { maxCraftable: 0, short: true },
    ]);
    expect(calcPlanAvailability({ any: 0, fire: 89 }, plan)[1]).toEqual({
      maxCraftable: 10,
      short: false,
    });
  });

  it("calculates pit kiln cycles and materials for mixed pottery plans", () => {
    const plan = [
      { recipe: recipe("bowl"), quantity: 8 },
      { recipe: recipe("crock"), quantity: 5 },
      { recipe: recipe("storage-vessel"), quantity: 2 },
      { recipe: recipe("mold-ingot"), quantity: 3 },
      { recipe: recipe("shingles"), quantity: 49 },
      { recipe: recipe("clay-oven"), quantity: 1 },
    ];

    expect(calcPitKilnPlan(plan, "firewood")).toMatchObject({
      fireableItems: 78,
      cycles: 10,
      dryGrass: 100,
      sticks: 80,
      fuel: 48,
      durationHours: 200,
    });
  });

  it("uses the selected fuel type for pit kiln duration and beehive fuel totals", () => {
    const plan = [{ recipe: recipe("bowl"), quantity: 4 }];

    for (const fuel of KILN_FUEL_OPTIONS) {
      expect(calcPitKilnPlan(plan, fuel.type)).toMatchObject({
        fuel: 4,
        durationHours: fuel.pitDurationHours,
      });
      expect(calcBeehiveKilnPlan(plan, fuel.type)).toMatchObject({
        fuel: fuel.beehiveFuelPerFiring,
        durationHours: 10.9,
      });
    }
  });

  it("uses broad beehive classes and max class firings for mixed plans", () => {
    const plan = [
      { recipe: recipe("bowl"), quantity: 73 },
      { recipe: recipe("mold-axe"), quantity: 19 },
      { recipe: recipe("storage-vessel"), quantity: 28 },
      { recipe: recipe("shingles"), quantity: 5185 },
      { recipe: recipe("clay-oven"), quantity: 1 },
    ];
    const result = calcBeehiveKilnPlan(plan, "firewood");

    expect(result).toMatchObject({
      fireableItems: 5316,
      firings: 2,
      fuel: 504,
      durationHours: 21.8,
    });
    expect(result.classes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ beehiveClass: "small", quantity: 73, capacity: 72, firings: 2 }),
        expect.objectContaining({ beehiveClass: "full-block", quantity: 19, capacity: 18, firings: 2 }),
        expect.objectContaining({ beehiveClass: "storage-vessel", quantity: 28, capacity: 27, firings: 2 }),
        expect.objectContaining({ beehiveClass: "shingles", quantity: 5196, capacity: 5184, firings: 2 }),
      ]),
    );
  });
});
