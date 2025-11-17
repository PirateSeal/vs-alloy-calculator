import type { MetalId, AlloyRecipe, Metal } from "../types/alloys";
import type { CrucibleState } from "../types/crucible";

export interface MetalAmount {
  metalId: MetalId;
  nuggets: number;
  units: number;
  percent: number;
}

export interface AlloyViolation {
  metalId: MetalId;
  requiredMin?: number;
  requiredMax?: number;
  actual: number;
}

export interface AlloyMatchDetail {
  recipe: AlloyRecipe;
  isExact: boolean;
  score: number;
  violations: AlloyViolation[];
}

export interface EvaluationResult {
  amounts: MetalAmount[];
  totalNuggets: number;
  totalUnits: number;
  matches: AlloyMatchDetail[];
  bestMatch: AlloyMatchDetail | null;
}

/**
 * Aggregates crucible slots into per-metal totals with percentages
 */
export function aggregateCrucible(crucible: CrucibleState): MetalAmount[] {
  // Group by metalId and sum nuggets
  const metalMap = new Map<MetalId, number>();

  for (const slot of crucible.slots) {
    if (slot.metalId !== null && slot.nuggets > 0) {
      const currentNuggets = metalMap.get(slot.metalId) || 0;
      metalMap.set(slot.metalId, currentNuggets + slot.nuggets);
    }
  }

  // Calculate total units
  let totalUnits = 0;
  for (const nuggets of metalMap.values()) {
    totalUnits += nuggets * 5;
  }

  // Build MetalAmount array with percentages
  const amounts: MetalAmount[] = [];
  for (const [metalId, nuggets] of metalMap.entries()) {
    const units = nuggets * 5;
    const percent = totalUnits > 0 ? (units / totalUnits) * 100 : 0;

    amounts.push({
      metalId,
      nuggets,
      units,
      percent,
    });
  }

  return amounts;
}

/**
 * Helper: Check if value is within range with tolerance
 */
export function isWithinRange(
  value: number,
  min: number,
  max: number,
  tolerance: number = 0.2
): boolean {
  return value >= min - tolerance && value <= max + tolerance;
}

/**
 * Helper: Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Evaluates composition against all alloy recipes
 */
export function evaluateAlloys(
  amounts: MetalAmount[],
  recipes: AlloyRecipe[]
): EvaluationResult {
  const totalNuggets = amounts.reduce((sum, a) => sum + a.nuggets, 0);
  const totalUnits = amounts.reduce((sum, a) => sum + a.units, 0);

  // If crucible is empty, return early
  if (totalUnits === 0) {
    return {
      amounts,
      totalNuggets,
      totalUnits,
      matches: [],
      bestMatch: null,
    };
  }

  // Create a map for quick metal percentage lookup
  const metalPercentMap = new Map<MetalId, number>();
  for (const amount of amounts) {
    metalPercentMap.set(amount.metalId, amount.percent);
  }

  const matches: AlloyMatchDetail[] = [];

  // Evaluate each recipe
  for (const recipe of recipes) {
    const violations: AlloyViolation[] = [];
    let deviationSum = 0;
    let hasContamination = false;

    // Check all required components
    for (const component of recipe.components) {
      const actualPercent = metalPercentMap.get(component.metalId) || 0;
      const midpoint = (component.minPercent + component.maxPercent) / 2;

      // Calculate deviation from midpoint
      deviationSum += Math.abs(actualPercent - midpoint);

      // Check if within range (with 0.2% tolerance)
      if (!isWithinRange(actualPercent, component.minPercent, component.maxPercent, 0.2)) {
        violations.push({
          metalId: component.metalId,
          requiredMin: component.minPercent,
          requiredMax: component.maxPercent,
          actual: actualPercent,
        });
      }
    }

    // Check for contamination (metals not in recipe)
    const recipeMetalIds = new Set(recipe.components.map(c => c.metalId));
    for (const amount of amounts) {
      if (!recipeMetalIds.has(amount.metalId) && amount.percent > 0.5) {
        hasContamination = true;
        violations.push({
          metalId: amount.metalId,
          actual: amount.percent,
        });
      }
    }

    // Only add as a match if no contamination
    if (!hasContamination) {
      const isExact = violations.length === 0;
      matches.push({
        recipe,
        isExact,
        score: deviationSum,
        violations,
      });
    }
  }

  // Sort matches: exact matches first, then by ascending score
  matches.sort((a, b) => {
    if (a.isExact !== b.isExact) {
      return a.isExact ? -1 : 1;
    }
    return a.score - b.score;
  });

  // Best match is the first one, or null if no matches
  const bestMatch = matches.length > 0 ? matches[0] : null;

  return {
    amounts,
    totalNuggets,
    totalUnits,
    matches,
    bestMatch,
  };
}

/**
 * Creates an empty crucible state
 */
export function createEmptyCrucible(): CrucibleState {
  return {
    slots: [
      { id: 0, metalId: null, nuggets: 0 },
      { id: 1, metalId: null, nuggets: 0 },
      { id: 2, metalId: null, nuggets: 0 },
      { id: 3, metalId: null, nuggets: 0 },
    ],
  };
}

