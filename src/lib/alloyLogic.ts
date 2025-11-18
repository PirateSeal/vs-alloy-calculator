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

export interface NuggetAdjustment {
  metalId: MetalId;
  currentNuggets: number;
  targetNuggets: number;
  delta: number;
  action: 'add' | 'remove' | 'ok';
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
  tolerance: number = 0.5
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

      // Check if within range with small tolerance for floating point precision
      // Tolerance of 0.01% to handle rounding errors
      const tolerance = 0.01;
      if (actualPercent < component.minPercent - tolerance || actualPercent > component.maxPercent + tolerance) {
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
 * Optimizes for efficient slot usage by preferring multiples of 128, 96, 64, 32
 * while maintaining exact ingot counts and staying within percentage ranges
 * @param recipe - The alloy recipe to create a preset for
 * @param ingotAmount - Number of ingots to create (default: 1)
 */
export function createPresetForAlloy(recipe: AlloyRecipe, ingotAmount: number = 1): CrucibleState {
  const NUGGETS_PER_INGOT = 20;
  const UNITS_PER_INGOT = 100;
  const MAX_NUGGETS_PER_SLOT = 128;

  const targetNuggets = NUGGETS_PER_INGOT * ingotAmount;
  const targetUnits = UNITS_PER_INGOT * ingotAmount;

  // Helper function to find the best "round" number near a target
  // Prefers 128, 96, 64, 32, 16 for efficient slot usage
  function findOptimalNuggets(target: number, minUnits: number, maxUnits: number): number {
    const minNuggets = Math.ceil(minUnits / 5);
    const maxNuggets = Math.floor(maxUnits / 5);

    // Preferred values in order of efficiency
    const preferredMultiples = [128, 96, 64, 32, 16, 8];

    // Try to find a multiple that's close to target and within range
    for (const mult of preferredMultiples) {
      const candidates = [
        Math.floor(target / mult) * mult,
        Math.ceil(target / mult) * mult,
      ];

      for (const candidate of candidates) {
        if (candidate >= minNuggets && candidate <= maxNuggets && candidate > 0) {
          return candidate;
        }
      }
    }

    // If no preferred multiple works, just clamp to range
    return Math.max(minNuggets, Math.min(maxNuggets, Math.round(target)));
  }

  // Calculate initial allocation using optimization
  const allocations: Array<{
    metalId: MetalId;
    nuggets: number;
    minPercent: number;
    maxPercent: number;
  }> = [];

  let remainingNuggets = targetNuggets;

  // Process all components except the last one
  for (let i = 0; i < recipe.components.length - 1; i++) {
    const comp = recipe.components[i];
    const midPercent = (comp.minPercent + comp.maxPercent) / 2;

    // Calculate target based on midpoint
    const targetForComp = (targetNuggets * midPercent) / 100;

    // Calculate min/max based on percentage constraints
    const minUnits = (targetUnits * comp.minPercent) / 100;
    const maxUnits = (targetUnits * comp.maxPercent) / 100;

    // Find optimal nuggets
    const nuggets = findOptimalNuggets(targetForComp, minUnits, maxUnits);

    allocations.push({
      metalId: comp.metalId,
      nuggets,
      minPercent: comp.minPercent,
      maxPercent: comp.maxPercent,
    });

    remainingNuggets -= nuggets;
  }

  // Last component gets whatever's left
  const lastComp = recipe.components[recipe.components.length - 1];
  allocations.push({
    metalId: lastComp.metalId,
    nuggets: remainingNuggets,
    minPercent: lastComp.minPercent,
    maxPercent: lastComp.maxPercent,
  });

  // Validate that all percentages are within range
  let isValid = true;
  for (const alloc of allocations) {
    const units = alloc.nuggets * 5;
    const percent = (units / targetUnits) * 100;

    if (percent < alloc.minPercent - 0.01 || percent > alloc.maxPercent + 0.01) {
      isValid = false;
      break;
    }
  }

  // If invalid, fall back to simple midpoint calculation
  if (!isValid) {
    allocations.length = 0;
    remainingNuggets = targetNuggets;

    for (let i = 0; i < recipe.components.length - 1; i++) {
      const comp = recipe.components[i];
      const midPercent = (comp.minPercent + comp.maxPercent) / 2;
      const nuggets = Math.round((targetNuggets * midPercent) / 100);

      allocations.push({
        metalId: comp.metalId,
        nuggets,
        minPercent: comp.minPercent,
        maxPercent: comp.maxPercent,
      });

      remainingNuggets -= nuggets;
    }

    const lastComp = recipe.components[recipe.components.length - 1];
    allocations.push({
      metalId: lastComp.metalId,
      nuggets: remainingNuggets,
      minPercent: lastComp.minPercent,
      maxPercent: lastComp.maxPercent,
    });
  }

  // Create crucible state with metals distributed across slots
  const crucible = createEmptyCrucible();

  // Distribute metals across slots, splitting if needed
  let slotIndex = 0;
  for (const alloc of allocations) {
    let remainingNuggets = alloc.nuggets;

    while (remainingNuggets > 0 && slotIndex < 4) {
      const nuggetsForSlot = Math.min(remainingNuggets, MAX_NUGGETS_PER_SLOT);
      crucible.slots[slotIndex].metalId = alloc.metalId;
      crucible.slots[slotIndex].nuggets = nuggetsForSlot;
      remainingNuggets -= nuggetsForSlot;
      slotIndex++;
    }
  }

  return crucible;
}

/**
 * Detects which alloy recipe the current crucible matches (for tracking preset state)
 * Returns the matching recipe or null if no exact match is found
 */
export function detectCurrentAlloy(
  crucible: CrucibleState,
  recipes: AlloyRecipe[]
): AlloyRecipe | null {
  const amounts = aggregateCrucible(crucible);

  // If crucible is empty, no alloy
  if (amounts.length === 0) {
    return null;
  }

  const evaluation = evaluateAlloys(amounts, recipes);

  // Return the recipe if we have an exact match
  if (evaluation.bestMatch && evaluation.bestMatch.isExact) {
    return evaluation.bestMatch.recipe;
  }

  return null;
}

/**
 * Adjusts crucible slots to maintain alloy ratio when one slot changes
 * Uses the same calculation logic as the original VS alloy calculator
 * Based on: https://art.twgserver.ru/vsalloys/
 */
export function adjustCrucibleForAlloy(
  crucible: CrucibleState,
  changedSlotId: number,
  targetRecipe: AlloyRecipe | null
): CrucibleState {
  if (!targetRecipe) {
    return crucible;
  }

  const changedSlot = crucible.slots.find(s => s.id === changedSlotId);
  if (!changedSlot || changedSlot.metalId === null || changedSlot.nuggets === 0) {
    return crucible;
  }

  // Find the component index for the changed slot's metal
  const changedComponentIndex = targetRecipe.components.findIndex(
    c => c.metalId === changedSlot.metalId
  );

  if (changedComponentIndex === -1) {
    return crucible;
  }

  // Get the midpoint percentage for the changed metal
  const changedComponent = targetRecipe.components[changedComponentIndex];
  const changedPercent = (changedComponent.minPercent + changedComponent.maxPercent) / 2;

  // Calculate ppp (ingots * 100) based on the changed slot
  // changedSlot.nuggets * 5 = units, and units should be changedPercent% of total
  // So: ppp = (changedSlot.nuggets * 5 * 100) / changedPercent
  const ppp = (changedSlot.nuggets * 5 * 100) / changedPercent;

  // Calculate units needed for each metal (except the last one)
  const unitsNeeded: number[] = [];
  for (let m = 0; m < targetRecipe.components.length - 1; m++) {
    const component = targetRecipe.components[m];
    const midPercent = (component.minPercent + component.maxPercent) / 2;

    // Calculate target units
    const index = ppp * midPercent / 100;

    // Round up to nearest multiple of 5
    let roundedUnits = 5;
    while (roundedUnits < index) {
      roundedUnits += 5;
    }

    // Ensure it doesn't exceed max percentage
    const maxUnits = (ppp * component.maxPercent) / 100;
    if (roundedUnits > maxUnits) {
      roundedUnits -= 5;
    }

    unitsNeeded.push(roundedUnits);
  }

  // Calculate last metal's units (whatever's left to make 100%)
  const sumOfOtherUnits = unitsNeeded.reduce((sum, units) => sum + units, 0);
  const lastUnits = ppp - sumOfOtherUnits;
  unitsNeeded.push(lastUnits);

  // Validate that last metal is within its range
  const lastComponent = targetRecipe.components[targetRecipe.components.length - 1];
  const lastMinUnits = (ppp * lastComponent.minPercent) / 100;
  const lastMaxUnits = (ppp * lastComponent.maxPercent) / 100;

  if (lastUnits < lastMinUnits || lastUnits > lastMaxUnits) {
    // Invalid configuration, return unchanged
    return crucible;
  }

  // Convert units to nuggets and distribute across slots
  const slots: Array<{ metalId: MetalId; nuggets: number }> = [];

  for (let n = 0; n < unitsNeeded.length; n++) {
    const metalId = targetRecipe.components[n].metalId;
    const units = unitsNeeded[n];
    const totalNuggets = units / 5;

    // Split into 128-nugget chunks if needed
    const fullSlots = Math.floor(totalNuggets / 128);
    let remainingNuggets = totalNuggets;

    for (let x = 0; x < fullSlots; x++) {
      slots.push({ metalId, nuggets: 128 });
      remainingNuggets -= 128;
    }

    if (remainingNuggets > 0 || fullSlots === 0) {
      slots.push({ metalId, nuggets: Math.round(remainingNuggets) });
    }
  }

  // Check if it fits in 4 slots
  if (slots.length > 4) {
    // Doesn't fit, return unchanged
    return crucible;
  }

  // Create new crucible state
  const newCrucible = createEmptyCrucible();
  for (let i = 0; i < slots.length; i++) {
    newCrucible.slots[i].metalId = slots[i].metalId;
    newCrucible.slots[i].nuggets = slots[i].nuggets;
  }

  return newCrucible;
}

/**
 * Calculates the maximum number of ingots that can be made for a given alloy recipe
 * Uses the same logic as the original calculator
 */
export function calculateMaxIngots(recipe: AlloyRecipe): number {
  let maxIngots = 1;
  let isFullCrucible = false;

  while (!isFullCrucible) {
    maxIngots++;
    const ppp = maxIngots * 100;

    // Calculate units for each metal except the last
    const unitsNeeded: number[] = [];
    for (let m = 0; m < recipe.components.length - 1; m++) {
      const component = recipe.components[m];
      const midPercent = (component.minPercent + component.maxPercent) / 2;

      const index = ppp * midPercent / 100;
      let roundedUnits = 5;
      while (roundedUnits < index) {
        roundedUnits += 5;
      }

      const maxUnits = (ppp * component.maxPercent) / 100;
      if (roundedUnits > maxUnits) {
        roundedUnits -= 5;
      }

      unitsNeeded.push(roundedUnits);
    }

    // Calculate last metal
    const sumOfOtherUnits = unitsNeeded.reduce((sum, units) => sum + units, 0);
    const lastUnits = ppp - sumOfOtherUnits;
    unitsNeeded.push(lastUnits);

    // Check if last metal is valid
    const lastComponent = recipe.components[recipe.components.length - 1];
    const lastMinUnits = (ppp * lastComponent.minPercent) / 100;
    const lastMaxUnits = (ppp * lastComponent.maxPercent) / 100;

    if (lastUnits >= lastMinUnits && lastUnits <= lastMaxUnits) {
      // Count slots needed
      let slotsNeeded = 0;
      for (const units of unitsNeeded) {
        const nuggets = units / 5;
        const fullSlots = Math.floor(nuggets / 128);
        const hasRemainder = (nuggets % 128) > 0 || fullSlots === 0;
        slotsNeeded += fullSlots + (hasRemainder ? 1 : 0);
      }

      if (slotsNeeded > 4) {
        isFullCrucible = true;
        return maxIngots - 1;
      }
    }
  }

  return maxIngots;
}

/**
 * Calculates the maximum number of ingots achievable for a specific preset configuration
 * This accounts for the actual nugget distribution used by the optimized preset
 */
export function calculateMaxIngotsForPreset(recipe: AlloyRecipe): number {
  const NUGGETS_PER_INGOT = 20;
  const UNITS_PER_INGOT = 100;
  const MAX_NUGGETS_PER_SLOT = 128;
  const MAX_SLOTS = 4;

  // Helper to find optimal nuggets (same as in createPresetForAlloy)
  function findOptimalNuggets(target: number, minUnits: number, maxUnits: number): number {
    const minNuggets = Math.ceil(minUnits / 5);
    const maxNuggets = Math.floor(maxUnits / 5);
    const preferredMultiples = [128, 96, 64, 32, 16, 8];

    for (const mult of preferredMultiples) {
      const candidates = [
        Math.floor(target / mult) * mult,
        Math.ceil(target / mult) * mult,
      ];

      for (const candidate of candidates) {
        if (candidate >= minNuggets && candidate <= maxNuggets && candidate > 0) {
          return candidate;
        }
      }
    }

    return Math.max(minNuggets, Math.min(maxNuggets, Math.round(target)));
  }

  // Binary search for maximum ingots
  let low = 1;
  let high = 50; // Start with a reasonable upper bound
  let maxValid = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const targetNuggets = NUGGETS_PER_INGOT * mid;
    const targetUnits = UNITS_PER_INGOT * mid;

    // Try to allocate using the optimization strategy
    let allocations: number[] = [];
    let remainingNuggets = targetNuggets;
    let isValid = true;

    // Process all components except the last
    for (let i = 0; i < recipe.components.length - 1; i++) {
      const comp = recipe.components[i];
      const midPercent = (comp.minPercent + comp.maxPercent) / 2;
      const targetForComp = (targetNuggets * midPercent) / 100;
      const minUnits = (targetUnits * comp.minPercent) / 100;
      const maxUnits = (targetUnits * comp.maxPercent) / 100;

      const nuggets = findOptimalNuggets(targetForComp, minUnits, maxUnits);
      allocations.push(nuggets);
      remainingNuggets -= nuggets;
    }

    // Last component gets remainder
    allocations.push(remainingNuggets);

    // Validate percentages
    for (let i = 0; i < allocations.length; i++) {
      const units = allocations[i] * 5;
      const percent = (units / targetUnits) * 100;
      const comp = recipe.components[i];

      if (percent < comp.minPercent - 0.01 || percent > comp.maxPercent + 0.01) {
        isValid = false;
        break;
      }
    }

    // If optimization failed, try simple midpoint calculation
    if (!isValid) {
      allocations = [];
      remainingNuggets = targetNuggets;
      isValid = true;

      for (let i = 0; i < recipe.components.length - 1; i++) {
        const comp = recipe.components[i];
        const midPercent = (comp.minPercent + comp.maxPercent) / 2;
        const nuggets = Math.round((targetNuggets * midPercent) / 100);
        allocations.push(nuggets);
        remainingNuggets -= nuggets;
      }

      allocations.push(remainingNuggets);

      // Validate percentages again
      for (let i = 0; i < allocations.length; i++) {
        const units = allocations[i] * 5;
        const percent = (units / targetUnits) * 100;
        const comp = recipe.components[i];

        if (percent < comp.minPercent - 0.01 || percent > comp.maxPercent + 0.01) {
          isValid = false;
          break;
        }
      }
    }

    // Count slots needed
    let slotsNeeded = 0;
    if (isValid) {
      for (const nuggets of allocations) {
        let remaining = nuggets;
        while (remaining > 0) {
          slotsNeeded++;
          remaining -= MAX_NUGGETS_PER_SLOT;
        }
      }

      if (slotsNeeded > MAX_SLOTS) {
        isValid = false;
      }
    }

    if (isValid) {
      maxValid = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return maxValid;
}

/**
 * Calculates concrete nugget adjustments needed to fix an invalid alloy composition
 * Returns adjustments for each metal showing how many nuggets to add/remove
 * If total units < 100, scales up to at least 1 ingot (100 units)
 * If total units > 100, rounds down to nearest ingot amount
 * Uses a minimal-change strategy when close to valid
 */
export function calculateNuggetAdjustments(
  amounts: MetalAmount[],
  recipe: AlloyRecipe,
  violations: AlloyViolation[]
): NuggetAdjustment[] {
  const totalUnits = amounts.reduce((sum, a) => sum + a.units, 0);
  const totalNuggets = amounts.reduce((sum, a) => sum + a.nuggets, 0);

  if (totalUnits === 0) {
    return [];
  }

  // Round to nearest ingot amount (100 units per ingot)
  const UNITS_PER_INGOT = 100;
  const NUGGETS_PER_INGOT = 20;
  const currentIngots = Math.floor(totalUnits / UNITS_PER_INGOT);
  const targetIngots = Math.max(currentIngots, 1);
  const targetTotalUnits = targetIngots * UNITS_PER_INGOT;
  const targetTotalNuggets = targetIngots * NUGGETS_PER_INGOT;

  // Check if we're only slightly over (within 10 nuggets of a valid ingot amount)
  const excessNuggets = totalNuggets - targetTotalNuggets;
  const isSlightlyOver = excessNuggets > 0 && excessNuggets <= 10;

  // If we're only slightly over, try a minimal adjustment strategy
  if (isSlightlyOver) {
    // Try to remove excess from metals that are over their max percentage
    const minimalAdjustments: NuggetAdjustment[] = [];
    let remainingExcess = excessNuggets;

    // First pass: identify metals that are over their max percentage
    for (const component of recipe.components) {
      const currentAmount = amounts.find(a => a.metalId === component.metalId);
      const currentNuggets = currentAmount?.nuggets || 0;
      const currentPercent = currentAmount?.percent || 0;

      // Check if this metal is over its max percentage
      if (currentPercent > component.maxPercent) {
        // Calculate how many nuggets we can remove while staying above min
        const minUnits = (targetTotalUnits * component.minPercent) / 100;
        const minNuggets = Math.ceil(minUnits / 5);
        const maxRemovable = Math.max(0, currentNuggets - minNuggets);

        // Remove as much excess as possible from this metal
        const toRemove = Math.min(remainingExcess, maxRemovable);
        if (toRemove > 0) {
          minimalAdjustments.push({
            metalId: component.metalId,
            currentNuggets,
            targetNuggets: currentNuggets - toRemove,
            delta: -toRemove,
            action: 'remove',
          });
          remainingExcess -= toRemove;
        }
      }
    }

    // If we successfully removed all excess with minimal changes, use that
    if (remainingExcess === 0) {
      // Add 'ok' entries for metals that don't need adjustment
      for (const component of recipe.components) {
        if (!minimalAdjustments.find(adj => adj.metalId === component.metalId)) {
          const currentAmount = amounts.find(a => a.metalId === component.metalId);
          const currentNuggets = currentAmount?.nuggets || 0;
          minimalAdjustments.push({
            metalId: component.metalId,
            currentNuggets,
            targetNuggets: currentNuggets,
            delta: 0,
            action: 'ok',
          });
        }
      }
      return minimalAdjustments;
    }
  }

  // Fall back to full recalculation using midpoint percentages
  const adjustments: NuggetAdjustment[] = [];

  for (const component of recipe.components) {
    const currentAmount = amounts.find(a => a.metalId === component.metalId);
    const currentNuggets = currentAmount?.nuggets || 0;

    // Calculate target percentage (midpoint of range)
    const targetPercent = (component.minPercent + component.maxPercent) / 2;

    // Calculate target units and nuggets based on target total
    const targetUnits = (targetTotalUnits * targetPercent) / 100;
    const targetNuggets = Math.round(targetUnits / 5);

    const delta = targetNuggets - currentNuggets;

    let action: 'add' | 'remove' | 'ok' = 'ok';
    if (delta > 0) {
      action = 'add';
    } else if (delta < 0) {
      action = 'remove';
    }

    // Check if this metal has a violation
    const violation = violations.find(v => v.metalId === component.metalId);
    if (violation || Math.abs(delta) > 0) {
      adjustments.push({
        metalId: component.metalId,
        currentNuggets,
        targetNuggets,
        delta,
        action,
      });
    }
  }

  return adjustments;
}

/**
 * Creates a summary text for adjustments needed
 * Returns a human-readable string like "Add 18 Cu nuggets and remove 5 Sn nuggets"
 */
export function getAdjustmentSummary(
  adjustments: NuggetAdjustment[],
  metalMap: Map<string, { label: string; shortLabel: string }>
): string {
  const actions: string[] = [];

  for (const adj of adjustments) {
    if (adj.action === 'ok') continue;

    const metal = metalMap.get(adj.metalId);
    const metalLabel = metal?.shortLabel || adj.metalId;
    const absDelta = Math.abs(adj.delta);

    if (adj.action === 'add') {
      actions.push(`Add ${absDelta} ${metalLabel} nugget${absDelta !== 1 ? 's' : ''}`);
    } else if (adj.action === 'remove') {
      actions.push(`Remove ${absDelta} ${metalLabel} nugget${absDelta !== 1 ? 's' : ''}`);
    }
  }

  if (actions.length === 0) {
    return '';
  }

  if (actions.length === 1) {
    return actions[0];
  }

  // Join with "and" for the last item
  const lastAction = actions.pop();
  return `${actions.join(', ')} and ${lastAction}`;
}

/**
 * Applies nugget adjustments to create a valid alloy composition
 * Returns a new crucible state with adjusted nuggets
 */
export function applyNuggetAdjustments(
  crucible: CrucibleState,
  adjustments: NuggetAdjustment[]
): CrucibleState {
  const newSlots = [...crucible.slots];
  const MAX_NUGGETS_PER_SLOT = 128;

  // Create a map of metalId to total target nuggets
  const targetNuggetsMap = new Map<MetalId, number>();
  for (const adj of adjustments) {
    targetNuggetsMap.set(adj.metalId, adj.targetNuggets);
  }

  // Clear existing slots
  const clearedSlots = newSlots.map(slot => ({ ...slot, metalId: null as MetalId | null, nuggets: 0 }));

  // Distribute target nuggets across slots
  let slotIndex = 0;
  for (const [metalId, totalNuggets] of targetNuggetsMap.entries()) {
    let remainingNuggets = totalNuggets;

    while (remainingNuggets > 0 && slotIndex < 4) {
      const nuggetsForSlot = Math.min(remainingNuggets, MAX_NUGGETS_PER_SLOT);
      clearedSlots[slotIndex].metalId = metalId;
      clearedSlots[slotIndex].nuggets = nuggetsForSlot;
      remainingNuggets -= nuggetsForSlot;
      slotIndex++;
    }
  }

  return { slots: clearedSlots };
}
