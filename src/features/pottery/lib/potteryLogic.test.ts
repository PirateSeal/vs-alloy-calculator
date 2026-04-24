import { describe, expect, it } from "vitest";
import { POTTERY_RECIPE_BY_ID } from "@/features/pottery/data/recipes";
import { calcClayCost, calcCraftedOutput, calcFeasibility, calcMaxCraftable } from "@/features/pottery/lib/potteryLogic";

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
});
