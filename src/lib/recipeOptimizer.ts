import type { AlloyRecipe, MetalId } from "../types/alloys";
import { maximizeIngots, type OptimizerResult } from "./maximizationStrategy";
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
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Invalid input: recipe is required",
      metadata: {
        mode: input?.mode || "maximize",
        recipe: input?.recipe || { id: "", name: "", components: [] },
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  if (!input.mode || (input.mode !== "maximize" && input.mode !== "economical")) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Invalid input: mode must be 'maximize' or 'economical'",
      metadata: {
        mode: "maximize",
        recipe: input.recipe,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }

  // Create a deep copy of the recipe to ensure immutability
  const recipeCopy: AlloyRecipe = {
    ...input.recipe,
    components: input.recipe.components.map((component) => ({ ...component })),
  };

  // Validate targetIngots for economical mode
  if (input.mode === "economical" && !input.targetIngots) {
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: "Target ingot amount is required for economical mode",
      metadata: {
        mode: "economical",
        recipe: recipeCopy,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
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
    return {
      success: false,
      crucible: null,
      ingotCount: 0,
      error: `Optimization failed: ${errorMessage}`,
      metadata: {
        mode: input.mode,
        recipe: recipeCopy,
        totalNuggets: 0,
        percentages: {} as Record<MetalId, number>,
      },
    };
  }
}

// Re-export OptimizerResult for convenience
export type { OptimizerResult } from "./maximizationStrategy";
