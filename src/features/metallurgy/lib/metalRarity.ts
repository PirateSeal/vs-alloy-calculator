import type { MetalId, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";

export const METAL_RARITY_SCORES: Record<MetalId, number> = {
  copper: 1.0,
  lead: 1.2,
  zinc: 2.0,
  bismuth: 2.0,
  tin: 3.0,
  gold: 5.0,
  silver: 5.0,
  nickel: 8.0,
};

export function getRarityScore(metalId: MetalId): number {
  return METAL_RARITY_SCORES[metalId];
}

export function calculateRarityCost(amounts: MetalNuggetAmount[]): number {
  return amounts.reduce((total, amount) => {
    return total + amount.nuggets * getRarityScore(amount.metalId);
  }, 0);
}