/**
 * Gets compatible metals for a given metal based on alloy recipes
 * Returns all metals that can form an alloy with the given metal
 */
export function getCompatibleMetals(
  metalId: MetalId,
  recipes: AlloyRecipe[]
): MetalId[] {
  const compatibleMetals = new Set<MetalId>();

  // Find all recipes containing the given metalId
  for (const recipe of recipes) {
    const recipeMetalIds = recipe.components.map(c => c.metalId);

    // If this recipe contains the given metal
    if (recipeMetalIds.includes(metalId)) {
      // Add all other metals from this recipe as compatible
      for (const component of recipe.components) {
        if (component.metalId !== metalId) {
          compatibleMetals.add(component.metalId);
        }
      }
    }
  }

  return Array.from(compatibleMetals);
}

/**
 * Filters available metals based on currently selected metals in crucible
 * - If crucible is empty, returns all metals
 * - If one metal is selected, returns only compatible metals (plus the selected metal)
 * - If multiple metals are selected, finds matching alloy recipes and restricts to those metals only
 */
export function getAvailableMetals(
  crucible: CrucibleState,
  allMetals: Metal[],
  recipes: AlloyRecipe[]
): Metal[] {
  // Get all non-null metalIds from crucible
  const selectedMetals = crucible.slots
    .filter(slot => slot.metalId !== null)
    .map(slot => slot.metalId as MetalId);

  // Remove duplicates
  const uniqueSelectedMetals = Array.from(new Set(selectedMetals));

  // If empty, return all metals
  if (uniqueSelectedMetals.length === 0) {
    return allMetals;
  }

  // If one metal selected, return compatible metals plus the selected metal itself
  if (uniqueSelectedMetals.length === 1) {
    const selectedMetalId = uniqueSelectedMetals[0];
    const compatibleMetalIds = getCompatibleMetals(selectedMetalId, recipes);
    // Include both the selected metal and its compatible metals
    return allMetals.filter(metal =>
      metal.id === selectedMetalId || compatibleMetalIds.includes(metal.id)
    );
  }

  // If multiple metals selected, find recipes that contain ALL selected metals
  const matchingRecipes = recipes.filter(recipe => {
    const recipeMetalIds = recipe.components.map(c => c.metalId);
    // Check if all selected metals are in this recipe
    return uniqueSelectedMetals.every(metalId => recipeMetalIds.includes(metalId));
  });

  // If we found matching recipes, return only metals from those recipes
  if (matchingRecipes.length > 0) {
    // Collect all metal IDs from matching recipes
    const allowedMetalIds = new Set<MetalId>();
    for (const recipe of matchingRecipes) {
      for (const component of recipe.components) {
        allowedMetalIds.add(component.metalId);
      }
    }
    return allMetals.filter(metal => allowedMetalIds.has(metal.id));
  }

  // If no matching recipes found (invalid combination), return all metals to allow recovery
  return allMetals;
}

/**
 * Creates a preset crucible for a given alloy recipe
 * Calculates midpoint percentages and scales based on ingot amount
 * Distributes metals across slots with proper rounding
 * @param recipe - The alloy recipe to create a preset for
 * @param ingotAmount - Number of ingots to create (default: 1)
 */
export function createPresetForAlloy(recipe: AlloyRecipe, ingotAmount: number = 1): CrucibleState {
  const NUGGETS_PER_INGOT = 20;
  const targetNuggets = NUGGETS_PER_INGOT * ingotAmount;

  // Calculate midpoint percentages for each component
  const componentData = recipe.components.map(component => {
    const midpointPercent = (component.minPercent + component.maxPercent) / 2;
    return {
      metalId: component.metalId,
      targetPercent: midpointPercent,
    };
  });

  // Calculate initial nugget amounts based on percentages
  const initialNuggets = componentData.map(comp => ({
    metalId: comp.metalId,
    nuggets: Math.round((comp.targetPercent / 100) * targetNuggets),
  }));

  // Adjust for rounding errors to ensure we have exactly targetNuggets total
  const totalNuggets = initialNuggets.reduce((sum, item) => sum + item.nuggets, 0);

  if (totalNuggets !== targetNuggets) {
    const diff = targetNuggets - totalNuggets;
    // Add/subtract the difference to/from the largest component
    const largestIndex = initialNuggets.reduce(
      (maxIdx, item, idx, arr) => (item.nuggets > arr[maxIdx].nuggets ? idx : maxIdx),
      0
    );
    initialNuggets[largestIndex].nuggets += diff;
  }

  // Create crucible state with metals distributed across slots
  const crucible = createEmptyCrucible();
  const MAX_NUGGETS_PER_SLOT = 128;

  // Distribute metals across slots, splitting if needed
  let slotIndex = 0;
  for (const item of initialNuggets) {
    let remainingNuggets = item.nuggets;

    while (remainingNuggets > 0 && slotIndex < 4) {
      const nuggetsForSlot = Math.min(remainingNuggets, MAX_NUGGETS_PER_SLOT);
      crucible.slots[slotIndex].metalId = item.metalId;
      crucible.slots[slotIndex].nuggets = nuggetsForSlot;
      remainingNuggets -= nuggetsForSlot;
      slotIndex++;
    }
  }

  return crucible;
}
