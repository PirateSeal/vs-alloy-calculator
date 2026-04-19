export type HideSize = "small" | "medium" | "large" | "huge";
export type Solvent = "lime" | "borax";
export type LeatherMode = "hides" | "leather";
export type LeatherWorkflow = "leather" | "pelt";
export type AnimalVariant = "generic" | "fox" | "arctic-fox" | "raccoon";
export type BearVariant = "sun" | "panda" | "black" | "brown" | "polar";

export interface HideSizeData {
  litersPerHide: number;
  leatherYield: number;
  maxPerBarrel: number;
}

export interface LeatherState {
  workflow: LeatherWorkflow;
  mode: LeatherMode;
  size: HideSize;
  animalVariant: AnimalVariant;
  bearVariant: BearVariant | null;
  hideCount: number;
  targetLeather: number;
  solvent: Solvent;
}

export interface PipelineStep {
  id: string;
  title: string;
  duration: string;
  summary: string;
  barrels?: number;
  batches?: number;
  stageAsset?: string;
  inputs: string[];
  outputs: string[];
  note?: string;
}

export interface ShoppingListItem {
  id: string;
  label: string;
  amount: string;
  hint?: string;
  assetPath?: string;
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  hint?: string;
  assetPath?: string;
}

export interface HideProfile {
  rawSize: HideSize;
  displaySize: HideSize;
  animalVariant: AnimalVariant;
  bearVariant: BearVariant | null;
  rawHideCount: number;
  rawHideLabel: string;
  rawHideSubtitle: string;
  rawAssetPath: string;
  soakingLitersPerRawHide: number;
  soakingBarrelCapacity: number;
  scrapedHideCountPerRawHide: number;
  scrapedHideSize: HideSize;
  scrapedHideLabel: string;
  scrapedAssetPath: string;
  preparedAssetPath: string;
  leatherAssetPath: string;
  leatherYieldPerRawHide: number;
}

export interface LeatherCalculation {
  workflow: "leather";
  hideProfile: HideProfile;
  mode: LeatherMode;
  rawHideCount: number;
  targetLeather: number | null;
  actualLeather: number;
  scrapedHideCount: number;
  soakingLiters: number;
  tanningLitersPerStage: number;
  soakingWater: number;
  limeRequired: number;
  powderedBoraxRequired: number;
  weakTanninWater: number;
  weakTanninProduced: number;
  strongTanninProduced: number;
  tanninLogsForWeak: number;
  tanninLogsForStrong: number;
  totalLogs: number;
  totalWater: number;
  soakingBarrels: number;
  weakTanninBarrelsPerRound: number;
  preparingBarrels: number;
  strongTanninBarrels: number;
  completingBarrels: number;
  summaryMetrics: SummaryMetric[];
  shoppingList: ShoppingListItem[];
  pipeline: PipelineStep[];
}

export interface PeltCalculation {
  workflow: "pelt";
  hideProfile: HideProfile;
  rawHideCount: number;
  fatRequired: number;
  curingDuration: string;
  curedPeltCount: number;
  curedPeltLabel: string;
  curedPeltAssetPath: string;
  splitGenericPeltCount: number;
  splitGenericPeltSize: HideSize | null;
  splitGenericPeltLabel: string | null;
  splitHeadCount: number;
  summaryMetrics: SummaryMetric[];
  shoppingList: ShoppingListItem[];
  pipeline: PipelineStep[];
}

export type LeatherworkCalculation = LeatherCalculation | PeltCalculation;
