import { describe, it, expect } from 'vitest';
import {
  aggregateCrucible,
  clamp,
  evaluateAlloys,
  createEmptyCrucible,
  getCompatibleMetals,
  getAvailableMetals,
  createPresetForAlloy,
  detectCurrentAlloy,
  adjustCrucibleForAlloy,
  calculateNuggetAdjustments,
  getAdjustmentSummary,
  applyNuggetAdjustments,
  type AlloyViolation,
  type NuggetAdjustment,
} from '@/features/metallurgy/lib/alloyLogic';
import type { MetalAmount } from '@/features/metallurgy/types/alloys';
import type { CrucibleState } from '@/features/metallurgy/types/crucible';
import { ALLOY_RECIPES, METALS } from '@/features/metallurgy/data/alloys';

const tinBronze = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;
const bismuthBronze = ALLOY_RECIPES.find((r) => r.id === 'bismuth-bronze')!;
const brass = ALLOY_RECIPES.find((r) => r.id === 'brass')!;

function makeCrucible(
  slots: Array<{ metalId: CrucibleState['slots'][number]['metalId']; nuggets: number }>,
): CrucibleState {
  const padded = [...slots];
  while (padded.length < 4) padded.push({ metalId: null, nuggets: 0 });
  return {
    slots: padded.slice(0, 4).map((s, i) => ({ id: i, ...s })),
  };
}

