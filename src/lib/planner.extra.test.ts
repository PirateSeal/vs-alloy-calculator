import { describe, expect, it } from 'vitest';
import { ALLOY_RECIPES } from '@/features/metallurgy/data/alloys';
import {
  planRecipeFromInventory,
  normalizeInventoryState,
  getCrucibleInventory,
  getInventoryTotalNuggets,
  hasInventoryForCost,
  subtractInventory,
} from '@/features/metallurgy/lib/planner';
import { createEmptyCrucible } from '@/features/metallurgy/lib/alloyLogic';

const tinBronze = ALLOY_RECIPES.find((r) => r.id === 'tin-bronze')!;

describe('planner edges', () => {
  it('returns null plan when nothing craftable', () => {
    const empty = normalizeInventoryState({});
    const result = planRecipeFromInventory(tinBronze, empty, 'balanced', 1);
    expect(result.maxCraftableIngots).toBe(0);
    expect(result.plan).toBeNull();
    expect(result.selectedTargetIngots).toBeNull();
  });

  it('floors negative inventory values to zero', () => {
    const inv = normalizeInventoryState({ copper: -50, tin: 30 });
    expect(inv.copper).toBe(0);
    expect(inv.tin).toBe(30);
  });

  it('extracts inventory from a crucible state', () => {
    const c = createEmptyCrucible();
    c.slots[0] = { id: 0, metalId: 'copper', nuggets: 18 };
    c.slots[1] = { id: 1, metalId: 'tin', nuggets: 2 };
    const inv = getCrucibleInventory(c);
    expect(inv.copper).toBe(18);
    expect(inv.tin).toBe(2);
    expect(inv.zinc).toBe(0);
  });

  it('sums inventory totals', () => {
    expect(getInventoryTotalNuggets(normalizeInventoryState({ copper: 10, tin: 5 }))).toBe(15);
  });

  it('reports inventory sufficiency vs cost', () => {
    const inv = normalizeInventoryState({ copper: 100, tin: 20 });
    const ok = normalizeInventoryState({ copper: 90, tin: 20 });
    const bad = normalizeInventoryState({ copper: 200 });
    expect(hasInventoryForCost(inv, ok)).toBe(true);
    expect(hasInventoryForCost(inv, bad)).toBe(false);
  });

  it('subtracts cost without going below zero', () => {
    const inv = normalizeInventoryState({ copper: 50, tin: 5 });
    const cost = normalizeInventoryState({ copper: 80, tin: 1 });
    const remaining = subtractInventory(inv, cost);
    expect(remaining.copper).toBe(0);
    expect(remaining.tin).toBe(4);
  });

  it('clamps requested target above maxCraftable', () => {
    const inv = normalizeInventoryState({ copper: 180, tin: 20 });
    const result = planRecipeFromInventory(tinBronze, inv, 'balanced', 999);
    expect(result.selectedTargetIngots).toBeLessThanOrEqual(result.maxCraftableIngots);
    expect(result.selectedTargetIngots).toBeGreaterThan(0);
  });
});
