export type ClayType = "any" | "fire";

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
}

export type PotteryView = "pottery-calculator" | "pottery-planner";
