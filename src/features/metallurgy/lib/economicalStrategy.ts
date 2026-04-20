import type { AlloyRecipe, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";
import { amountsToCrucible, countSlotsUsed } from "./shared/crucibleAllocation";
import { visitValidConfigurations } from "./shared/configurationSolver";
import { calculateRarityCost, getRarityScore } from "./metalRarity";
import {
  createOptimizerFailure,
  createOptimizerSuccess,
  type OptimizerResult,
} from "./maximizationStrategy";
import { validateRecipe } from "./recipeValidator";

function sortAmountsByRarity(amounts: MetalNuggetAmount[]): MetalNuggetAmount[] {
  return [...amounts].sort(
    (left, right) => getRarityScore(left.metalId) - getRarityScore(right.metalId),
  );
}

function createEconomicalRecipe(
  recipe: AlloyRecipe,
  targetIngots: number,
): MetalNuggetAmount[] | null {
  let bestAmounts: MetalNuggetAmount[] | null = null;
  let bestRarityCost = Number.POSITIVE_INFINITY;
  let bestSlotsUsed = Number.POSITIVE_INFINITY;

  visitValidConfigurations({
    recipe,
    targetIngots,
    visit: (amounts) => {
      const sortedAmounts = sortAmountsByRarity(amounts);
      const rarityCost = calculateRarityCost(sortedAmounts);
      const slotsUsed = countSlotsUsed(sortedAmounts);

      if (
        rarityCost < bestRarityCost ||
        (rarityCost === bestRarityCost && slotsUsed < bestSlotsUsed)
      ) {
        bestAmounts = sortedAmounts;
        bestRarityCost = rarityCost;
        bestSlotsUsed = slotsUsed;
      }
    },
  });

  return bestAmounts;
}

export function optimizeEconomical(
  recipe: AlloyRecipe,
  targetIngots?: number,
): OptimizerResult {
  if (!recipe.components || recipe.components.length === 0) {
    return createOptimizerFailure("economical", recipe, "Recipe has no components");
  }

  if (targetIngots === undefined || targetIngots === null) {
    return createOptimizerFailure(
      "economical",
      recipe,
      "Target ingot amount is required for economical mode",
    );
  }

  if (targetIngots <= 0) {
    return createOptimizerFailure(
      "economical",
      recipe,
      "Target ingot amount must be greater than zero",
    );
  }

  const amounts = createEconomicalRecipe(recipe, targetIngots);
  if (!amounts) {
    return createOptimizerFailure(
      "economical",
      recipe,
      `Cannot create valid recipe for ${targetIngots} ingots within percentage constraints`,
    );
  }

  const validation = validateRecipe(amountsToCrucible(amounts), recipe, targetIngots);
  if (!validation.valid) {
    return createOptimizerFailure(
      "economical",
      recipe,
      `Validation failed: ${validation.errors.join(", ")}`,
    );
  }

  return createOptimizerSuccess("economical", recipe, targetIngots, amounts, {
    rarityCost: calculateRarityCost(amounts),
  });
}
