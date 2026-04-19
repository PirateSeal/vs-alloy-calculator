import type { MetalId, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";
import type { CrucibleSlot, CrucibleState } from "@/features/metallurgy/types/crucible";
import {
  MAX_CRUCIBLE_SLOTS,
  MAX_NUGGETS_PER_SLOT,
  UNITS_PER_NUGGET,
} from "../constants";

export function distributeToSlots(metalId: MetalId, totalNuggets: number): CrucibleSlot[] {
  const slots: CrucibleSlot[] = [];
  let remaining = totalNuggets;
  let slotId = 0;

  while (remaining > 0) {
    const nuggets = Math.min(MAX_NUGGETS_PER_SLOT, remaining);
    slots.push({ id: slotId++, metalId, nuggets });
    remaining -= nuggets;
  }

  return slots;
}

export function amountsToCrucible(amounts: MetalNuggetAmount[]): CrucibleState {
  const allSlots: CrucibleSlot[] = [];

  for (const amount of amounts) {
    allSlots.push(...distributeToSlots(amount.metalId, amount.nuggets));
  }

  allSlots.forEach((slot, index) => {
    slot.id = index;
  });

  while (allSlots.length < MAX_CRUCIBLE_SLOTS) {
    allSlots.push({ id: allSlots.length, metalId: null, nuggets: 0 });
  }

  return { slots: allSlots };
}

export function countSlotsUsed(amounts: MetalNuggetAmount[]): number {
  return amounts.reduce(
    (sum, amount) => sum + Math.ceil(amount.nuggets / MAX_NUGGETS_PER_SLOT),
    0,
  );
}

export function fitsInFourSlots(amounts: MetalNuggetAmount[]): boolean {
  return countSlotsUsed(amounts) <= MAX_CRUCIBLE_SLOTS;
}

export function calculatePercentages(amounts: MetalNuggetAmount[]): Record<MetalId, number> {
  const totalUnits = amounts.reduce((sum, a) => sum + a.nuggets * UNITS_PER_NUGGET, 0);
  const percentages: Record<string, number> = {};

  if (totalUnits === 0) {
    return percentages as Record<MetalId, number>;
  }

  for (const amount of amounts) {
    percentages[amount.metalId] = ((amount.nuggets * UNITS_PER_NUGGET) / totalUnits) * 100;
  }

  return percentages as Record<MetalId, number>;
}
