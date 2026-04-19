import type { AlloyRecipe, MetalId, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";
import {
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
import { calculateRarityCost, getRarityScore } from "./metalRarity";
import { validateRecipe } from "./recipeValidator";
import type { OptimizerResult } from "./maximizationStrategy";

function createEconomicalRecipe(
  recipe: AlloyRecipe,
  targetIngots: number,
): MetalNuggetAmount[] | null {
  const targetUnits = targetIngots * UNITS_PER_INGOT;
  const targetNuggets = targetIngots * NUGGETS_PER_INGOT;
  const components = recipe.components;

  if (components.length === 1) {
    return [
      {
        metalId: components[0].metalId,
        nuggets: targetUnits / UNITS_PER_NUGGET,
      },
    ];
  }

  const sortedComponents = [...components].sort(
    (a, b) => getRarityScore(a.metalId) - getRarityScore(b.metalId),
  );

  const ranges = sortedComponents.map((component) => ({
    component,
    minNuggets: Math.ceil(
      (((component.minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits - 0.000001) /
        UNITS_PER_NUGGET,
    ),
    maxNuggets: Math.floor(
      (((component.maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits + 0.000001) /
        UNITS_PER_NUGGET,
    ),
  }));

  let bestAmounts: MetalNuggetAmount[] | null = null;
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
    currentAmounts: MetalNuggetAmount[],
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
      const percent = ((nuggets * UNITS_PER_NUGGET) / targetUnits) * 100;
      if (
        percent < component.minPercent - PERCENTAGE_TOLERANCE ||
        percent > component.maxPercent + PERCENTAGE_TOLERANCE
      ) {
        continue;
      }

      const nextAmounts = [
        ...currentAmounts,
        { metalId: component.metalId, nuggets },
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

export function optimizeEconomical(
  recipe: AlloyRecipe,
  targetIngots?: number,
): OptimizerResult {
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

  const crucible = amountsToCrucible(amounts);
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
