import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherCalculation,
  LeatherMode,
  PeltCalculation,
  Solvent,
} from "@/features/leatherwork/types/leather";
import {
  buildLeatherPipeline,
  buildLeatherShoppingList,
  buildLeatherSummaryMetrics,
  buildPeltPipeline,
  buildPeltShoppingList,
  buildPeltSummaryMetrics,
} from "./batchBuilder";
import {
  BEAR_DATA,
  DILUTED_BORAX_BATCH_COST,
  DILUTED_BORAX_BATCH_LITERS,
  HIDE_DATA,
  TANNIN_BATCH_LITERS,
  type HideStage,
  type LeatherMaterial,
  type TranslateFn,
  getHideAssetPath,
  getMaterialAssetPath,
  getPeltFatRequired,
  getPowderedBoraxRequired,
  getSizeLabel,
  hidesForLeather,
  hidesForLeatherTarget,
} from "./core";
import { getSelectedHideProfile } from "./hideProfileAllocation";

export {
  BEAR_DATA,
  DILUTED_BORAX_BATCH_COST,
  DILUTED_BORAX_BATCH_LITERS,
  HIDE_DATA,
  TANNIN_BATCH_LITERS,
  type HideStage,
  type LeatherMaterial,
  type TranslateFn,
  getHideAssetPath,
  getMaterialAssetPath,
  getPowderedBoraxRequired,
  hidesForLeather,
  hidesForLeatherTarget,
  getSelectedHideProfile,
};

export function calculateLeatherPlan({
  t,
  hideCount,
  mode,
  size,
  solvent,
  targetLeather = null,
  animalVariant = "generic",
  bearVariant = null,
}: {
  t: TranslateFn;
  hideCount: number;
  mode: LeatherMode;
  size: HideSize;
  solvent: Solvent;
  targetLeather?: number | null;
  animalVariant?: AnimalVariant;
  bearVariant?: BearVariant | null;
}): LeatherCalculation {
  const rawHideCount = mode === "leather"
    ? hidesForLeatherTarget(targetLeather ?? 1, size, bearVariant)
    : hideCount;

  const hideProfile = getSelectedHideProfile({
    t,
    size,
    animalVariant,
    bearVariant,
    rawHideCount,
  });
  const scrapedHideData = HIDE_DATA[hideProfile.scrapedHideSize];
  const soakingLiters = rawHideCount * hideProfile.soakingLitersPerRawHide;
  const scrapedHideCount = rawHideCount * hideProfile.scrapedHideCountPerRawHide;
  const tanninLitersPerStage = scrapedHideCount * scrapedHideData.litersPerHide;
  const soakingBarrels = Math.ceil(rawHideCount / hideProfile.soakingBarrelCapacity);
  const preparingBarrels = Math.ceil(scrapedHideCount / scrapedHideData.maxPerBarrel);
  const weakTanninBatchesPerRound = Math.ceil(tanninLitersPerStage / TANNIN_BATCH_LITERS);
  const strongTanninBatches = weakTanninBatchesPerRound;
  const weakTanninProduced = weakTanninBatchesPerRound * TANNIN_BATCH_LITERS * 2;
  const weakTanninWater = weakTanninBatchesPerRound * TANNIN_BATCH_LITERS * 2;
  const strongTanninProduced = strongTanninBatches * TANNIN_BATCH_LITERS;
  const tanninLogsForWeak = weakTanninBatchesPerRound * 2;
  const tanninLogsForStrong = strongTanninBatches;
  const totalLogs = tanninLogsForWeak + tanninLogsForStrong;
  const actualLeather = rawHideCount * hideProfile.leatherYieldPerRawHide;
  const powderedBoraxRequired = getPowderedBoraxRequired(soakingLiters);
  const totalWater = soakingLiters + weakTanninWater;
  const baseCalculation = {
    workflow: "leather" as const,
    hideProfile,
    rawHideCount,
    actualLeather,
    scrapedHideCount,
    soakingLiters,
    tanningLitersPerStage: tanninLitersPerStage,
    soakingWater: soakingLiters,
    limeRequired: soakingLiters,
    powderedBoraxRequired,
    weakTanninWater,
    weakTanninProduced,
    strongTanninProduced,
    tanninLogsForWeak,
    tanninLogsForStrong,
    totalLogs,
    totalWater,
    soakingBarrels,
    weakTanninBarrelsPerRound: weakTanninBatchesPerRound,
    preparingBarrels,
    strongTanninBarrels: strongTanninBatches,
    completingBarrels: preparingBarrels,
    summaryMetrics: buildLeatherSummaryMetrics({
      t,
      rawHideCount,
      actualLeather,
      totalWater,
      totalLogs,
      solvent,
      solventAmount: solvent === "lime" ? soakingLiters : powderedBoraxRequired,
      peakHideBarrels: Math.max(soakingBarrels, preparingBarrels),
    }),
    shoppingList: buildLeatherShoppingList({
      t,
      rawHideCount,
      totalWater,
      solvent,
      limeRequired: soakingLiters,
      powderedBoraxRequired,
      totalLogs,
      hideProfile,
    }),
    pipeline: buildLeatherPipeline({
      t,
      hideProfile,
      rawHideCount,
      scrapedHideCount,
      actualLeather,
      soakingLiters,
      soakingBarrels,
      tanninLitersPerStage,
      weakTanninWater,
      weakTanninBarrelsPerRound: weakTanninBatchesPerRound,
      strongTanninBarrels: strongTanninBatches,
      preparingBarrels,
      completingBarrels: preparingBarrels,
      tanninLogsForWeak,
      tanninLogsForStrong,
      limeRequired: soakingLiters,
      powderedBoraxRequired,
      solvent,
    }),
  };

  if (mode === "leather") {
    return {
      ...baseCalculation,
      mode: "leather",
      targetLeather: targetLeather ?? 1,
    };
  }

  return {
    ...baseCalculation,
    mode: "hides",
    targetLeather: null,
  };
}

