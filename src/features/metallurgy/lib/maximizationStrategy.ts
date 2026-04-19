import type { AlloyRecipe, MetalId, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";
import type { CrucibleState } from "@/features/metallurgy/types/crucible";
import {
  MAX_CRUCIBLE_SLOTS,
  MAX_NUGGETS_PER_SLOT,
  NUGGETS_PER_INGOT,
  PERCENTAGE_TOLERANCE,
  UNITS_PER_INGOT,
  UNITS_PER_NUGGET,
} from "./constants";
import {
  amountsToCrucible,
  calculatePercentages,
  fitsInFourSlots,
} from "./shared/crucibleAllocation";
import { validateRecipe } from "./recipeValidator";

export interface OptimizerResult {
  success: boolean;
  crucible: CrucibleState | null;
  ingotCount: number;
  rarityCost?: number;
  error?: string;
  metadata: {
    mode: "maximize" | "economical";
    recipe: AlloyRecipe;
    totalNuggets: number;
    percentages: Record<MetalId, number>;
  };
}

function findValidRecipe(
  recipe: AlloyRecipe,
  ingotCount: number,
): MetalNuggetAmount[] | null {
  const targetUnits = ingotCount * UNITS_PER_INGOT;
  const targetNuggets = ingotCount * NUGGETS_PER_INGOT;
  const components = recipe.components;

  function solve(
    index: number,
    currentNuggets: number,
    currentAmounts: MetalNuggetAmount[],
  ): MetalNuggetAmount[] | null {
    if (index === components.length) {
      if (currentNuggets === targetNuggets && fitsInFourSlots(currentAmounts)) {
        return currentAmounts;
      }
      return null;
    }

    const component = components[index];
    const minUnits = ((component.minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits;
    const maxUnits = ((component.maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits;
    const minNuggets = Math.ceil((minUnits - 0.000001) / UNITS_PER_NUGGET);
    const maxNuggets = Math.floor((maxUnits + 0.000001) / UNITS_PER_NUGGET);

    if (index === components.length - 1) {
      const remainingNuggets = targetNuggets - currentNuggets;

      if (remainingNuggets >= minNuggets && remainingNuggets <= maxNuggets) {
        const percent = ((remainingNuggets * UNITS_PER_NUGGET) / targetUnits) * 100;
        if (
          percent >= component.minPercent - PERCENTAGE_TOLERANCE - 1e-9 &&
          percent <= component.maxPercent + PERCENTAGE_TOLERANCE + 1e-9
        ) {
          const newAmounts = [
            ...currentAmounts,
            { metalId: component.metalId, nuggets: remainingNuggets },
          ];
          if (fitsInFourSlots(newAmounts)) {
            return newAmounts;
          }
        }
      }
      return null;
    }

    let minRemaining = 0;
    let maxRemaining = 0;
    for (let i = index + 1; i < components.length; i++) {
      const c = components[i];
      minRemaining += Math.ceil(
        (((c.minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits - 0.000001) / UNITS_PER_NUGGET,
      );
      maxRemaining += Math.floor(
        (((c.maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits + 0.000001) / UNITS_PER_NUGGET,
      );
    }

    const globalMin = Math.max(minNuggets, targetNuggets - currentNuggets - maxRemaining);
    const globalMax = Math.min(maxNuggets, targetNuggets - currentNuggets - minRemaining);

    for (let n = globalMin; n <= globalMax; n++) {
      const percent = ((n * UNITS_PER_NUGGET) / targetUnits) * 100;
      if (
        percent < component.minPercent - PERCENTAGE_TOLERANCE - 1e-9 ||
        percent > component.maxPercent + PERCENTAGE_TOLERANCE + 1e-9
      ) {
        continue;
      }

      const newAmounts = [
        ...currentAmounts,
        { metalId: component.metalId, nuggets: n },
      ];

      const slotsUsed = newAmounts.reduce(
        (sum, a) => sum + Math.ceil(a.nuggets / MAX_NUGGETS_PER_SLOT),
        0,
      );

      if (slotsUsed <= MAX_CRUCIBLE_SLOTS) {
        const result = solve(index + 1, currentNuggets + n, newAmounts);
        if (result) return result;
      }
    }

    return null;
  }

  return solve(0, 0, []);
}

export function maximizeIngots(recipe: AlloyRecipe): OptimizerResult {
  if (!recipe.components || recipe.components.length === 0) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Recipe has no components",
      metadata: {
        mode: "maximize",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  let low = 1;
  let high = 50;
  let maxValid = 0;
  let bestAmounts: MetalNuggetAmount[] | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const amounts = findValidRecipe(recipe, mid);

    if (amounts && fitsInFourSlots(amounts)) {
      maxValid = mid;
      bestAmounts = amounts;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (maxValid === 0 || !bestAmounts) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "No valid recipe configuration found within crucible constraints",
      metadata: {
        mode: "maximize",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  const crucible = amountsToCrucible(bestAmounts);
  const validation = validateRecipe(crucible, recipe, maxValid);
  if (!validation.valid) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: `Validation failed: ${validation.errors.join(", ")}`,
      metadata: {
        mode: "maximize",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  const totalNuggets = bestAmounts.reduce((sum, a) => sum + a.nuggets, 0);
  const percentages = calculatePercentages(bestAmounts);

  return {
    success: true,
    crucible,
    ingotCount: maxValid,
    metadata: {
      mode: "maximize",
      recipe,
      totalNuggets,
      percentages,
    },
  };
}
