import { describe, it, expect } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { optimizeRecipe } from './recipeOptimizer';
import type { AlloyRecipe } from '../types/alloys';
import { ALLOY_RECIPES } from '../data/alloys';

describe('Recipe Optimizer', () => {
  describe('Input validation', () => {
    it('should return error for null/undefined input', () => {
      const result = optimizeRecipe(null as unknown as Parameters<typeof optimizeRecipe>[0]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should return error for missing recipe', () => {
      const result = optimizeRecipe({ mode: 'maximize' } as Parameters<typeof optimizeRecipe>[0]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('recipe is required');
    });

    it('should return error for invalid mode', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[0],
        mode: 'invalid' as 'maximize',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('mode must be');
    });

    it('should return error for missing mode', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[0],
      } as Parameters<typeof optimizeRecipe>[0]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('mode must be');
    });
  });

  describe('Mode dispatching', () => {
    it('should dispatch to maximization strategy for maximize mode', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[0], // Tin Bronze
        mode: 'maximize',
      });
      expect(result.metadata.mode).toBe('maximize');
    });

    it('should dispatch to economical strategy for economical mode', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[0], // Tin Bronze
        mode: 'economical',
      });
      expect(result.metadata.mode).toBe('economical');
    });
  });

  describe('Result structure', () => {
    it('should return complete result structure for successful optimization', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[0], // Tin Bronze
        mode: 'maximize',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('crucible');
      expect(result).toHaveProperty('ingotCount');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('mode');
      expect(result.metadata).toHaveProperty('recipe');
      expect(result.metadata).toHaveProperty('totalNuggets');
      expect(result.metadata).toHaveProperty('percentages');
    });

    it('should include rarityCost in economical mode', () => {
      const result = optimizeRecipe({
        recipe: ALLOY_RECIPES[2], // Black Bronze (has rare metals)
        mode: 'economical',
      });

      if (result.success) {
        expect(result).toHaveProperty('rarityCost');
        expect(typeof result.rarityCost).toBe('number');
      }
    });
  });

  describe('Real alloy recipes', () => {
    it('should successfully optimize all real alloy recipes in maximize mode', () => {
      for (const recipe of ALLOY_RECIPES) {
        const result = optimizeRecipe({
          recipe,
          mode: 'maximize',
        });

        // All recipes should be optimizable
        expect(result.success).toBe(true);
        expect(result.ingotCount).toBeGreaterThan(0);
        expect(result.crucible).not.toBeNull();
      }
    });

    it('should successfully optimize all real alloy recipes in economical mode', () => {
      for (const recipe of ALLOY_RECIPES) {
        const result = optimizeRecipe({
          recipe,
          mode: 'economical',
          targetIngots: 5, // Provide target ingots for economical mode
        });

        // All recipes should be optimizable
        if (!result.success) {
          console.log(`Failed recipe: ${recipe.name}`, result.error);
        }
        expect(result.success).toBe(true);
        expect(result.ingotCount).toBe(5); // Should produce exactly the target
        expect(result.crucible).not.toBeNull();
        expect(result.rarityCost).toBeDefined(); // Should have rarity cost in economical mode
      }
    });
  });

  describe('Error handling', () => {
    it('should handle recipe with no components', () => {
      const invalidRecipe: AlloyRecipe = {
        id: 'invalid',
        name: 'Invalid',
        components: [],
      };

      const result = optimizeRecipe({
        recipe: invalidRecipe,
        mode: 'maximize',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return descriptive error messages', () => {
      const invalidRecipe: AlloyRecipe = {
        id: 'invalid',
        name: 'Invalid',
        components: [],
      };

      const result = optimizeRecipe({
        recipe: invalidRecipe,
        mode: 'maximize',
      });

      expect(result.error).toContain('components');
    });
  });

  /**
   * Feature: recipe-optimizer, Property 9: Input immutability
   * Validates: Requirements 8.4
   *
   * For any optimizer call with a given recipe and mode, the input recipe object
   * should remain unchanged after the optimization completes.
   */
  test.prop([
    fc.constantFrom(...ALLOY_RECIPES),
    fc.constantFrom<'maximize' | 'economical'>('maximize', 'economical')
  ], { numRuns: 100 })('Property 9: Input recipe remains unchanged after optimization', (recipe, mode) => {
    // Create a deep copy of the original recipe for comparison
    const originalRecipe = JSON.parse(JSON.stringify(recipe));

    // Run optimization
    optimizeRecipe({ recipe, mode });

    // Verify recipe is unchanged
    expect(recipe).toEqual(originalRecipe);
    expect(recipe.id).toBe(originalRecipe.id);
    expect(recipe.name).toBe(originalRecipe.name);
    expect(recipe.components).toEqual(originalRecipe.components);

    // Verify components array is unchanged
    expect(recipe.components.length).toBe(originalRecipe.components.length);
    for (let i = 0; i < recipe.components.length; i++) {
      expect(recipe.components[i]).toEqual(originalRecipe.components[i]);
      expect(recipe.components[i].metalId).toBe(originalRecipe.components[i].metalId);
      expect(recipe.components[i].minPercent).toBe(originalRecipe.components[i].minPercent);
      expect(recipe.components[i].maxPercent).toBe(originalRecipe.components[i].maxPercent);
    }
  });
});
