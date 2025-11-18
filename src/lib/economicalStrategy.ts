import type { AlloyRecipe, MetalId } from "../types/alloys";
import type { CrucibleState, CrucibleSlot } from "../types/crucible";
import type { MetalAmount } from "./metalRarity";
import { calculateRarityCost, getRarityScore } from "./metalRarity";
import { validateRecipe } from "./recipeValidator";
import type { OptimizerResult } from "./maximizationStrategy";

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
    percentages[amount.metalId] = ((amount.nuggets * 5) / totalUnits) * 100;
  }

  return percentages as Record<MetalId, number>;
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
 * Attempt to create a valid recipe for N ingots with economical distribution
 * Biases toward common metals (lower rarity scores) within percentage constraints
 */
function createEconomicalRecipe(
  recipe: AlloyRecipe,
  targetIngots: number
): MetalAmount[] | null {
  const targetUnits = targetIngots * 100;
  const components = recipe.components;

  // Handle single component
  if (components.length === 1) {
    return [
      {
        metalId: components[0].metalId,
        nuggets: targetUnits / 5,
      },
    ];
  }

  // Sort components by rarity score (ascending) to prioritize common metals
  const sortedComponents = [...components].sort((a, b) => {
    return getRarityScore(a.metalId) - getRarityScore(b.metalId);
  });

  const amounts: MetalAmount[] = [];
  let allocatedUnits = 0;

  // Calculate minimum units needed for all remaining components
  const getMinUnitsForRemaining = (startIndex: number): number => {
    let minUnits = 0;
    for (let j = startIndex; j < sortedComponents.length; j++) {
      minUnits += (sortedComponents[j].minPercent / 100) * targetUnits;
    }
    return minUnits;
  };

  // Allocate nuggets for all components except the last
  // Bias toward maximum percentage for common metals, minimum for rare metals
  // But ensure we leave enough room for remaining components
  for (let i = 0; i < sortedComponents.length - 1; i++) {
    const component = sortedComponents[i];
    const rarityScore = getRarityScore(component.metalId);

    // Calculate how much we can allocate without violating constraints
    const remainingUnits = targetUnits - allocatedUnits;
    const minUnitsForRemaining = getMinUnitsForRemaining(i + 1);
    const maxAvailableUnits = remainingUnits - minUnitsForRemaining;

    // For common metals (low rarity), try to use maximum percentage
    // For rare metals (high rarity), use minimum percentage
    const targetPercent =
      rarityScore <= 2.0 ? component.maxPercent : component.minPercent;

    const targetUnitsForComponent = Math.round(
      (targetPercent / 100) * targetUnits
    );

    // Convert to nuggets
    let nuggets = Math.round(targetUnitsForComponent / 5);

    // Ensure we stay within percentage bounds
    const minNuggets = Math.ceil(
      (component.minPercent / 100) * targetUnits / 5
    );
    const maxNuggets = Math.floor(
      (component.maxPercent / 100) * targetUnits / 5
    );

    // Also ensure we don't exceed what's available
    const maxAvailableNuggets = Math.floor(maxAvailableUnits / 5);

    nuggets = Math.max(
      minNuggets,
      Math.min(maxNuggets, Math.min(nuggets, maxAvailableNuggets))
    );

    amounts.push({
      metalId: component.metalId,
      nuggets,
    });

    allocatedUnits += nuggets * 5;
  }

  // Allocate remaining units to last component
  const lastComponent = sortedComponents[sortedComponents.length - 1];
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
 * Optimize recipe for economical mode - minimize rarity cost for target ingot amount
 * @param recipe - The alloy recipe to optimize
 * @param targetIngots - The desired number of ingots to produce
 * @returns OptimizerResult with minimized rarity cost
 */
export function optimizeEconomical(
  recipe: AlloyRecipe,
  targetIngots?: number
): OptimizerResult {
  // Validate recipe has components
  if (!recipe.components || recipe.components.length === 0) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Recipe has no components",
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Validate target ingots is provided
  if (targetIngots === undefined || targetIngots === null) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Target ingot amount is required for economical mode",
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Validate target ingots is positive
  if (targetIngots <= 0) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Target ingot amount must be greater than zero",
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Create economical recipe for target ingots
  const amounts = createEconomicalRecipe(recipe, targetIngots);

  if (!amounts) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: `Cannot create valid recipe for ${targetIngots} ingots within percentage constraints`,
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Check if recipe fits in 4 slots

  if (!fitsInFourSlots(amounts)) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: `Recipe for ${targetIngots} ingots requires more than 4 crucible slots`,
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Convert to crucible state
  const crucible = amountsToCrucible(amounts);

  // Validate the result
  const validation = validateRecipe(crucible, recipe, targetIngots);
  if (!validation.valid) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: `Validation failed: ${validation.errors.join(", ")}`,
      metadata: {
        mode: "economical",
        recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Calculate rarity cost and metadata
  const rarityCost = calculateRarityCost(amounts);
  const totalNuggets = amounts.reduce((sum, a) => sum + a.nuggets, 0);
  const percentages = calculatePercentages(amounts);

  return {
    success: true,
    crucible,
    ingotCount: targetIngots,
    rarityCost,
    metadata: {
      mode: "economical",
      recipe,
      totalNuggets,
      percentages,
    },
  };
}