export function calculatePeltPlan({
  t,
  hideCount,
  size,
  animalVariant = "generic",
  bearVariant = null,
}: {
  t: TranslateFn;
  hideCount: number;
  size: HideSize;
  animalVariant?: AnimalVariant;
  bearVariant?: BearVariant | null;
}): PeltCalculation {
  const hideProfile = getSelectedHideProfile({
    t,
    size,
    animalVariant,
    bearVariant,
    rawHideCount: hideCount,
  });
  const fatRequired = getPeltFatRequired(hideProfile.rawSize, hideCount, bearVariant);
  const splitGenericPeltCount = bearVariant ? hideCount * BEAR_DATA[bearVariant].splitPeltCount : 0;
  const splitGenericPeltSize = bearVariant ? BEAR_DATA[bearVariant].splitPeltSize : null;
  const splitGenericPeltLabel = splitGenericPeltSize
    ? t(`leather.pelt.label.size_pelt.${splitGenericPeltCount === 1 ? "one" : "other"}`, {
        count: splitGenericPeltCount,
        size: getSizeLabel(t, splitGenericPeltSize).toLowerCase(),
      })
    : null;
  const curedPeltLabel = bearVariant
    ? t("leather.pelt.label.bear_with_head")
    : t(`leather.pelt.label.size_pelt.${hideCount === 1 ? "one" : "other"}`, {
        count: hideCount,
        size: getSizeLabel(t, hideProfile.rawSize).toLowerCase(),
      });

  return {
    workflow: "pelt",
    hideProfile,
    rawHideCount: hideCount,
    fatRequired,
    curingDuration: t("leather.pipeline.duration.forty_eight_hours"),
    curedPeltCount: hideCount,
    curedPeltLabel,
    curedPeltAssetPath: hideProfile.rawAssetPath,
    splitGenericPeltCount,
    splitGenericPeltSize,
    splitGenericPeltLabel,
    splitHeadCount: bearVariant ? hideCount : 0,
    summaryMetrics: buildPeltSummaryMetrics({
      t,
      fatRequired,
      curedPeltCount: hideCount,
      curedPeltLabel,
      splitGenericPeltCount,
      splitGenericPeltLabel,
    }),
    shoppingList: buildPeltShoppingList({
      t,
      hideProfile,
      rawHideCount: hideCount,
      fatRequired,
    }),
    pipeline: buildPeltPipeline({
      t,
      hideProfile,
      rawHideCount: hideCount,
      fatRequired,
      curedPeltLabel,
      splitGenericPeltLabel,
      splitHeadCount: bearVariant ? hideCount : 0,
    }),
  };
}
