import { describe, it, expect } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { getRarityScore, calculateRarityCost, METAL_RARITY_SCORES, type MetalAmount } from './metalRarity';
import type { MetalId } from '../types/alloys';

describe('Metal Rarity System', () => {
  describe('getRarityScore', () => {
    it('should return correct rarity scores for all metals', () => {
      expect(getRarityScore('copper')).toBe(1.0);
      expect(getRarityScore('lead')).toBe(1.2);
      expect(getRarityScore('zinc')).toBe(2.0);
      expect(getRarityScore('bismuth')).toBe(2.0);
      expect(getRarityScore('tin')).toBe(3.0);
      expect(getRarityScore('gold')).toBe(5.0);
      expect(getRarityScore('silver')).toBe(5.0);
      expect(getRarityScore('nickel')).toBe(8.0);
    });
  });

  describe('calculateRarityCost', () => {
    it('should return 0 for empty amounts array', () => {
      expect(calculateRarityCost([])).toBe(0);
    });

    it('should calculate correct cost for single metal', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 10 }
      ];
      expect(calculateRarityCost(amounts)).toBe(10 * 1.0);
    });

    it('should calculate correct cost for multiple metals', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 10 },
        { metalId: 'gold', nuggets: 5 },
        { metalId: 'nickel', nuggets: 2 }
      ];
      // 10*1.0 + 5*5.0 + 2*8.0 = 10 + 25 + 16 = 51
      expect(calculateRarityCost(amounts)).toBe(51);
    });

    /**
     * Feature: recipe-optimizer, Property 8: Rarity cost calculation
     * Validates: Requirements 7.7
     *
     * For any optimized recipe in economical mode, the reported rarity cost
     * should equal the sum of (nugget count × rarity score) for each metal component.
     */
    test.prop([
      fc.array(
        fc.record({
          metalId: fc.constantFrom<MetalId>(
            'copper', 'tin', 'zinc', 'bismuth', 'gold', 'silver', 'lead', 'nickel'
          ),
          nuggets: fc.integer({ min: 0, max: 512 }) // Max 4 slots * 128 nuggets
        }),
        { minLength: 0, maxLength: 8 }
      )
    ], { numRuns: 100 })('Property 8: Rarity cost equals sum of (nuggets × rarity score)', (amounts) => {
      const calculatedCost = calculateRarityCost(amounts);

      // Manually calculate expected cost
      const expectedCost = amounts.reduce((total, amount) => {
        return total + (amount.nuggets * METAL_RARITY_SCORES[amount.metalId]);
      }, 0);

      expect(calculatedCost).toBe(expectedCost);
    });
  });
});
