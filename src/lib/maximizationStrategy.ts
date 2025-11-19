import type { AlloyRecipe, MetalId } from "../types/alloys";
import type { CrucibleState, CrucibleSlot } from "../types/crucible";
import type { MetalAmount } from "./metalRarity";
import { validateRecipe } from "./recipeValidator";

/**
 * Result of optimization
 */
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

/**
 * Distribute nuggets across slots with max 128 per slot
 */
function distributeToSlots(
  metalId: MetalId,
  totalNuggets: number
): CrucibleSlot[] {
  const slots: CrucibleSlot[] = [];
  let remaining = totalNuggets;
  let slotId = 0;

  while (remaining > 0) {
    const nuggets = Math.min(128, remaining);
    slots.push({
      id: slotId++,
      metalId,
      nuggets,
    });
    remaining -= nuggets;
  }

  return slots;
}

/**
 * Calculate the percentage of a metal in the recipe
 */
function calculatePercentage(nuggets: number, totalUnits: number): number {
  if (totalUnits === 0) return 0;
  return ((nuggets * 5) / totalUnits) * 100;
}

/**
 * Attempt to create a valid recipe for N ingots
 * Returns null if impossible
 *
 * This function tries multiple allocation strategies to find a valid configuration:
 * 1. Slot-optimized: Try to use full 128-nugget slots where possible
 * 2. Midpoint-based: Use percentage midpoints with simple rounding
 */
/**
 * Find a valid recipe configuration for a given number of ingots
 * Uses recursive backtracking to find a valid combination of nuggets
 */
function findValidRecipe(
  recipe: AlloyRecipe,
  ingotCount: number
): MetalAmount[] | null {
  const targetUnits = ingotCount * 100;
  const targetNuggets = ingotCount * 20;
  const components = recipe.components;

  function solve(
    index: number,
    currentNuggets: number,
    currentAmounts: MetalAmount[]
  ): MetalAmount[] | null {
    // Base case: all components handled
    if (index === components.length) {
      // Should be exactly target nuggets
      if (currentNuggets === targetNuggets) {
        // Final check on slots (though we prune along the way)
        if (fitsInFourSlots(currentAmounts)) {
          return currentAmounts;
        }
      }
      return null;
    }

    const component = components[index];

    // Calculate valid range for this component
    // Min/Max based on percentage constraints
    // Include 0.01% tolerance to match validation logic
    const minUnits = ((component.minPercent - 0.01) / 100) * targetUnits;
    const maxUnits = ((component.maxPercent + 0.01) / 100) * targetUnits;

    // Convert to nuggets
    // Use a tiny epsilon to handle floating point inaccuracies
    const minNuggets = Math.ceil((minUnits - 0.000001) / 5);
    const maxNuggets = Math.floor((maxUnits + 0.000001) / 5);

    // Optimization: For the last component, we don't need to iterate
    // We can just calculate exactly what's needed
    if (index === components.length - 1) {
      const remainingNuggets = targetNuggets - currentNuggets;

      if (remainingNuggets >= minNuggets && remainingNuggets <= maxNuggets) {
        // Double check percentage to be safe against rounding errors
        const percent = (remainingNuggets * 5 / targetUnits) * 100;
        if (percent >= component.minPercent - 0.01 - 1e-9 && percent <= component.maxPercent + 0.01 + 1e-9) {
          const newAmounts = [...currentAmounts, {
            metalId: component.metalId,
            nuggets: remainingNuggets
          }];

          if (fitsInFourSlots(newAmounts)) {
            return newAmounts;
          }
        }
      }
      return null;
    }

    // For other components, iterate through valid range
    // We also need to ensure we leave enough room for remaining components
    // And don't leave too much room
    let minRemaining = 0;
    let maxRemaining = 0;

    for (let i = index + 1; i < components.length; i++) {
      const c = components[i];
      minRemaining += Math.ceil((((c.minPercent - 0.01) / 100) * targetUnits - 0.000001) / 5);
      maxRemaining += Math.floor((((c.maxPercent + 0.01) / 100) * targetUnits + 0.000001) / 5);
    }

    const globalMin = Math.max(minNuggets, targetNuggets - currentNuggets - maxRemaining);
    const globalMax = Math.min(maxNuggets, targetNuggets - currentNuggets - minRemaining);

    for (let n = globalMin; n <= globalMax; n++) {
      // Double check percentage
      const percent = (n * 5 / targetUnits) * 100;
      if (percent < component.minPercent - 0.01 - 1e-9 || percent > component.maxPercent + 0.01 + 1e-9) {
        continue;
      }

      const newAmounts = [...currentAmounts, {
        metalId: component.metalId,
        nuggets: n
      }];

      // Check slot usage so far to prune early
      const slotsUsed = newAmounts.reduce((sum, a) => sum + Math.ceil(a.nuggets / 128), 0);

      if (slotsUsed <= 4) {
        const result = solve(index + 1, currentNuggets + n, newAmounts);
        if (result) return result;
      }
    }

    return null;
  }

  return solve(0, 0, []);
}

/**
 * Check if a recipe fits in 4 slots
 */
function fitsInFourSlots(amounts: MetalAmount[]): boolean {
  let totalSlots = 0;

  for (const amount of amounts) {
    const slotsNeeded = Math.ceil(amount.nuggets / 128);
    totalSlots += slotsNeeded;
  }

  return totalSlots <= 4;
}

/**
 * Convert metal amounts to crucible state
 */
function amountsToCrucible(amounts: MetalAmount[]): CrucibleState {
  const allSlots: CrucibleSlot[] = [];

  for (const amount of amounts) {
    const slots = distributeToSlots(amount.metalId, amount.nuggets);
    allSlots.push(...slots);
  }

  // Reassign slot IDs sequentially
  allSlots.forEach((slot, index) => {
    slot.id = index;
  });

  // Ensure we always have 4 slots (fill remaining with empty slots)
  while (allSlots.length < 4) {
    allSlots.push({
      id: allSlots.length,
      metalId: null,
      nuggets: 0,
    });
  }

  return { slots: allSlots };
}

/**
 * Calculate percentages for metadata
 */
function calculatePercentages(
  amounts: MetalAmount[]
): Record<MetalId, number> {
  const totalUnits = amounts.reduce((sum, a) => sum + a.nuggets * 5, 0);
  const percentages: Record<string, number> = {};

  for (const amount of amounts) {
    percentages[amount.metalId] = calculatePercentage(
      amount.nuggets,
      totalUnits
    );
  }

  return percentages as Record<MetalId, number>;
}

/**
 * Maximize ingot production using binary search
 */
export function maximizeIngots(recipe: AlloyRecipe): OptimizerResult {
  // Validate recipe has components
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

  // Binary search for maximum ingots
  let low = 1;
  let high = 50; // Reasonable upper bound (1000 ingots = 20,000 nuggets)
  let maxValid = 0;
  let bestAmounts: MetalAmount[] | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const amounts = findValidRecipe(recipe, mid);

    if (amounts && fitsInFourSlots(amounts)) {
      // Valid recipe found
      maxValid = mid;
      bestAmounts = amounts;
      low = mid + 1; // Try for more ingots
    } else {
      high = mid - 1; // Try fewer ingots
    }
  }

  // Check if we found any valid recipe
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

  // Convert to crucible state
  const crucible = amountsToCrucible(bestAmounts);

  // Validate the result
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

  // Calculate metadata
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
