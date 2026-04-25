export type ClayType = "any" | "fire";
export type KilnMode = "pit" | "beehive";
export type KilnFuelType = "firewood" | "peat" | "brown-coal" | "black-coal" | "charcoal" | "coke";
export type BeehiveClass = "small" | "full-block" | "storage-vessel" | "shingles";

export type PotteryCategory =
  | "cooking"
  | "storage"
  | "agriculture"
  | "building"
  | "utility"
  | "molds";

export interface PotteryCategoryMeta {
  id: PotteryCategory;
  label: string;
  color: string;
}

export interface PotteryRecipe {
  id: string;
  name: string;
  category: PotteryCategory;
  clayCost: number;
  outputCount: number;
  clayType: ClayType;
  requiresFiring: boolean;
  imageSrc: string;
  minCraft?: number;
  batchRecipe?: {
    clayCost: number;
    outputCount: number;
  };
  pitKilnCapacity?: number;
  beehiveClass?: BeehiveClass;
  firingNotes?: string[];
  clayPerItem: number;
}

export interface PotteryCalculatorState {
  recipeId: string | null;
  quantity: number;
}

export interface PotteryPlanItem {
  recipeId: string;
  quantity: number;
}

export interface PotteryPlannerState {
  plan: PotteryPlanItem[];
  invAny: number;
  invFire: number;
  kilnMode: KilnMode;
  fuelType: KilnFuelType;
}

export type PotteryView = "pottery-calculator" | "pottery-planner";
