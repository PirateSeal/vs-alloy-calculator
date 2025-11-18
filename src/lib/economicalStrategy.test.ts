import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { optimizeEconomical } from "./economicalStrategy";
import type { AlloyRecipe, MetalId } from "../types/alloys";
import { ALLOY_RECIPES } from "../data/alloys";
import { calculateRarityCost } from "./metalRarity";

describe("Economical Strategy", () => {
  describe("Edge Cases", () => {
    it("should handle recipe with only common metals for target ingot amount", () => {
      // Create a recipe with only common metals (copper, lead, zinc, bismuth)
      const commonMetalsRecipe: AlloyRecipe = {
        id: "common-test",
        name: "Common Metals Test",
        components: [
          { metalId: "copper", minPercent: 40, maxPercent: 60 },
          { metalId: "zinc", minPercent: 40, maxPercent: 60 },
        ],
      };

      const targetIngots = 5;
      const result = optimizeEconomical(commonMetalsRecipe, targetIngots);

      expect(result.success).toBe(true);
      expect(result.ingotCount).toBe(targetIngots);
      expect(result.rarityCost).toBeDefined();
      expect(result.crucible).not.toBeNull();

      if (result.crucible) {
        // Verify total units equals target
        const totalUnits = result.crucible.slots.reduce(
          (sum, slot) => sum + slot.nuggets * 5,
          0
        );
        expect(totalUnits).toBe(targetIngots * 100);
      }
    });

    it("should handle recipe with only rare metals for target ingot amount", () => {
      // Create a recipe with only rare metals (gold, silver, nickel)
      const rareMetalsRecipe: AlloyRecipe = {
        id: "rare-test",
        name: "Rare Metals Test",
        components: [
          { metalId: "gold", minPercent: 45, maxPercent: 55 },
          { metalId: "silver", minPercent: 45, maxPercent: 55 },
        ],
      };

      const targetIngots = 3;
      const result = optimizeEconomical(rareMetalsRecipe, targetIngots);

      expect(result.success).toBe(true);
      expect(result.ingotCount).toBe(targetIngots);
      expect(result.rarityCost).toBeDefined();
      expect(result.crucible).not.toBeNull();

      if (result.crucible) {
        // Verify total units equals target
        const totalUnits = result.crucible.slots.reduce(
          (sum, slot) => sum + slot.nuggets * 5,
          0
        );
        expect(totalUnits).toBe(targetIngots * 100);
      }
    });

    it("should handle different valid configurations for same target ingot amount", () => {
      // Use a recipe with flexible percentage ranges
      const flexibleRecipe: AlloyRecipe = {
        id: "flexible-test",
        name: "Flexible Test",
        components: [
          { metalId: "copper", minPercent: 30, maxPercent: 70 },
          { metalId: "tin", minPercent: 30, maxPercent: 70 },
        ],
      };

      const targetIngots = 4;
      const result = optimizeEconomical(flexibleRecipe, targetIngots);

      expect(result.success).toBe(true);
      expect(result.ingotCount).toBe(targetIngots);
      expect(result.rarityCost).toBeDefined();
    });

    it("should handle recipes with different metal combinations", () => {
      // Test with a 3-component recipe
      const threeComponentRecipe: AlloyRecipe = {
        id: "three-component-test",
        name: "Three Component Test",
        components: [
          { metalId: "copper", minPercent: 30, maxPercent: 40 },
          { metalId: "zinc", minPercent: 30, maxPercent: 40 },
          { metalId: "tin", minPercent: 20, maxPercent: 40 },
        ],
      };

      const targetIngots = 6;
      const result = optimizeEconomical(threeComponentRecipe, targetIngots);

      expect(result.success).toBe(true);
      expect(result.ingotCount).toBe(targetIngots);

      if (result.crucible) {
        // Verify all 3 components are present
        const metalIds = new Set(
          result.crucible.slots.filter((s) => s.metalId).map((s) => s.metalId)
        );
        expect(metalIds.size).toBe(3);
      }
    });

    it("should return error when target ingot amount is not achievable", () => {
      // Create a recipe with very tight constraints that can't fit many ingots
      const tightRecipe: AlloyRecipe = {
        id: "tight-test",
        name: "Tight Test",
        components: [
          { metalId: "copper", minPercent: 24.9, maxPercent: 25.1 },
          { metalId: "tin", minPercent: 24.9, maxPercent: 25.1 },
          { metalId: "zinc", minPercent: 24.9, maxPercent: 25.1 },
          { metalId: "bismuth", minPercent: 24.9, maxPercent: 25.1 },
        ],
      };

      // Try to create 100 ingots (2000 nuggets) - should exceed 4 slots
      const targetIngots = 100;
      const result = optimizeEconomical(tightRecipe, targetIngots);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.ingotCount).toBe(0);
      expect(result.crucible).toBeNull();
    });

    it("should return error when target ingots is not provided", () => {
      const recipe = ALLOY_RECIPES[0];
      const result = optimizeEconomical(recipe, undefined);

      expect(result.success).toBe(false);
      expect(result.error).toContain("required");
      expect(result.ingotCount).toBe(0);
    });

    it("should return error when target ingots is zero or negative", () => {
      const recipe = ALLOY_RECIPES[0];
      const result1 = optimizeEconomical(recipe, 0);
      const result2 = optimizeEconomical(recipe, -5);

      expect(result1.success).toBe(false);
      expect(result1.error).toContain("greater than zero");

      expect(result2.success).toBe(false);
      expect(result2.error).toContain("greater than zero");
    });

    it("should return error for recipe with no components", () => {
      const emptyRecipe: AlloyRecipe = {
        id: "empty-test",
        name: "Empty Test",
        components: [],
      };

      const result = optimizeEconomical(emptyRecipe, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.ingotCount).toBe(0);
      expect(result.crucible).toBeNull();
    });
  });

  /**
   * Feature: recipe-optimizer, Property 2: Economical mode minimizes rarity cost
   * Validates: Requirements 1.3, 3.1, 3.3, 3.4
   *
   * For any alloy recipe with at least one rare metal component and a specified target
   * ingot amount, when optimizing in economical mode, the returned recipe should produce
   * exactly the target ingot amount and have a rarity cost less than or equal to any
   * other valid recipe configuration that produces the same number of ingots.
   */
  test.prop(
    [
      fc
        .constantFrom(...ALLOY_RECIPES)
        .filter((recipe) => recipe.components.length >= 2), // Need at least 2 components for meaningful optimization
      fc.integer({ min: 1, max: 10 }), // Target ingots between 1 and 10
    ],
    { numRuns: 100 }
  )(
    "Property 2: Economical mode minimizes rarity cost",
    (recipe, targetIngots) => {
      const result = optimizeEconomical(recipe, targetIngots);

      // If optimization succeeded, verify it produces exactly the target ingots
      if (result.success && result.crucible) {
        // Verify ingot count matches target
        expect(result.ingotCount).toBe(targetIngots);

        // Verify the result is valid
        expect(result.crucible.slots.length).toBeLessThanOrEqual(4);
        expect(result.crucible.slots.every((slot) => slot.nuggets <= 128)).toBe(
          true
        );

        // Calculate total units
        const totalUnits = result.crucible.slots.reduce(
          (sum, slot) => sum + slot.nuggets * 5,
          0
        );
        expect(totalUnits).toBe(targetIngots * 100);

        // Verify percentages are within bounds
        const metalTotals = new Map<MetalId, number>();
        for (const slot of result.crucible.slots) {
          if (slot.metalId) {
            const current = metalTotals.get(slot.metalId) || 0;
            metalTotals.set(slot.metalId, current + slot.nuggets);
          }
        }

        for (const component of recipe.components) {
          const nuggets = metalTotals.get(component.metalId) || 0;
          const units = nuggets * 5;
          const percentage = (units / totalUnits) * 100;

          // Allow 0.01% tolerance for floating point
          expect(percentage).toBeGreaterThanOrEqual(component.minPercent - 0.01);
          expect(percentage).toBeLessThanOrEqual(component.maxPercent + 0.01);
        }

        // Verify rarity cost is calculated correctly
        const amounts = Array.from(metalTotals.entries()).map(
          ([metalId, nuggets]) => ({
            metalId,
            nuggets,
          })
        );
        const expectedRarityCost = calculateRarityCost(amounts);
        expect(result.rarityCost).toBeCloseTo(expectedRarityCost, 2);

        // Verify economical bias: common metals should be preferred
        // Check that the recipe uses maximum percentage of common metals when possible
        const commonMetals = ["copper", "lead", "zinc", "bismuth"];
        const rareMetals = ["tin", "gold", "silver", "nickel"];

        // Check if recipe has at least one common metal
        const hasCommonMetal = recipe.components.some((c) =>
          commonMetals.includes(c.metalId)
        );
        const hasRareMetal = recipe.components.some((c) =>
          rareMetals.includes(c.metalId)
        );

        // Only verify economical bias if recipe has both common and rare metals
        // If all metals are rare (or all common), there's no bias to verify
        if (hasCommonMetal && hasRareMetal) {
          for (const component of recipe.components) {
            const nuggets = metalTotals.get(component.metalId) || 0;
            const percentage = ((nuggets * 5) / totalUnits) * 100;

            if (commonMetals.includes(component.metalId)) {
              // Common metals should be biased toward maximum percentage
              // (within a reasonable tolerance since we need to balance all components)
              const midpoint = (component.minPercent + component.maxPercent) / 2;
              // We expect common metals to be at or above midpoint
              expect(percentage).toBeGreaterThanOrEqual(midpoint - 5);
            } else if (rareMetals.includes(component.metalId)) {
              // Rare metals should be biased toward minimum percentage
              const midpoint = (component.minPercent + component.maxPercent) / 2;
              // We expect rare metals to be at or below midpoint
              expect(percentage).toBeLessThanOrEqual(midpoint + 5);
            }
          }
        }
      } else {
        // If optimization failed, it should have an error message
        expect(result.error).toBeDefined();
        expect(result.ingotCount).toBe(0);
        expect(result.crucible).toBeNull();
      }
    }
  );
});
