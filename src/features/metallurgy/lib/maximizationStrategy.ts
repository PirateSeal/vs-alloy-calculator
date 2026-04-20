import type {
  AlloyRecipe,
  MetalId,
  MetalNuggetAmount,
} from "@/features/metallurgy/types/alloys";
import type { CrucibleState } from "@/features/metallurgy/types/crucible";
import { amountsToCrucible, calculatePercentages } from "./shared/crucibleAllocation";
import { visitValidConfigurations } from "./shared/configurationSolver";
import { validateRecipe } from "./recipeValidator";

interface OptimizerMetadataBase {
  mode: "maximize" | "economical";
  recipe: AlloyRecipe;
}

export interface OptimizerSuccessMetadata extends OptimizerMetadataBase {
  totalNuggets: number;
  percentages: Record<MetalId, number>;
}

export type OptimizerFailureMetadata = OptimizerMetadataBase;

export interface OptimizerSuccessResult {
  success: true;
  crucible: CrucibleState;
  ingotCount: number;
  rarityCost?: number;
  error?: undefined;
  metadata: OptimizerSuccessMetadata;
}

export interface OptimizerFailureResult {
  success: false;
  crucible: null;
  ingotCount: 0;
  error: string;
  rarityCost?: undefined;
  metadata: OptimizerFailureMetadata;
}

export type OptimizerResult = OptimizerSuccessResult | OptimizerFailureResult;

export function createOptimizerFailure(
  mode: OptimizerFailureMetadata["mode"],
  recipe: AlloyRecipe,
  error: string,
): OptimizerFailureResult {
  return {
    success: false,
    crucible: null,
    ingotCount: 0,
    error,
    metadata: {
      mode,
      recipe,
    },
  };
}

export function createOptimizerSuccess(
  mode: OptimizerSuccessMetadata["mode"],
  recipe: AlloyRecipe,
  ingotCount: number,
  amounts: MetalNuggetAmount[],
  options?: { rarityCost?: number },
): OptimizerSuccessResult {
  return {
    success: true,
    crucible: amountsToCrucible(amounts),
    ingotCount,
    rarityCost: options?.rarityCost,
    metadata: {
      mode,
      recipe,
      totalNuggets: amounts.reduce((sum, amount) => sum + amount.nuggets, 0),
      percentages: calculatePercentages(amounts),
    },
  };
}

function findValidRecipe(
  recipe: AlloyRecipe,
  ingotCount: number,
): MetalNuggetAmount[] | null {
  let foundAmounts: MetalNuggetAmount[] | null = null;

  visitValidConfigurations({
    recipe,
    targetIngots: ingotCount,
    visit: (amounts) => {
      foundAmounts = amounts;
      return true;
    },
  });

  return foundAmounts;
}

export function maximizeIngots(recipe: AlloyRecipe): OptimizerResult {
  if (!recipe.components || recipe.components.length === 0) {
    return createOptimizerFailure("maximize", recipe, "Recipe has no components");
  }

  let low = 1;
  let high = 50;
  let maxValid = 0;
  let bestAmounts: MetalNuggetAmount[] | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const amounts = findValidRecipe(recipe, mid);

    if (amounts) {
      maxValid = mid;
      bestAmounts = amounts;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (maxValid === 0 || !bestAmounts) {
    return createOptimizerFailure(
      "maximize",
      recipe,
      "No valid recipe configuration found within crucible constraints",
    );
  }

  const validation = validateRecipe(amountsToCrucible(bestAmounts), recipe, maxValid);
  if (!validation.valid) {
    return createOptimizerFailure(
      "maximize",
      recipe,
      `Validation failed: ${validation.errors.join(", ")}`,
    );
  }

  return createOptimizerSuccess("maximize", recipe, maxValid, bestAmounts);
}
