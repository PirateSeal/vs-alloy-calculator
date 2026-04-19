import type { AlloyRecipe, MetalId } from "@/features/metallurgy/types/alloys";
import type { CrucibleState, CrucibleSlot } from "@/features/metallurgy/types/crucible";
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
  const targetNuggets = targetIngots * 20;
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

  const ranges = sortedComponents.map((component) => ({
    component,
    minNuggets: Math.ceil((((component.minPercent - 0.01) / 100) * targetUnits - 0.000001) / 5),
    maxNuggets: Math.floor((((component.maxPercent + 0.01) / 100) * targetUnits + 0.000001) / 5),
  }));

  let bestAmounts: MetalAmount[] | null = null;
  let bestRarityCost = Number.POSITIVE_INFINITY;
  let bestSlotsUsed = Number.POSITIVE_INFINITY;

  const getRemainingRange = (startIndex: number) => {
    let minRemaining = 0;
    let maxRemaining = 0;

    for (let i = startIndex; i < ranges.length; i++) {
      minRemaining += ranges[i].minNuggets;
      maxRemaining += ranges[i].maxNuggets;
    }

    return { minRemaining, maxRemaining };
  };

  const solve = (
    index: number,
    currentNuggets: number,
    currentAmounts: MetalAmount[],
  ) => {
    if (index === ranges.length) {
      if (currentNuggets !== targetNuggets || !fitsInFourSlots(currentAmounts)) {
        return;
      }

      const rarityCost = calculateRarityCost(currentAmounts);
      const slotsUsed = currentAmounts.reduce(
        (total, amount) => total + Math.ceil(amount.nuggets / 128),
        0,
      );

      if (
        rarityCost < bestRarityCost ||
        (rarityCost === bestRarityCost && slotsUsed < bestSlotsUsed)
      ) {
        bestAmounts = currentAmounts;
        bestRarityCost = rarityCost;
        bestSlotsUsed = slotsUsed;
      }
      return;
    }

    const { component, minNuggets, maxNuggets } = ranges[index];
    const { minRemaining, maxRemaining } = getRemainingRange(index + 1);
    const globalMin = Math.max(minNuggets, targetNuggets - currentNuggets - maxRemaining);
    const globalMax = Math.min(maxNuggets, targetNuggets - currentNuggets - minRemaining);

    for (let nuggets = globalMin; nuggets <= globalMax; nuggets++) {
      const percent = ((nuggets * 5) / targetUnits) * 100;
      if (percent < component.minPercent - 0.01 || percent > component.maxPercent + 0.01) {
        continue;
      }

      const nextAmounts = [
        ...currentAmounts,
        {
          metalId: component.metalId,
          nuggets,
        },
      ];

      if (!fitsInFourSlots(nextAmounts)) {
        continue;
      }

      solve(index + 1, currentNuggets + nuggets, nextAmounts);
    }
  };

  solve(0, 0, []);

  return bestAmounts;
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
