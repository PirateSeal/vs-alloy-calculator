import type { AlloyRecipe, MetalId } from "./alloys";
import type { CrucibleState } from "./crucible";

export type AppDomain = "metallurgy" | "leather";
export type MetallurgyView = "calculator" | "planner" | "reference" | "about";
export type ScarcityMode = "balanced" | "economical" | "preserve-copper" | "max-output";

export type InventoryState = Record<MetalId, number>;

export interface BatchRun {
  runNumber: number;
  ingotsProduced: number;
  crucible: CrucibleState;
  consumed: InventoryState;
  inventoryAfter: InventoryState;
}

export interface BatchPlan {
  recipeId: AlloyRecipe["id"];
  totalIngots: number;
  runs: BatchRun[];
  inventoryBefore: InventoryState;
  inventoryAfter: InventoryState;
  leftovers: InventoryState;
  scarcityMode: ScarcityMode;
  maxCraftableIngots: number;
}

export interface CraftableRecipeResult {
  recipeId: AlloyRecipe["id"];
  totalIngots: number;
  consumed: InventoryState;
  leftovers: InventoryState;
  scarcityScore: number;
  rarityCost: number;
  copperUsed: number;
  limitingMetalId: MetalId | null;
  plan: BatchPlan;
}

export interface PlannerInsights {
  minimumValidIngots: number | null;
  previousValidIngots: number | null;
  nextValidIngots: number | null;
  limitingMetalId: MetalId | null;
}

export interface RecipePlannerResult {
  maxCraftableIngots: number;
  requestedTargetIngots: number;
  selectedTargetIngots: number | null;
  plan: BatchPlan | null;
  insights: PlannerInsights;
}

export interface PlannerState {
  scarcityMode: ScarcityMode;
  recipeId: AlloyRecipe["id"] | null;
  targetIngots: number;
  inventory: InventoryState;
}
