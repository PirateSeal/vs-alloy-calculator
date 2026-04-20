import type { AlloyRecipe } from "@/features/metallurgy/types/alloys";
import {
  createOptimizerFailure,
  maximizeIngots,
  type OptimizerResult,
} from "./maximizationStrategy";
import { optimizeEconomical } from "./economicalStrategy";

/**
 * Input for the recipe optimizer
 */
export interface OptimizerInput {
  recipe: AlloyRecipe;
  mode: "maximize" | "economical";
  targetIngots?: number; // Required for economical mode
}

/**
 * Main entry point for recipe optimization
 * Dispatches to appropriate strategy based on mode
 *
 * @param input - The optimizer input containing recipe and mode
 * @returns OptimizerResult with optimized crucible configuration
 */
export function optimizeRecipe(input: OptimizerInput): OptimizerResult {
  // Validate input
  if (!input || !input.recipe) {
    return createOptimizerFailure(
      input?.mode || "maximize",
      input?.recipe || { id: "", components: [] },
      "Invalid input: recipe is required",
    );
  }

  if (!input.mode || (input.mode !== "maximize" && input.mode !== "economical")) {
    return createOptimizerFailure(
      "maximize",
      input.recipe,
      "Invalid input: mode must be 'maximize' or 'economical'",
    );
  }

  // Create a deep copy of the recipe to ensure immutability
  const recipeCopy: AlloyRecipe = {
    ...input.recipe,
    components: input.recipe.components.map((component) => ({ ...component })),
  };

  // Validate targetIngots for economical mode
  if (input.mode === "economical" && !input.targetIngots) {
    return createOptimizerFailure(
      "economical",
      recipeCopy,
      "Target ingot amount is required for economical mode",
    );
  }

  // Dispatch to appropriate strategy
  try {
    if (input.mode === "maximize") {
      return maximizeIngots(recipeCopy);
    } else {
      return optimizeEconomical(recipeCopy, input.targetIngots);
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return createOptimizerFailure(
      input.mode,
      recipeCopy,
      `Optimization failed: ${errorMessage}`,
    );
  }
}

