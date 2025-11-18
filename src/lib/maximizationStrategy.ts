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
function createRecipeForIngots(
  recipe: AlloyRecipe,
  ingotCount: number
): MetalAmount[] | null {
  const targetUnits = ingotCount * 100;
  const targetNuggets = ingotCount * 20;
  const components = recipe.components;

  // Handle single component (shouldn't happen in practice, but handle it)
  if (components.length === 1) {
    return [
      {
        metalId: components[0].metalId,
        nuggets: targetUnits / 5,
      },
    ];
  }

  // Strategy 1: Try slot-optimized allocation (prefer full 128-nugget slots)
  const slotOptimized = trySlotOptimizedAllocation(recipe, targetUnits, targetNuggets);
  if (slotOptimized) {
    return slotOptimized;
  }

  // Strategy 2: Fall back to midpoint-based allocation
  return tryMidpointAllocation(recipe, targetUnits);
}

/**
 * Try to allocate nuggets using full 128-nugget slots where possible
 * This maximizes the number of ingots we can fit in 4 slots
 */
function trySlotOptimizedAllocation(
  recipe: AlloyRecipe,
  targetUnits: number,
  targetNuggets: number
): MetalAmount[] | null {
  const components = recipe.components;

  // Try different combinations of slot-friendly sizes
  const slotSizes = [256, 128, 96, 64, 32];

  // Recursively try all valid combinations
  function tryRecursive(componentIndex: number, allocatedNuggets: number, amounts: MetalAmount[]): MetalAmount[] | null {
    // Base case: all components except last are allocated
    if (componentIndex === components.length - 1) {
      const lastComponent = components[componentIndex];
      const lastNuggets = targetNuggets - allocatedNuggets;

      if (lastNuggets <= 0) return null;

      const lastUnits = lastNuggets * 5;
      const lastPercent = (lastUnits / targetUnits) * 100;

      // Check if last component is valid
      if (
        lastPercent >= lastComponent.minPercent - 0.01 &&
        lastPercent <= lastComponent.maxPercent + 0.01
      ) {
        const result = [...amounts, {
          metalId: lastComponent.metalId,
          nuggets: lastNuggets,
        }];

        // Verify it fits in 4 slots
        let totalSlots = 0;
        for (const amount of result) {
          totalSlots += Math.ceil(amount.nuggets / 128);
        }

        if (totalSlots <= 4) {
          return result;
        }
      }

      return null;
    }

    // Try different nugget amounts for this component
    const component = components[componentIndex];
    const minNuggets = Math.ceil((component.minPercent / 100) * targetUnits / 5);
    const maxNuggets = Math.floor((component.maxPercent / 100) * targetUnits / 5);

    // Try slot-friendly sizes first
    for (const size of slotSizes) {
      if (size >= minNuggets && size <= maxNuggets) {
        const remaining = targetNuggets - allocatedNuggets - size;

        if (remaining > 0) {
          const newAmounts = [...amounts, {
            metalId: component.metalId,
            nuggets: size,
          }];

          const result = tryRecursive(componentIndex + 1, allocatedNuggets + size, newAmounts);
          if (result) return result;
        }
      }
    }

    return null;
  }

  return tryRecursive(0, 0, []);
}

/**
 * Allocate nuggets based on percentage midpoints with simple rounding
 */
function tryMidpointAllocation(
  recipe: AlloyRecipe,
  targetUnits: number
): MetalAmount[] | null {
  const components = recipe.components;
  const amounts: MetalAmount[] = [];
  let allocatedUnits = 0;

  // Allocate nuggets for all components except the last
  for (let i = 0; i < components.length - 1; i++) {
    const component = components[i];

    // Use midpoint of percentage range as target
    const targetPercent = (component.minPercent + component.maxPercent) / 2;
    const targetUnitsForComponent = Math.round((targetPercent / 100) * targetUnits);

    // Convert to nuggets (round to nearest nugget)
    let nuggets = Math.round(targetUnitsForComponent / 5);

    // Ensure we stay within percentage bounds
    const minNuggets = Math.ceil((component.minPercent / 100) * targetUnits / 5);
    const maxNuggets = Math.floor((component.maxPercent / 100) * targetUnits / 5);

    nuggets = Math.max(minNuggets, Math.min(maxNuggets, nuggets));

    amounts.push({
      metalId: component.metalId,
      nuggets,
    });

    allocatedUnits += nuggets * 5;
  }

  // Allocate remaining units to last component
  const lastComponent = components[components.length - 1];
  const remainingUnits = targetUnits - allocatedUnits;
  const lastNuggets = remainingUnits / 5;

  // Validate last component is within percentage bounds
  const lastPercent = (remainingUnits / targetUnits) * 100;
  if (
    lastPercent < lastComponent.minPercent - 0.01 ||
    lastPercent > lastComponent.maxPercent + 0.01
  ) {
    return null; // Cannot satisfy percentage constraints
  }

  amounts.push({
    metalId: lastComponent.metalId,
    nuggets: lastNuggets,
  });

  return amounts;
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
    const amounts = createRecipeForIngots(recipe, mid);

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
