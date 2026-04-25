import type { BeehiveClass, KilnFuelType, PotteryPlanItem, PotteryRecipe } from "@/features/pottery/types/pottery";

export interface PotteryInventory {
  any: number;
  fire: number;
}

export interface PotteryPlanInput {
  recipe: PotteryRecipe;
  quantity: number;
}

export interface PotteryFeasibility {
  feasible: boolean;
  totalAny: number;
  totalFire: number;
  totalClay: number;
  shortfallAny: number;
  shortfallFire: number;
  leftoverAny: number;
  leftoverFire: number;
}

export interface KilnFuelOption {
  type: KilnFuelType;
  labelKey: string;
  pitDurationHours: number;
  pitFuelPerCycle: number;
  beehiveFuelPerFiring: number;
}

export interface FireablePlanInput extends PotteryPlanInput {
  craftedOutput: number;
  pitKilnCapacity: number;
  beehiveClass: BeehiveClass;
}

export interface PitKilnLine {
  recipe: PotteryRecipe;
  quantity: number;
  craftedOutput: number;
  cycles: number;
  fuel: number;
}

export interface PitKilnPlan {
  fireableItems: number;
  cycles: number;
  dryGrass: number;
  sticks: number;
  fuel: number;
  fuelType: KilnFuelType;
  durationHours: number;
  lines: PitKilnLine[];
}

export interface BeehiveClassSummary {
  beehiveClass: BeehiveClass;
  quantity: number;
  capacity: number;
  firings: number;
}

export interface BeehiveKilnPlan {
  fireableItems: number;
  firings: number;
  fuel: number;
  fuelType: KilnFuelType;
  durationHours: number;
  classes: BeehiveClassSummary[];
}

export const KILN_FUEL_OPTIONS: KilnFuelOption[] = [
  { type: "firewood", labelKey: "pottery.fuel.firewood", pitDurationHours: 20, pitFuelPerCycle: 4, beehiveFuelPerFiring: 252 },
  { type: "peat", labelKey: "pottery.fuel.peat", pitDurationHours: 16, pitFuelPerCycle: 4, beehiveFuelPerFiring: 216 },
  { type: "brown-coal", labelKey: "pottery.fuel.brown_coal", pitDurationHours: 14, pitFuelPerCycle: 4, beehiveFuelPerFiring: 54 },
  { type: "black-coal", labelKey: "pottery.fuel.black_coal", pitDurationHours: 12, pitFuelPerCycle: 4, beehiveFuelPerFiring: 54 },
  { type: "charcoal", labelKey: "pottery.fuel.charcoal", pitDurationHours: 10, pitFuelPerCycle: 4, beehiveFuelPerFiring: 54 },
  { type: "coke", labelKey: "pottery.fuel.coke", pitDurationHours: 10, pitFuelPerCycle: 4, beehiveFuelPerFiring: 54 },
];

export const DEFAULT_KILN_FUEL_TYPE: KilnFuelType = "firewood";

const BEEHIVE_CAPACITY_BY_CLASS: Record<BeehiveClass, number> = {
  small: 72,
  "full-block": 18,
  "storage-vessel": 27,
  shingles: 5184,
};

export function clampPositiveInt(value: number, min = 1, max = 9999): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function getKilnFuelOption(fuelType: KilnFuelType): KilnFuelOption {
  return KILN_FUEL_OPTIONS.find((fuel) => fuel.type === fuelType) ?? KILN_FUEL_OPTIONS[0];
}

export function calcClayCost(recipe: PotteryRecipe, quantity: number): number {
  const target = clampPositiveInt(quantity);

  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.ceil(target / recipe.outputCount) * recipe.clayCost;
  }

  return recipe.clayCost * target;
}

export function calcCraftedOutput(recipe: PotteryRecipe, quantity: number): number {
  const target = clampPositiveInt(quantity);
  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.ceil(target / recipe.outputCount) * recipe.outputCount;
  }
  return target;
}

export function calcMaxCraftable(inventory: PotteryInventory, recipe: PotteryRecipe): number {
  const available = recipe.clayType === "fire" ? inventory.fire : inventory.any + inventory.fire;
  if (available <= 0) return 0;

  if (recipe.minCraft && recipe.outputCount > 1) {
    return Math.floor(available / recipe.clayCost) * recipe.outputCount;
  }

  return Math.floor(available / recipe.clayCost);
}

