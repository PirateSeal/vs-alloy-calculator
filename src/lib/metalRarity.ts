import type { MetalId } from "../types/alloys";

/**
 * Metal rarity scores based on Vintage Story game mechanics.
 * Lower scores = more common/easier to find
 * Higher scores = rarer/harder to obtain
 */
export const METAL_RARITY_SCORES: Record<MetalId, number> = {
  copper: 1.0,   // Very common - surface deposits, panning
  lead: 1.2,     // Very common - shallow underground deposits
  zinc: 2.0,     // Common - deep alloy metal
  bismuth: 2.0,  // Common - deep alloy metal
  tin: 3.0,      // Moderate - notoriously hard to locate
  gold: 5.0,     // Rare - precious metal, quartz deposits only
  silver: 5.0,   // Rare - precious metal, quartz/galena deposits
  nickel: 8.0,   // Rare - deep mining, tier 4 tools required
};

/**
 * Interface for metal amounts used in rarity calculations
 */
export interface MetalAmount {
  metalId: MetalId;
  nuggets: number;
}

/**
 * Get the rarity score for a specific metal
 * @param metalId - The metal identifier
 * @returns The rarity score for the metal
 */
export function getRarityScore(metalId: MetalId): number {
  return METAL_RARITY_SCORES[metalId];
}

/**
 * Calculate the total rarity cost for a collection of metal amounts
 * Rarity cost = sum of (nugget count × rarity score) for each metal
 * @param amounts - Array of metal amounts with metalId and nugget count
 * @returns The total rarity cost
 */
export function calculateRarityCost(amounts: MetalAmount[]): number {
  return amounts.reduce((total, amount) => {
    const rarityScore = getRarityScore(amount.metalId);
    return total + (amount.nuggets * rarityScore);
  }, 0);
}