describe('alloyLogic', () => {
  describe('aggregateCrucible', () => {
    it('returns empty for empty crucible', () => {
      expect(aggregateCrucible(createEmptyCrucible())).toEqual([]);
    });

    it('aggregates same metal across slots', () => {
      const crucible = makeCrucible([
        { metalId: 'copper', nuggets: 10 },
        { metalId: 'copper', nuggets: 8 },
        { metalId: 'tin', nuggets: 2 },
      ]);
      const result = aggregateCrucible(crucible);
      const copper = result.find((a) => a.metalId === 'copper')!;
      const tin = result.find((a) => a.metalId === 'tin')!;
      expect(copper.nuggets).toBe(18);
      expect(copper.units).toBe(90);
      expect(copper.percent).toBeCloseTo(90, 5);
      expect(tin.nuggets).toBe(2);
      expect(tin.percent).toBeCloseTo(10, 5);
    });

    it('skips null metalId and zero nugget slots', () => {
      const crucible = makeCrucible([
        { metalId: 'copper', nuggets: 10 },
        { metalId: null, nuggets: 5 },
        { metalId: 'tin', nuggets: 0 },
      ]);
      const result = aggregateCrucible(crucible);
      expect(result).toHaveLength(1);
      expect(result[0].metalId).toBe('copper');
    });
  });

  describe('clamp', () => {
    it('clamps below min', () => expect(clamp(-5, 0, 10)).toBe(0));
    it('clamps above max', () => expect(clamp(99, 0, 10)).toBe(10));
    it('passes through in-range', () => expect(clamp(5, 0, 10)).toBe(5));
  });

  describe('evaluateAlloys', () => {
    it('returns empty result when crucible empty', () => {
      const result = evaluateAlloys([], ALLOY_RECIPES);
      expect(result.totalUnits).toBe(0);
      expect(result.bestMatch).toBeNull();
      expect(result.matches).toEqual([]);
    });

    it('finds exact match for perfect tin-bronze', () => {
      const amounts = aggregateCrucible(
        makeCrucible([
          { metalId: 'copper', nuggets: 18 },
          { metalId: 'tin', nuggets: 2 },
        ]),
      );
      const result = evaluateAlloys(amounts, ALLOY_RECIPES);
      expect(result.bestMatch?.recipe.id).toBe('tin-bronze');
      expect(result.bestMatch?.isExact).toBe(true);
      expect(result.bestMatch?.violations).toEqual([]);
    });

    it('flags percentage violation as non-exact', () => {
      const amounts = aggregateCrucible(
        makeCrucible([
          { metalId: 'copper', nuggets: 19 },
          { metalId: 'tin', nuggets: 1 },
        ]),
      );
      const result = evaluateAlloys(amounts, ALLOY_RECIPES);
      const tinBronzeMatch = result.matches.find((m) => m.recipe.id === 'tin-bronze')!;
      expect(tinBronzeMatch.isExact).toBe(false);
      expect(tinBronzeMatch.violations.length).toBeGreaterThan(0);
    });

    it('rejects recipe with contamination above 0.5%', () => {
      const amounts = aggregateCrucible(
        makeCrucible([
          { metalId: 'copper', nuggets: 18 },
          { metalId: 'tin', nuggets: 1 },
          { metalId: 'gold', nuggets: 1 },
        ]),
      );
      const result = evaluateAlloys(amounts, ALLOY_RECIPES);
      expect(result.matches.find((m) => m.recipe.id === 'tin-bronze')).toBeUndefined();
    });

    it('sorts exact matches before near-misses', () => {
      const amounts = aggregateCrucible(
        makeCrucible([
          { metalId: 'copper', nuggets: 18 },
          { metalId: 'tin', nuggets: 2 },
        ]),
      );
      const result = evaluateAlloys(amounts, ALLOY_RECIPES);
      expect(result.matches[0].isExact).toBe(true);
    });
  });

  describe('createEmptyCrucible', () => {
    it('makes 4 empty slots', () => {
      const c = createEmptyCrucible();
      expect(c.slots).toHaveLength(4);
      expect(c.slots.every((s) => s.metalId === null && s.nuggets === 0)).toBe(true);
    });
  });

  describe('getCompatibleMetals', () => {
    it('returns metals from recipes containing the given metal', () => {
      const compat = getCompatibleMetals('copper', ALLOY_RECIPES);
      expect(compat).toContain('tin');
      expect(compat).toContain('zinc');
      expect(compat).not.toContain('copper');
    });

    it('returns empty for metal in no recipe combos', () => {
      const compat = getCompatibleMetals('copper', []);
      expect(compat).toEqual([]);
    });
  });

  describe('getAvailableMetals', () => {
    it('returns all metals when crucible empty', () => {
      const result = getAvailableMetals(createEmptyCrucible(), METALS, ALLOY_RECIPES);
      expect(result).toEqual(METALS);
    });

    it('returns selected + compatible when one metal selected', () => {
      const crucible = makeCrucible([{ metalId: 'copper', nuggets: 10 }]);
      const result = getAvailableMetals(crucible, METALS, ALLOY_RECIPES);
      expect(result.find((m) => m.id === 'copper')).toBeDefined();
      expect(result.find((m) => m.id === 'tin')).toBeDefined();
    });

    it('restricts to recipe metals when multiple selected', () => {
      const crucible = makeCrucible([
        { metalId: 'copper', nuggets: 10 },
        { metalId: 'tin', nuggets: 2 },
      ]);
      const result = getAvailableMetals(crucible, METALS, ALLOY_RECIPES);
      const ids = result.map((m) => m.id);
      expect(ids).toContain('copper');
      expect(ids).toContain('tin');
      // zinc not in any recipe with both copper and tin
      expect(ids).not.toContain('zinc');
    });

    it('returns all metals when multi-selection has no matching recipe', () => {
      const crucible = makeCrucible([
        { metalId: 'gold', nuggets: 5 },
        { metalId: 'lead', nuggets: 5 },
      ]);
      const result = getAvailableMetals(crucible, METALS, ALLOY_RECIPES);
      expect(result).toEqual(METALS);
    });
  });

  describe('createPresetForAlloy', () => {
    it('creates valid 1-ingot preset for tin-bronze', () => {
      const crucible = createPresetForAlloy(tinBronze, 1);
      const amounts = aggregateCrucible(crucible);
      const totalUnits = amounts.reduce((s, a) => s + a.units, 0);
      expect(totalUnits).toBe(100);
      const evalResult = evaluateAlloys(amounts, [tinBronze]);
      expect(evalResult.bestMatch?.isExact).toBe(true);
    });

    it('creates valid multi-ingot preset', () => {
      const crucible = createPresetForAlloy(tinBronze, 5);
      const amounts = aggregateCrucible(crucible);
      const totalUnits = amounts.reduce((s, a) => s + a.units, 0);
      expect(totalUnits).toBe(500);
    });

    it('handles 3-component recipes', () => {
      const crucible = createPresetForAlloy(bismuthBronze, 2);
      const amounts = aggregateCrucible(crucible);
      const totalUnits = amounts.reduce((s, a) => s + a.units, 0);
      expect(totalUnits).toBe(200);
      expect(amounts.length).toBe(3);
    });
  });

  describe('detectCurrentAlloy', () => {
    it('returns null for empty crucible', () => {
      expect(detectCurrentAlloy(createEmptyCrucible(), ALLOY_RECIPES)).toBeNull();
    });

    it('returns recipe for exact composition', () => {
      const crucible = makeCrucible([
        { metalId: 'copper', nuggets: 18 },
        { metalId: 'tin', nuggets: 2 },
      ]);
      expect(detectCurrentAlloy(crucible, ALLOY_RECIPES)?.id).toBe('tin-bronze');
    });

    it('returns null for non-exact composition', () => {
      const crucible = makeCrucible([
        { metalId: 'copper', nuggets: 19 },
        { metalId: 'tin', nuggets: 1 },
      ]);
      expect(detectCurrentAlloy(crucible, ALLOY_RECIPES)).toBeNull();
    });
  });

  describe('adjustCrucibleForAlloy', () => {
    it('returns crucible unchanged when no recipe', () => {
      const c = makeCrucible([{ metalId: 'copper', nuggets: 10 }]);
      expect(adjustCrucibleForAlloy(c, 0, null)).toBe(c);
    });

    it('returns unchanged for empty changed slot', () => {
      const c = makeCrucible([{ metalId: 'copper', nuggets: 0 }]);
      expect(adjustCrucibleForAlloy(c, 0, tinBronze)).toBe(c);
    });

    it('returns unchanged when changed metal not in recipe', () => {
      const c = makeCrucible([{ metalId: 'gold', nuggets: 10 }]);
      expect(adjustCrucibleForAlloy(c, 0, tinBronze)).toBe(c);
    });

    it('adjusts other slots based on changed slot ratio', () => {
      const c = makeCrucible([
        { metalId: 'copper', nuggets: 18 },
        { metalId: 'tin', nuggets: 99 },
      ]);
      const adjusted = adjustCrucibleForAlloy(c, 0, tinBronze);
      const amounts = aggregateCrucible(adjusted);
      const tin = amounts.find((a) => a.metalId === 'tin');
      expect(tin).toBeDefined();
      expect(tin!.percent).toBeGreaterThanOrEqual(8);
      expect(tin!.percent).toBeLessThanOrEqual(12);
    });

    it('returns unchanged when changedSlotId not found', () => {
      const c = makeCrucible([{ metalId: 'copper', nuggets: 10 }]);
      expect(adjustCrucibleForAlloy(c, 99, tinBronze)).toBe(c);
    });
  });

  describe('calculateNuggetAdjustments', () => {
    it('returns empty for zero units', () => {
      expect(calculateNuggetAdjustments([], tinBronze, [])).toEqual([]);
    });

    it('produces add/remove adjustments to fix invalid composition', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 14, units: 70, percent: 70 },
        { metalId: 'tin', nuggets: 6, units: 30, percent: 30 },
      ];
      const violations: AlloyViolation[] = [
        { metalId: 'copper', requiredMin: 88, requiredMax: 92, actual: 70 },
        { metalId: 'tin', requiredMin: 8, requiredMax: 12, actual: 30 },
      ];
      const adj = calculateNuggetAdjustments(amounts, tinBronze, violations);
      expect(adj.length).toBeGreaterThan(0);
      const copperAdj = adj.find((a) => a.metalId === 'copper');
      const tinAdj = adj.find((a) => a.metalId === 'tin');
      expect(copperAdj?.action).toBe('add');
      expect(tinAdj?.action).toBe('remove');
    });

    it('uses minimal-change strategy when slightly over ingot', () => {
      // 22 nuggets total, 2 over the 20-nugget mark, copper at 100% (over max)
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 21, units: 105, percent: 95.45 },
        { metalId: 'tin', nuggets: 1, units: 5, percent: 4.55 },
      ];
      const adj = calculateNuggetAdjustments(amounts, tinBronze, []);
      expect(adj.length).toBeGreaterThan(0);
    });

    it('rounds up to 1 ingot when below 100 units', () => {
      const amounts: MetalAmount[] = [
        { metalId: 'copper', nuggets: 9, units: 45, percent: 90 },
        { metalId: 'tin', nuggets: 1, units: 5, percent: 10 },
      ];
      const adj = calculateNuggetAdjustments(amounts, tinBronze, []);
      const totalTarget = adj.reduce((s, a) => s + a.targetNuggets, 0);
      expect(totalTarget).toBe(20);
    });
  });

  describe('getAdjustmentSummary', () => {
    const metalMap = new Map<string, { label: string; shortLabel: string }>([
      ['copper', { label: 'Copper', shortLabel: 'Cu' }],
      ['tin', { label: 'Tin', shortLabel: 'Sn' }],
      ['zinc', { label: 'Zinc', shortLabel: 'Zn' }],
    ]);

    it('returns empty string for no actions', () => {
      const adj: NuggetAdjustment[] = [
        { metalId: 'copper', currentNuggets: 18, targetNuggets: 18, delta: 0, action: 'ok' },
      ];
      expect(getAdjustmentSummary(adj, metalMap)).toBe('');
    });

    it('returns single-action message', () => {
      const adj: NuggetAdjustment[] = [
        { metalId: 'copper', currentNuggets: 10, targetNuggets: 18, delta: 8, action: 'add' },
      ];
      expect(getAdjustmentSummary(adj, metalMap)).toBe('Add 8 Cu nuggets');
    });

    it('uses singular nugget for delta of 1', () => {
      const adj: NuggetAdjustment[] = [
        { metalId: 'tin', currentNuggets: 2, targetNuggets: 1, delta: -1, action: 'remove' },
      ];
      expect(getAdjustmentSummary(adj, metalMap)).toBe('Remove 1 Sn nugget');
    });

    it('joins multiple actions with comma + and', () => {
      const adj: NuggetAdjustment[] = [
        { metalId: 'copper', currentNuggets: 10, targetNuggets: 18, delta: 8, action: 'add' },
        { metalId: 'tin', currentNuggets: 6, targetNuggets: 2, delta: -4, action: 'remove' },
        { metalId: 'zinc', currentNuggets: 2, targetNuggets: 0, delta: -2, action: 'remove' },
      ];
      const summary = getAdjustmentSummary(adj, metalMap);
      expect(summary).toContain('Add 8 Cu nuggets');
      expect(summary).toContain(' and ');
    });

    it('falls back to metalId when not in map', () => {
      const adj: NuggetAdjustment[] = [
        { metalId: 'gold', currentNuggets: 0, targetNuggets: 5, delta: 5, action: 'add' },
      ];
      expect(getAdjustmentSummary(adj, metalMap)).toBe('Add 5 gold nuggets');
    });
  });

  describe('applyNuggetAdjustments', () => {
    it('redistributes nuggets across slots according to adjustments', () => {
      const c = createEmptyCrucible();
      const adj: NuggetAdjustment[] = [
        { metalId: 'copper', currentNuggets: 0, targetNuggets: 18, delta: 18, action: 'add' },
        { metalId: 'tin', currentNuggets: 0, targetNuggets: 2, delta: 2, action: 'add' },
      ];
      const result = applyNuggetAdjustments(c, adj);
      const amounts = aggregateCrucible(result);
      expect(amounts.find((a) => a.metalId === 'copper')?.nuggets).toBe(18);
      expect(amounts.find((a) => a.metalId === 'tin')?.nuggets).toBe(2);
    });

    it('splits across slots when over 128 nuggets', () => {
      const c = createEmptyCrucible();
      const adj: NuggetAdjustment[] = [
        { metalId: 'copper', currentNuggets: 0, targetNuggets: 200, delta: 200, action: 'add' },
      ];
      const result = applyNuggetAdjustments(c, adj);
      const occupied = result.slots.filter((s) => s.metalId === 'copper');
      expect(occupied.length).toBe(2);
      const total = occupied.reduce((s, slot) => s + slot.nuggets, 0);
      expect(total).toBe(200);
    });

    it('returns crucible with all empty slots when no adjustments', () => {
      const c = makeCrucible([{ metalId: 'copper', nuggets: 10 }]);
      const result = applyNuggetAdjustments(c, []);
      expect(result.slots.every((s) => s.metalId === null && s.nuggets === 0)).toBe(true);
    });
  });

  // smoke for under-tested brass
  it('detects brass exactly when 65/35', () => {
    const c = makeCrucible([
      { metalId: 'copper', nuggets: 13 },
      { metalId: 'zinc', nuggets: 7 },
    ]);
    expect(detectCurrentAlloy(c, ALLOY_RECIPES)?.id).toBe(brass.id);
  });
});