export function calcFeasibility(inventory: PotteryInventory, plan: PotteryPlanInput[]): PotteryFeasibility {
  let totalAny = 0;
  let totalFire = 0;

  for (const item of plan) {
    const quantity = clampPositiveInt(item.quantity);
    const cost = calcClayCost(item.recipe, quantity);
    if (item.recipe.clayType === "fire") {
      totalFire += cost;
    } else {
      totalAny += cost;
    }
  }

  const fireAfterFireOnly = inventory.fire - totalFire;
  const spareFireForAny = Math.max(0, fireAfterFireOnly);
  const anyCovered = inventory.any + spareFireForAny;
  const shortfallFire = Math.max(0, totalFire - inventory.fire);
  const shortfallAny = Math.max(0, totalAny - anyCovered);
  const anyUsed = Math.min(inventory.any, totalAny);
  const anyRemainder = totalAny - anyUsed;
  const fireUsedForAny = Math.min(spareFireForAny, anyRemainder);

  return {
    feasible: shortfallAny === 0 && shortfallFire === 0,
    totalAny,
    totalFire,
    totalClay: totalAny + totalFire,
    shortfallAny,
    shortfallFire,
    leftoverAny: Math.max(0, inventory.any - anyUsed),
    leftoverFire: Math.max(0, inventory.fire - totalFire - fireUsedForAny),
  };
}

export function hydratePlanItems(
  plan: PotteryPlanItem[],
  recipeById: Map<string, PotteryRecipe>,
): PotteryPlanInput[] {
  return plan
    .map((item) => {
      const recipe = recipeById.get(item.recipeId);
      return recipe ? { recipe, quantity: clampPositiveInt(item.quantity) } : null;
    })
    .filter((item): item is PotteryPlanInput => item !== null);
}

export function getFireablePlan(plan: PotteryPlanInput[]): FireablePlanInput[] {
  return plan
    .map((item) => {
      if (!item.recipe.requiresFiring || !item.recipe.pitKilnCapacity || !item.recipe.beehiveClass) return null;

      return {
        ...item,
        quantity: clampPositiveInt(item.quantity),
        craftedOutput: calcCraftedOutput(item.recipe, item.quantity),
        pitKilnCapacity: item.recipe.pitKilnCapacity,
        beehiveClass: item.recipe.beehiveClass,
      };
    })
    .filter((item): item is FireablePlanInput => item !== null);
}

export function calcPitKilnPlan(plan: PotteryPlanInput[], fuelType: KilnFuelType): PitKilnPlan {
  const fuelOption = getKilnFuelOption(fuelType);
  const lines = getFireablePlan(plan).map((item) => {
    const cycles = Math.ceil(item.craftedOutput / item.pitKilnCapacity);
    const fuelPerCycle = item.recipe.id === "storage-vessel" ? 8 : fuelOption.pitFuelPerCycle;

    return {
      recipe: item.recipe,
      quantity: item.quantity,
      craftedOutput: item.craftedOutput,
      cycles,
      fuel: cycles * fuelPerCycle,
    };
  });
  const cycles = lines.reduce((sum, line) => sum + line.cycles, 0);

  return {
    fireableItems: lines.reduce((sum, line) => sum + line.craftedOutput, 0),
    cycles,
    dryGrass: cycles * 10,
    sticks: cycles * 8,
    fuel: lines.reduce((sum, line) => sum + line.fuel, 0),
    fuelType,
    durationHours: cycles * fuelOption.pitDurationHours,
    lines,
  };
}

export function calcBeehiveKilnPlan(plan: PotteryPlanInput[], fuelType: KilnFuelType): BeehiveKilnPlan {
  const fuelOption = getKilnFuelOption(fuelType);
  const totalsByClass = getFireablePlan(plan).reduce(
    (totals, item) => {
      totals[item.beehiveClass] = (totals[item.beehiveClass] ?? 0) + item.craftedOutput;
      return totals;
    },
    {} as Partial<Record<BeehiveClass, number>>,
  );
  const classes = (Object.entries(totalsByClass) as [BeehiveClass, number][])
    .map(([beehiveClass, quantity]) => {
      const capacity = BEEHIVE_CAPACITY_BY_CLASS[beehiveClass];
      return {
        beehiveClass,
        quantity,
        capacity,
        firings: Math.ceil(quantity / capacity),
      };
    })
    .filter((item) => item.quantity > 0);
  const firings = classes.reduce((max, item) => Math.max(max, item.firings), 0);

  return {
    fireableItems: classes.reduce((sum, item) => sum + item.quantity, 0),
    firings,
    fuel: firings * fuelOption.beehiveFuelPerFiring,
    fuelType,
    durationHours: firings * 10.9,
    classes,
  };
}
