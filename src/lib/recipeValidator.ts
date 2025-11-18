import type { CrucibleState } from "../types/crucible";
import type { AlloyRecipe, MetalId } from "../types/alloys";
import type { MetalAmount } from "./metalRarity";

/**
 * Result of recipe validation
 */
export interface RecipeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that the crucible uses at most 4 slots
 * @param crucible - The crucible state to validate
 * @returns true if slot count is valid (≤ 4)
 */
export function validateSlotCount(crucible: CrucibleState): boolean {
  const nonEmptySlots = crucible.slots.filter(
    (slot) => slot.metalId !== null && slot.nuggets > 0
  );
  return nonEmptySlots.length <= 4;
}

/**
 * Validate that no slot exceeds 128 nuggets
 * @param crucible - The crucible state to validate
 * @returns true if all slots have ≤ 128 nuggets
 */
export function validateSlotCapacity(crucible: CrucibleState): boolean {
  return crucible.slots.every((slot) => slot.nuggets <= 128);
}

/**
 * Validate that all metal percentages fall within recipe ranges
 * @param amounts - Array of metal amounts
 * @param recipe - The alloy recipe with percentage constraints
 * @returns true if all percentages are within valid ranges
 */
export function validatePercentages(
  amounts: MetalAmount[],
  recipe: AlloyRecipe
): boolean {
  // Calculate total units
  const totalUnits = amounts.reduce(
    (sum, amount) => sum + amount.nuggets * 5,
    0
  );

  if (totalUnits === 0) {
    return false;
  }

  // Check each component in the recipe
  for (const component of recipe.components) {
    const metalAmount = amounts.find((a) => a.metalId === component.metalId);

    if (!metalAmount || metalAmount.nuggets === 0) {
      return false; // Required metal is missing
    }

    const units = metalAmount.nuggets * 5;
    const percentage = (units / totalUnits) * 100;

    // Allow 0.01% tolerance for floating point precision
    const minValid = component.minPercent - 0.01;
    const maxValid = component.maxPercent + 0.01;

    if (percentage < minValid || percentage > maxValid) {
      return false;
    }
  }

  return true;
}

/**
 * Validate that total units equal exactly 100 times the ingot count
 * @param amounts - Array of metal amounts
 * @param ingotCount - Expected number of ingots
 * @returns true if total units = ingotCount × 100
 */
export function validateTotalUnits(
  amounts: MetalAmount[],
  ingotCount: number
): boolean {
  const totalUnits = amounts.reduce(
    (sum, amount) => sum + amount.nuggets * 5,
    0
  );
  return totalUnits === ingotCount * 100;
}

/**
 * Validate that all required metals are present with at least one nugget
 * @param amounts - Array of metal amounts
 * @param recipe - The alloy recipe with required components
 * @returns true if all required metals are present
 */
export function validateComponentPresence(
  amounts: MetalAmount[],
  recipe: AlloyRecipe
): boolean {
  for (const component of recipe.components) {
    const metalAmount = amounts.find((a) => a.metalId === component.metalId);
    if (!metalAmount || metalAmount.nuggets <= 0) {
      return false;
    }
  }
  return true;
}

/**
 * Main validation function that checks all constraints
 * @param crucible - The crucible state to validate
 * @param recipe - The alloy recipe to validate against
 * @param ingotCount - Expected number of ingots
 * @returns Validation result with errors and warnings
 */
export function validateRecipe(
  crucible: CrucibleState,
  recipe: AlloyRecipe,
  ingotCount: number
): RecipeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Convert crucible to metal amounts
  const amounts: MetalAmount[] = [];
  const metalTotals = new Map<MetalId, number>();

  for (const slot of crucible.slots) {
    if (slot.metalId && slot.nuggets > 0) {
      const current = metalTotals.get(slot.metalId) || 0;
      metalTotals.set(slot.metalId, current + slot.nuggets);
    }
  }

  metalTotals.forEach((nuggets, metalId) => {
    amounts.push({ metalId, nuggets });
  });

  // Validate slot count
  if (!validateSlotCount(crucible)) {
    errors.push("Crucible exceeds maximum of 4 slots");
  }

  // Validate slot capacity
  if (!validateSlotCapacity(crucible)) {
    errors.push("One or more slots exceed 128 nugget capacity");
  }

  // Validate component presence
  if (!validateComponentPresence(amounts, recipe)) {
    errors.push("Recipe is missing one or more required metal components");
  }

  // Validate total units
  if (!validateTotalUnits(amounts, ingotCount)) {
    const totalUnits = amounts.reduce(
      (sum, amount) => sum + amount.nuggets * 5,
      0
    );
    errors.push(
      `Total units (${totalUnits}) does not equal ${ingotCount} × 100 = ${ingotCount * 100}`
    );
  }

  // Validate percentages
  if (!validatePercentages(amounts, recipe)) {
    errors.push("One or more metal percentages are outside valid ranges");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
