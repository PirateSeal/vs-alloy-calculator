import { describe, expect, it } from "vitest";
import { ALLOY_RECIPES } from "@/features/metallurgy/data/alloys";
import { validateRecipe } from "@/features/metallurgy/lib/recipeValidator";
import {
  buildBatchPlan,
  findCraftableRecipes,
  findMaxCraftableIngots,
  normalizeInventoryState,
  planRecipeFromInventory,
} from "@/features/metallurgy/lib/planner";

function sumInventoryValues(values: Record<string, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

describe("planner", () => {
  it("returns only craftable alloys for a given inventory", () => {
    const inventory = normalizeInventoryState({
      copper: 180,
      tin: 20,
    });

    const results = findCraftableRecipes(inventory, ALLOY_RECIPES, "balanced");

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.totalIngots > 0)).toBe(true);
    expect(results.some((result) => result.recipeId === "tin-bronze")).toBe(true);
    expect(results.some((result) => result.recipeId === "brass")).toBe(false);
  });

  it("builds valid multi-run batch plans that respect crucible constraints", () => {
    const recipe = ALLOY_RECIPES.find((candidate) => candidate.id === "tin-bronze");
    expect(recipe).toBeDefined();

    const inventory = normalizeInventoryState({
      copper: 540,
      tin: 60,
    });

    const plan = buildBatchPlan(recipe!, inventory, "balanced", 30);
    expect(plan).not.toBeNull();
    expect(plan?.runs.length).toBeGreaterThan(1);
    expect(plan?.totalIngots).toBe(30);

    for (const run of plan!.runs) {
      expect(validateRecipe(run.crucible, recipe!, run.ingotsProduced).valid).toBe(true);
      expect(run.crucible.slots.filter((slot) => slot.metalId && slot.nuggets > 0).length).toBeLessThanOrEqual(4);
      expect(run.crucible.slots.every((slot) => slot.nuggets <= 128)).toBe(true);
    }

    const consumedTotals = plan!.runs.reduce(
      (totals, run) => {
        Object.entries(run.consumed).forEach(([metalId, nuggets]) => {
          totals[metalId] = (totals[metalId] ?? 0) + nuggets;
        });
        return totals;
      },
      {} as Record<string, number>,
    );

    expect(sumInventoryValues(consumedTotals)).toBe(600);
    expect(plan!.inventoryAfter.copper).toBe(0);
    expect(plan!.inventoryAfter.tin).toBe(0);
  });

  it("respects requested target counts below the maximum craftable output", () => {
    const recipe = ALLOY_RECIPES.find((candidate) => candidate.id === "brass");
    expect(recipe).toBeDefined();

    const inventory = normalizeInventoryState({
      copper: 400,
      zinc: 200,
    });

    const result = planRecipeFromInventory(recipe!, inventory, "balanced", 12);

    expect(result.maxCraftableIngots).toBeGreaterThanOrEqual(12);
    expect(result.selectedTargetIngots).toBe(12);
    expect(result.plan?.totalIngots).toBe(12);
  });

  it("economical mode prefers a lower rarity cost than balanced mode", () => {
    const inventory = normalizeInventoryState({
      copper: 420,
      gold: 80,
      silver: 80,
      tin: 40,
    });

    const balanced = findCraftableRecipes(inventory, ALLOY_RECIPES, "balanced").find(
      (result) => result.recipeId === "black-bronze",
    );
    const economical = findCraftableRecipes(inventory, ALLOY_RECIPES, "economical").find(
      (result) => result.recipeId === "black-bronze",
    );

    expect(balanced).toBeDefined();
    expect(economical).toBeDefined();
    expect(economical!.rarityCost).toBeLessThanOrEqual(balanced!.rarityCost);
  });

  it("preserve-copper mode never uses more copper than balanced mode for the same target", () => {
    const recipe = ALLOY_RECIPES.find((candidate) => candidate.id === "bismuth-bronze");
    expect(recipe).toBeDefined();

    const inventory = normalizeInventoryState({
      copper: 420,
      zinc: 170,
      bismuth: 110,
    });

    const balanced = planRecipeFromInventory(recipe!, inventory, "balanced", 10);
    const preserveCopper = planRecipeFromInventory(recipe!, inventory, "preserve-copper", 10);

    expect(balanced.plan).not.toBeNull();
    expect(preserveCopper.plan).not.toBeNull();
    expect(preserveCopper.plan!.inventoryBefore.copper - preserveCopper.plan!.inventoryAfter.copper)
      .toBeLessThanOrEqual(balanced.plan!.inventoryBefore.copper - balanced.plan!.inventoryAfter.copper);
  });

  it("max-output mode yields at least as many ingots as the other modes for the same inventory", () => {
    const recipe = ALLOY_RECIPES.find((candidate) => candidate.id === "bismuth-bronze");
    expect(recipe).toBeDefined();

    const inventory = normalizeInventoryState({
      copper: 650,
      zinc: 250,
      bismuth: 140,
    });

    const maxOutput = findMaxCraftableIngots(recipe!, inventory, "max-output");
    const balanced = findMaxCraftableIngots(recipe!, inventory, "balanced");
    const economical = findMaxCraftableIngots(recipe!, inventory, "economical");

    expect(maxOutput).toBeGreaterThanOrEqual(balanced);
    expect(maxOutput).toBeGreaterThanOrEqual(economical);
  });
});
