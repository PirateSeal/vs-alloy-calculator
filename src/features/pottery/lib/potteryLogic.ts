import type { PotteryPlanItem, PotteryRecipe } from "@/features/pottery/types/pottery";

export interface PotteryInventory {
  any: number;
  fire: number;
}

export interface PotteryPlanInput {
  recipe: PotteryRecipe;
  quantity: number;
}

export interface PotteryFeasibility {
  feasible: boolean;
  totalAny: number;
  totalFire: number;
  totalClay: number;
  shortfallAny: number;
  shortfallFire: number;
  leftoverAny: number;
  leftoverFire: number;
}

export function clampPositiveInt(value: number, min = 1, max = 9999): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function calcClayCost(recipe: PotteryRecipe, quantity: number): number {
  const target = clampPositiveInt(quantity);

  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.ceil(target / recipe.outputCount) * recipe.clayCost;
  }

  return recipe.clayCost * target;
}

export function calcCraftedOutput(recipe: PotteryRecipe, quantity: number): number {
  const target = clampPositiveInt(quantity);
  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.ceil(target / recipe.outputCount) * recipe.outputCount;
  }
  return target;
}

export function calcMaxCraftable(inventory: PotteryInventory, recipe: PotteryRecipe): number {
  const available = recipe.clayType === "fire" ? inventory.fire : inventory.any + inventory.fire;
  if (available <= 0) return 0;

  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.floor(available / recipe.clayCost) * recipe.outputCount;
  }

  return Math.floor(available / recipe.clayCost);
}

export function calcFeasibility(inventory: PotteryInventory, plan: PotteryPlanInput[]): PotteryFeasibility {
  let totalAny = 0;
  let totalFire = 0;

  for (const item of plan) {
    const quantity = clampPositiveInt(item.quantity);
    const cost = calcClayCost(item.recipe, quantity);
    if (item.recipe.clayType === "fire") {
      totalFire += cost;
    } else {
      totalAny += cost;
    }
  }

  const fireAfterFireOnly = inventory.fire - totalFire;
  const spareFireForAny = Math.max(0, fireAfterFireOnly);
  const anyCovered = inventory.any + spareFireForAny;
  const shortfallFire = Math.max(0, totalFire - inventory.fire);
  const shortfallAny = Math.max(0, totalAny - anyCovered);
  const anyUsed = Math.min(inventory.any, totalAny);
  const anyRemainder = totalAny - anyUsed;
  const fireUsedForAny = Math.min(spareFireForAny, anyRemainder);

  return {
    feasible: shortfallAny === 0 && shortfallFire === 0,
    totalAny,
    totalFire,
    totalClay: totalAny + totalFire,
    shortfallAny,
    shortfallFire,
    leftoverAny: Math.max(0, inventory.any - anyUsed),
    leftoverFire: Math.max(0, inventory.fire - totalFire - fireUsedForAny),
  };
}

export function hydratePlanItems(
  plan: PotteryPlanItem[],
  recipeById: Map<string, PotteryRecipe>,
): PotteryPlanInput[] {
  return plan
    .map((item) => {
      const recipe = recipeById.get(item.recipeId);
      return recipe ? { recipe, quantity: clampPositiveInt(item.quantity) } : null;
    })
    .filter((item): item is PotteryPlanInput => item !== null);
}
