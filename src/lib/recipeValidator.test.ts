import { describe, it, expect } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import {
  validateSlotCount,
  validateSlotCapacity,
  validatePercentages,
  validateTotalUnits,
  validateComponentPresence,
  validateRecipe,
} from './recipeValidator';
import type { CrucibleState } from '../types/crucible';
import type { AlloyRecipe, MetalId } from '../types/alloys';
import type { MetalAmount } from './metalRarity';
import { ALLOY_RECIPES } from '../data/alloys';

describe('Recipe Validator', () => {
  describe('validateSlotCount', () => {
    it('should return true for empty crucible', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: null, nuggets: 0 },
          { id: 1, metalId: null, nuggets: 0 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCount(crucible)).toBe(true);
    });

    it('should return true for exactly 4 slots', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 10 },
          { id: 1, metalId: 'tin', nuggets: 10 },
          { id: 2, metalId: 'zinc', nuggets: 10 },
          { id: 3, metalId: 'gold', nuggets: 10 },
        ],
      };
      expect(validateSlotCount(crucible)).toBe(true);
    });

    it('should return true for less than 4 slots', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 10 },
          { id: 1, metalId: 'tin', nuggets: 10 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCount(crucible)).toBe(true);
    });
  });

  describe('validateSlotCapacity', () => {
    it('should return true when all slots are within capacity', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 128 },
          { id: 1, metalId: 'tin', nuggets: 64 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCapacity(crucible)).toBe(true);
    });

    it('should return false when any slot exceeds 128 nuggets', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 129 },
          { id: 1, metalId: 'tin', nuggets: 10 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCapacity(crucible)).toBe(false);
    });
  });

  describe('validatePercentages', () => {
    it('should return true for valid tin bronze recipe', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 18 }, // 90 units = 90%
        { metalId: 'tin', nuggets: 2 },     // 10 units = 10%
      ];
      expect(validatePercentages(amounts, recipe)).toBe(true);
    });

    it('should return false when percentage is below minimum', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 19 }, // 95 units = 95%
        { metalId: 'tin', nuggets: 1 },     // 5 units = 5% (below 8% min)
      ];
      expect(validatePercentages(amounts, recipe)).toBe(false);
    });

    it('should return false when percentage is above maximum', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 19 }, // 95 units = 95% (above 92% max)
        { metalId: 'tin', nuggets: 1 },     // 5 units = 5%
      ];
      expect(validatePercentages(amounts, recipe)).toBe(false);
    });

    it('should return false when required metal is missing', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 20 }, // 100% copper, no tin
      ];
      expect(validatePercentages(amounts, recipe)).toBe(false);
    });
  });

  describe('validateTotalUnits', () => {
    it('should return true when units equal ingots × 100', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 18 }, // 90 units
        { metalId: 'tin', nuggets: 2 },     // 10 units
      ];
      expect(validateTotalUnits(amounts, 1)).toBe(true);
    });

    it('should return false when units do not match', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 18 }, // 90 units
        { metalId: 'tin', nuggets: 2 },     // 10 units
      ];
      expect(validateTotalUnits(amounts, 2)).toBe(false);
    });
  });

  describe('validateComponentPresence', () => {
    it('should return true when all components are present', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 18 },
        { metalId: 'tin', nuggets: 2 },
      ];
      expect(validateComponentPresence(amounts, recipe)).toBe(true);
    });

    it('should return false when a component is missing', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 20 },
      ];
      expect(validateComponentPresence(amounts, recipe)).toBe(false);
    });

    it('should return false when a component has zero nuggets', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 20 },
        { metalId: 'tin', nuggets: 0 },
      ];
      expect(validateComponentPresence(amounts, recipe)).toBe(false);
    });
  });

  describe('validateRecipe', () => {
    it('should validate a correct tin bronze recipe', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 18 },
          { id: 1, metalId: 'tin', nuggets: 2 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      const result = validateRecipe(crucible, recipe, 1);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should report error for exceeding slot capacity', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 129 },
          { id: 1, metalId: 'tin', nuggets: 2 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      const result = validateRecipe(crucible, recipe, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One or more slots exceed 128 nugget capacity');
    });

    it('should report error for missing component', () => {
      const recipe = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 20 },
          { id: 1, metalId: null, nuggets: 0 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      const result = validateRecipe(crucible, recipe, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Recipe is missing one or more required metal components');
    });
  });

  // Property-Based Tests

  /**
   * Feature: recipe-optimizer, Property 3: Slot count constraint
   * Validates: Requirements 2.1, 5.1
   *
   * For any optimized recipe regardless of mode, the number of non-empty
   * crucible slots should not exceed 4.
   */
  test.prop([
    fc.array(
      fc.record({
        id: fc.integer({ min: 0, max: 10 }),
        metalId: fc.constantFrom<MetalId | null>(
          'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel', null
        ),
        nuggets: fc.integer({ min: 0, max: 128 }),
      }),
      { minLength: 1, maxLength: 10 }
    )
  ], { numRuns: 100 })('Property 3: Slot count constraint', (slots) => {
    const crucible: CrucibleState = { slots };

    const nonEmptySlots = slots.filter(
      (slot) => slot.metalId !== null && slot.nuggets > 0
    );

    const isValid = validateSlotCount(crucible);

    // The validation should return true if and only if non-empty slots <= 4
    expect(isValid).toBe(nonEmptySlots.length <= 4);
  });

  /**
   * Feature: recipe-optimizer, Property 4: Percentage validity invariant
   * Validates: Requirements 2.2, 5.3, 6.5
   *
   * For any optimized recipe regardless of mode, every metal component's
   * percentage should fall within its required minimum and maximum range
   * (with tolerance of 0.01% for floating point precision).
   */
  test.prop([
    fc.constantFrom(...ALLOY_RECIPES),
    fc.array(
      fc.record({
        metalId: fc.constantFrom<MetalId>(
          'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel'
        ),
        nuggets: fc.integer({ min: 1, max: 128 }),
      }),
      { minLength: 1, maxLength: 4 }
    )
  ], { numRuns: 100 })('Property 4: Percentage validity invariant', (recipe, amounts) => {
    const isValid = validatePercentages(amounts, recipe);

    // Calculate actual percentages
    const totalUnits = amounts.reduce((sum, a) => sum + a.nuggets * 5, 0);

    if (totalUnits === 0) {
      expect(isValid).toBe(false);
      return;
    }

    // Check if all required components are present
    const hasAllComponents = recipe.components.every((comp) =>
      amounts.some((a) => a.metalId === comp.metalId && a.nuggets > 0)
    );

    if (!hasAllComponents) {
      expect(isValid).toBe(false);
      return;
    }

    // Check if all percentages are within range
    let allInRange = true;
    for (const component of recipe.components) {
      const metalAmount = amounts.find((a) => a.metalId === component.metalId);
      if (metalAmount) {
        const percentage = (metalAmount.nuggets * 5 / totalUnits) * 100;
        const minValid = component.minPercent - 0.01;
        const maxValid = component.maxPercent + 0.01;
        if (percentage < minValid || percentage > maxValid) {
          allInRange = false;
          break;
        }
      }
    }

    expect(isValid).toBe(allInRange);
  });

  /**
   * Feature: recipe-optimizer, Property 5: Slot capacity constraint
   * Validates: Requirements 2.3, 5.2
   *
   * For any optimized recipe regardless of mode, no individual crucible slot
   * should contain more than 128 nuggets.
   */
  test.prop([
    fc.array(
      fc.record({
        id: fc.integer({ min: 0, max: 10 }),
        metalId: fc.constantFrom<MetalId | null>(
          'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel', null
        ),
        nuggets: fc.integer({ min: 0, max: 200 }), // Allow exceeding to test constraint
      }),
      { minLength: 1, maxLength: 10 }
    )
  ], { numRuns: 100 })('Property 5: Slot capacity constraint', (slots) => {
    const crucible: CrucibleState = { slots };

    const isValid = validateSlotCapacity(crucible);

    // Check if all slots have <= 128 nuggets
    const allWithinCapacity = slots.every((slot) => slot.nuggets <= 128);

    expect(isValid).toBe(allWithinCapacity);
  });

  /**
   * Feature: recipe-optimizer, Property 6: Total units invariant
   * Validates: Requirements 5.4, 6.3
   *
   * For any optimized recipe regardless of mode, the total units
   * (sum of all nuggets × 5) should equal exactly 100 times the reported ingot count.
   */
  test.prop([
    fc.array(
      fc.record({
        metalId: fc.constantFrom<MetalId>(
          'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel'
        ),
        nuggets: fc.integer({ min: 0, max: 128 }),
      }),
      { minLength: 1, maxLength: 4 }
    ),
    fc.integer({ min: 1, max: 25 })
  ], { numRuns: 100 })('Property 6: Total units invariant', (amounts, ingotCount) => {
    const isValid = validateTotalUnits(amounts, ingotCount);

    const totalUnits = amounts.reduce((sum, a) => sum + a.nuggets * 5, 0);
    const expectedUnits = ingotCount * 100;

    expect(isValid).toBe(totalUnits === expectedUnits);
  });

  /**
   * Feature: recipe-optimizer, Property 7: Multi-component distribution
   * Validates: Requirements 6.2
   *
   * For any alloy recipe with three or more metal components, when optimized
   * in either mode, the resulting crucible should contain at least one nugget
   * of each required metal component.
   */
  test.prop([
    fc.constantFrom(...ALLOY_RECIPES.filter((r) => r.components.length >= 3)),
    fc.array(
      fc.record({
        metalId: fc.constantFrom<MetalId>(
          'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel'
        ),
        nuggets: fc.integer({ min: 0, max: 128 }),
      }),
      { minLength: 1, maxLength: 4 }
    )
  ], { numRuns: 100 })('Property 7: Multi-component distribution', (recipe, amounts) => {
    const isValid = validateComponentPresence(amounts, recipe);

    // Check if all required components have at least 1 nugget
    const allPresent = recipe.components.every((comp) =>
      amounts.some((a) => a.metalId === comp.metalId && a.nuggets > 0)
    );

    expect(isValid).toBe(allPresent);
  });

  // Unit tests for edge cases

  describe('Edge Cases', () => {
    it('should handle empty recipe (no components)', () => {
      const emptyRecipe: AlloyRecipe = {
        id: 'empty',
        name: 'Empty',
        components: [],
      };
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 20 },
      ];
      // Should return true since there are no components to validate
      expect(validatePercentages(amounts, emptyRecipe)).toBe(true);
      expect(validateComponentPresence(amounts, emptyRecipe)).toBe(true);
    });

    it('should handle single-component recipe', () => {
      const singleRecipe: AlloyRecipe = {
        id: 'pure-copper',
        name: 'Pure Copper',
        components: [
          { metalId: 'copper', minPercent: 100, maxPercent: 100 },
        ],
      };
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 20 },
      ];
      expect(validatePercentages(amounts, singleRecipe)).toBe(true);
      expect(validateComponentPresence(amounts, singleRecipe)).toBe(true);
    });

    it('should handle recipe at exactly 4 slots boundary', () => {
      // Testing with a 3-component recipe (black-bronze)
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 128 },
          { id: 1, metalId: 'silver', nuggets: 20 },
          { id: 2, metalId: 'gold', nuggets: 20 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCount(crucible)).toBe(true);
    });

    it('should handle recipe at exactly 128 nuggets per slot', () => {
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 128 },
          { id: 1, metalId: 'tin', nuggets: 128 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      };
      expect(validateSlotCapacity(crucible)).toBe(true);
    });

    it('should reject recipe with conflicting percentages (impossible ranges)', () => {
      const impossibleRecipe: AlloyRecipe = {
        id: 'impossible',
        name: 'Impossible',
        components: [
          { metalId: 'copper', minPercent: 60, maxPercent: 70 },
          { metalId: 'tin', minPercent: 60, maxPercent: 70 }, // Can't both be 60-70%
        ],
      };
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 12 }, // 60 units = 60%
        { metalId: 'tin', nuggets: 8 },     // 40 units = 40%
      ];
      // Tin is below its minimum
      expect(validatePercentages(amounts, impossibleRecipe)).toBe(false);
    });

    it('should handle recipe with too many metals (more than 4 distinct)', () => {
      // Testing with a complex 5-component recipe
      const crucible: CrucibleState = {
        slots: [
          { id: 0, metalId: 'copper', nuggets: 5 },
          { id: 1, metalId: 'tin', nuggets: 5 },
          { id: 2, metalId: 'zinc', nuggets: 5 },
          { id: 3, metalId: 'gold', nuggets: 5 },
          { id: 4, metalId: 'silver', nuggets: 2 },
        ],
      };
      // Should fail slot count validation (5 slots > 4)
      expect(validateSlotCount(crucible)).toBe(false);
    });
  });
});
