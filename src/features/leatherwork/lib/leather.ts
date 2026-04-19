import type {
  AnimalVariant,
  BearVariant,
  HideProfile,
  HideSize,
  HideSizeData,
  LeatherCalculation,
  LeatherMode,
  PipelineStep,
  PeltCalculation,
  ShoppingListItem,
  Solvent,
  SummaryMetric,
} from "@/features/leatherwork/types/leather";

export const HIDE_DATA: Record<HideSize, HideSizeData> = {
  small: { litersPerHide: 2, leatherYield: 1, maxPerBarrel: 25 },
  medium: { litersPerHide: 4, leatherYield: 2, maxPerBarrel: 12 },
  large: { litersPerHide: 6, leatherYield: 3, maxPerBarrel: 8 },
  huge: { litersPerHide: 10, leatherYield: 5, maxPerBarrel: 5 },
};

export const BEAR_DATA: Record<
  BearVariant,
  {
    rawSize: HideSize;
    scrapedHugeHides: number;
    peltFatCost: number;
    splitPeltSize: HideSize;
    splitPeltCount: number;
  }
> = {
  sun: { rawSize: "large", scrapedHugeHides: 2, peltFatCost: 1, splitPeltSize: "medium", splitPeltCount: 1 },
  panda: { rawSize: "large", scrapedHugeHides: 2, peltFatCost: 1, splitPeltSize: "large", splitPeltCount: 1 },
  black: { rawSize: "huge", scrapedHugeHides: 2, peltFatCost: 2, splitPeltSize: "large", splitPeltCount: 2 },
  brown: { rawSize: "huge", scrapedHugeHides: 3, peltFatCost: 2, splitPeltSize: "huge", splitPeltCount: 2 },
  polar: { rawSize: "huge", scrapedHugeHides: 3, peltFatCost: 2, splitPeltSize: "huge", splitPeltCount: 3 },
};

export const DILUTED_BORAX_BATCH_LITERS = 5;
export const DILUTED_BORAX_BATCH_COST = 2;
export const TANNIN_BATCH_LITERS = 10;
const BUCKET_LITERS = 10;

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

function translateCount(
  t: TranslateFn,
  baseKey: string,
  count: number,
  vars?: Record<string, string | number>,
): string {
  return t(`${baseKey}.${count === 1 ? "one" : "other"}`, { count, ...vars });
}

function formatLiters(liters: number): string {
  return `${liters} L`;
}

function formatBuckets(t: TranslateFn, liters: number): string {
  return translateCount(t, "leather.count.bucket", Math.ceil(liters / BUCKET_LITERS));
}

function formatBarrels(t: TranslateFn, count: number): string {
  return translateCount(t, "leather.count.barrel", count);
}

function formatBatches(t: TranslateFn, count: number): string {
  return translateCount(t, "leather.count.batch", count);
}

function formatUnits(t: TranslateFn, count: number, baseKey: string): string {
  return translateCount(t, baseKey, count);
}

export type HideStage = "raw" | "soaked" | "scraped" | "prepared";

export type LeatherMaterial =
  | "acacia-log"
  | "barrel"
  | "borax-ore"
  | "borax-powder"
  | "diluted-borax"
  | "leather"
  | "lime"
  | "oak-log"
  | "strong-tannin"
  | "weak-tannin"
  | "knife-copper";

export function getHideAssetPath(stage: HideStage, size: HideSize): string {
  return `/leather/hides/${stage}/${size}.png`;
}

export function getMaterialAssetPath(material: LeatherMaterial): string {
  if (material === "barrel" || material === "knife-copper") {
    return `/leather/tools/${material}.png`;
  }

  return `/leather/materials/${material}.png`;
}

function getSizeLabel(t: TranslateFn, size: HideSize): string {
  return t(`leather.hide_size.${size}`);
}

function getAnimalLabel(t: TranslateFn, animalVariant: AnimalVariant): string {
  return t(`leather.animal.${animalVariant}`);
}

function getBearLabel(t: TranslateFn, bearVariant: BearVariant): string {
  return t(`leather.bear.${bearVariant}`);
}

function buildStageHideDescriptor(
  t: TranslateFn,
  stage: "raw" | "soaked",
  count: number,
  size: HideSize,
  animalVariant: AnimalVariant,
  bearVariant: BearVariant | null,
): string {
  const countKey = count === 1 ? "one" : "other";

  if (bearVariant) {
    return t(`leather.descriptor.${stage}.bear.${countKey}`, {
      count,
      bear: getBearLabel(t, bearVariant),
    });
  }

  if (size === "small" && animalVariant !== "generic") {
    return t(`leather.descriptor.${stage}.animal.${countKey}`, {
      count,
      animal: getAnimalLabel(t, animalVariant),
    });
  }

  return t(`leather.descriptor.${stage}.size.${countKey}`, {
    count,
    size: getSizeLabel(t, size),
  });
}

function getLeatherYieldForSelection(size: HideSize, bearVariant: BearVariant | null): number {
  if (!bearVariant) {
    return HIDE_DATA[size].leatherYield;
  }

  return BEAR_DATA[bearVariant].scrapedHugeHides * HIDE_DATA.huge.leatherYield;
}

export function hidesForLeather(targetLeather: number, size: HideSize): number {
  return Math.ceil(targetLeather / HIDE_DATA[size].leatherYield);
}

export function hidesForLeatherTarget(
  targetLeather: number,
  size: HideSize,
  bearVariant: BearVariant | null = null,
): number {
  return Math.ceil(targetLeather / getLeatherYieldForSelection(size, bearVariant));
}

export function getPowderedBoraxRequired(totalLiters: number): number {
  return Math.ceil(totalLiters / DILUTED_BORAX_BATCH_LITERS) * DILUTED_BORAX_BATCH_COST;
}

const PELT_FAT_PER_HIDE: Record<HideSize, number> = {
  small: 0.25,
  medium: 0.5,
  large: 1,
  huge: 2,
};

function getPeltFatRequired(size: HideSize, hideCount: number, bearVariant: BearVariant | null): number {
  if (bearVariant) {
    return hideCount * BEAR_DATA[bearVariant].peltFatCost;
  }
  return Math.ceil(hideCount * PELT_FAT_PER_HIDE[size]);
}

export function getSelectedHideProfile({
  t,
  size,
  animalVariant = "generic",
  bearVariant = null,
  rawHideCount = 1,
}: {
  t: TranslateFn;
  size: HideSize;
  animalVariant?: AnimalVariant;
  bearVariant?: BearVariant | null;
  rawHideCount?: number;
}): HideProfile {
  if (bearVariant) {
    const bearData = BEAR_DATA[bearVariant];
    const rawSize = bearData.rawSize;

    return {
      rawSize,
      displaySize: rawSize,
      animalVariant: "generic",
      bearVariant,
      rawHideCount,
      rawHideLabel: getBearLabel(t, bearVariant),
      rawHideSubtitle: t("leather.profile.subtitle.bear", {
        size: getSizeLabel(t, rawSize),
        hides: bearData.scrapedHugeHides,
      }),
      rawAssetPath: getHideAssetPath("raw", rawSize),
      soakingLitersPerRawHide: HIDE_DATA[rawSize].litersPerHide,
      soakingBarrelCapacity: HIDE_DATA[rawSize].maxPerBarrel,
      scrapedHideCountPerRawHide: bearData.scrapedHugeHides,
      scrapedHideSize: "huge",
      scrapedHideLabel: t("leather.profile.label.scraped", { size: getSizeLabel(t, "huge") }),
      scrapedAssetPath: getHideAssetPath("scraped", "huge"),
      preparedAssetPath: getHideAssetPath("prepared", "huge"),
      leatherAssetPath: getMaterialAssetPath("leather"),
      leatherYieldPerRawHide: bearData.scrapedHugeHides * HIDE_DATA.huge.leatherYield,
    };
  }

  const label = size === "small" && animalVariant !== "generic"
    ? t("leather.profile.label.animal", { animal: getAnimalLabel(t, animalVariant) })
    : t("leather.profile.label.size", { size: getSizeLabel(t, size) });

  const subtitle = size === "small" && animalVariant !== "generic"
    ? t("leather.profile.subtitle.small_variant", { animal: getAnimalLabel(t, animalVariant) })
    : t("leather.profile.subtitle.size", { size: getSizeLabel(t, size) });

  return {
    rawSize: size,
    displaySize: size,
    animalVariant,
    bearVariant: null,
    rawHideCount,
    rawHideLabel: label,
    rawHideSubtitle: subtitle,
    rawAssetPath: getHideAssetPath("raw", size),
    soakingLitersPerRawHide: HIDE_DATA[size].litersPerHide,
    soakingBarrelCapacity: HIDE_DATA[size].maxPerBarrel,
    scrapedHideCountPerRawHide: 1,
    scrapedHideSize: size,
    scrapedHideLabel: t("leather.profile.label.scraped", { size: getSizeLabel(t, size) }),
    scrapedAssetPath: getHideAssetPath("scraped", size),
    preparedAssetPath: getHideAssetPath("prepared", size),
    leatherAssetPath: getMaterialAssetPath("leather"),
    leatherYieldPerRawHide: HIDE_DATA[size].leatherYield,
  };
}

function buildLeatherSummaryMetrics({
  t,
  rawHideCount,
  actualLeather,
  totalWater,
  totalLogs,
  solvent,
  solventAmount,
  peakHideBarrels,
}: {
  t: TranslateFn;
  rawHideCount: number;
  actualLeather: number;
  totalWater: number;
  totalLogs: number;
  solvent: Solvent;
  solventAmount: number;
  peakHideBarrels: number;
}): SummaryMetric[] {
  return [
    {
      id: "output",
      label: t("leather.metric.output"),
      value: formatUnits(t, actualLeather, "leather.term.leather"),
      hint: t("leather.metric.output_hint", { count: rawHideCount }),
      assetPath: getMaterialAssetPath("leather"),
    },
    {
      id: "barrels",
      label: t("leather.metric.barrels"),
      value: String(peakHideBarrels),
      hint: t("leather.metric.barrels_hint"),
      assetPath: getMaterialAssetPath("barrel"),
    },
    {
      id: "water",
      label: t("leather.metric.water"),
      value: formatLiters(totalWater),
      hint: formatBuckets(t, totalWater),
      assetPath: getMaterialAssetPath("weak-tannin"),
    },
    {
      id: "solvent",
      label: t(`leather.solvent.${solvent}`),
      value: String(solventAmount),
      hint: solvent === "lime"
        ? t("leather.metric.solvent_hint_lime")
        : t("leather.metric.solvent_hint_borax", {
            chunks: Math.ceil(solventAmount / 2),
          }),
      assetPath: solvent === "lime" ? getMaterialAssetPath("lime") : getMaterialAssetPath("borax-powder"),
    },
    {
      id: "logs",
      label: t("leather.shopping.logs"),
      value: String(totalLogs),
      hint: t("leather.metric.logs_hint"),
      assetPath: getMaterialAssetPath("oak-log"),
    },
  ];
}

function buildLeatherShoppingList({
  t,
  rawHideCount,
  totalWater,
  solvent,
  limeRequired,
  powderedBoraxRequired,
  totalLogs,
  hideProfile,
}: {
  t: TranslateFn;
  rawHideCount: number;
  totalWater: number;
  solvent: Solvent;
  limeRequired: number;
  powderedBoraxRequired: number;
  totalLogs: number;
  hideProfile: HideProfile;
}): ShoppingListItem[] {
  return [
    {
      id: "raw-hides",
      label: t("leather.shopping.raw_hides"),
      amount: String(rawHideCount),
      hint: hideProfile.rawHideSubtitle,
      assetPath: hideProfile.rawAssetPath,
    },
    {
      id: "water",
      label: t("leather.shopping.water_total"),
      amount: formatLiters(totalWater),
      hint: formatBuckets(t, totalWater),
      assetPath: getMaterialAssetPath("weak-tannin"),
    },
    solvent === "lime"
      ? {
          id: "lime",
          label: t("leather.shopping.lime"),
          amount: String(limeRequired),
          hint: t("leather.shopping.hint.lime", { liters: formatLiters(limeRequired) }),
          assetPath: getMaterialAssetPath("lime"),
        }
      : {
          id: "powdered-borax",
          label: t("leather.shopping.powdered_borax"),
          amount: String(powderedBoraxRequired),
          hint: t("leather.shopping.hint.powdered_borax", {
            chunks: Math.ceil(powderedBoraxRequired / 2),
          }),
          assetPath: getMaterialAssetPath("borax-powder"),
        },
    {
      id: "logs",
      label: t("leather.shopping.logs"),
      amount: String(totalLogs),
      hint: t("leather.shopping.hint.logs"),
      assetPath: getMaterialAssetPath("oak-log"),
    },
  ];
}

function buildLeatherPipeline({
  t,
  hideProfile,
  rawHideCount,
  scrapedHideCount,
  actualLeather,
  soakingLiters,
  soakingBarrels,
  tanninLitersPerStage,
  weakTanninWater,
  weakTanninBarrelsPerRound,
  strongTanninBarrels,
  preparingBarrels,
  completingBarrels,
  tanninLogsForWeak,
  tanninLogsForStrong,
  limeRequired,
  powderedBoraxRequired,
  solvent,
}: {
  t: TranslateFn;
  hideProfile: HideProfile;
  rawHideCount: number;
  scrapedHideCount: number;
  actualLeather: number;
  soakingLiters: number;
  soakingBarrels: number;
  tanninLitersPerStage: number;
  weakTanninWater: number;
  weakTanninBarrelsPerRound: number;
  strongTanninBarrels: number;
  preparingBarrels: number;
  completingBarrels: number;
  tanninLogsForWeak: number;
  tanninLogsForStrong: number;
  limeRequired: number;
  powderedBoraxRequired: number;
  solvent: Solvent;
}): PipelineStep[] {
  const rawDescriptor = buildStageHideDescriptor(
    t,
    "raw",
    rawHideCount,
    hideProfile.rawSize,
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const soakedDescriptor = buildStageHideDescriptor(
    t,
    "soaked",
    rawHideCount,
    hideProfile.rawSize,
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const scrapedDescriptor = t(`leather.descriptor.scraped.${scrapedHideCount === 1 ? "one" : "other"}`, {
    count: scrapedHideCount,
    size: getSizeLabel(t, hideProfile.scrapedHideSize),
  });
  const preparedDescriptor = t(`leather.descriptor.prepared.${scrapedHideCount === 1 ? "one" : "other"}`, {
    count: scrapedHideCount,
    size: getSizeLabel(t, hideProfile.scrapedHideSize),
  });

  return [
    {
      id: "make-weak-tannin",
      title: t("leather.pipeline.step.make_weak_tannin.title"),
      duration: t("leather.pipeline.duration.one_day"),
      summary: t("leather.pipeline.step.make_weak_tannin.summary", {
        barrels: formatBarrels(t, weakTanninBarrelsPerRound),
        batches: formatBatches(t, weakTanninBarrelsPerRound * 2),
      }),
      barrels: weakTanninBarrelsPerRound,
      batches: weakTanninBarrelsPerRound * 2,
      stageAsset: getMaterialAssetPath("weak-tannin"),
      inputs: [
        t("leather.pipeline.input.logs", { count: tanninLogsForWeak }),
        t("leather.pipeline.input.water", { liters: formatLiters(weakTanninWater) }),
      ],
      outputs: [
        t("leather.pipeline.output.weak_tannin_preparing", {
          liters: formatLiters(weakTanninBarrelsPerRound * TANNIN_BATCH_LITERS * 2),
        }),
        t("leather.pipeline.output.weak_tannin_saved", {
          liters: formatLiters(tanninLitersPerStage),
        }),
      ],
      note: t("leather.pipeline.step.make_weak_tannin.note"),
    },
    {
      id: "soak",
      title: t("leather.pipeline.step.soak.title"),
      duration: t("leather.pipeline.duration.twenty_hours"),
      summary: formatBarrels(t, soakingBarrels),
      barrels: soakingBarrels,
      stageAsset: getHideAssetPath("soaked", hideProfile.rawSize),
      inputs: [
        rawDescriptor,
        t("leather.pipeline.input.water", { liters: formatLiters(soakingLiters) }),
        solvent === "lime"
          ? t("leather.pipeline.input.lime", { count: limeRequired })
          : t("leather.pipeline.input.powdered_borax", { count: powderedBoraxRequired }),
      ],
      outputs: [soakedDescriptor],
      note: t("leather.pipeline.step.soak.note"),
    },
    {
      id: "scrape",
      title: t("leather.pipeline.step.scrape.title"),
      duration: t("leather.pipeline.duration.instant"),
      summary: t("leather.pipeline.step.scrape.summary"),
      stageAsset: hideProfile.scrapedAssetPath,
      inputs: [soakedDescriptor, translateCount(t, "leather.term.knife", 1)],
      outputs: [scrapedDescriptor],
      note: hideProfile.bearVariant
        ? t("leather.pipeline.step.scrape.note_bear", {
            bear: getBearLabel(t, hideProfile.bearVariant),
            hides: hideProfile.scrapedHideCountPerRawHide,
          })
        : hideProfile.rawSize === "small" && hideProfile.animalVariant !== "generic"
          ? t("leather.pipeline.step.scrape.note_small", {
              animal: getAnimalLabel(t, hideProfile.animalVariant),
            })
          : undefined,
    },
    {
      id: "prepare",
      title: t("leather.pipeline.step.prepare.title"),
      duration: t("leather.pipeline.duration.three_days"),
      summary: formatBarrels(t, preparingBarrels),
      barrels: preparingBarrels,
      stageAsset: hideProfile.preparedAssetPath,
      inputs: [scrapedDescriptor, t("leather.pipeline.input.weak_tannin", { liters: formatLiters(tanninLitersPerStage) })],
      outputs: [preparedDescriptor],
      note: t("leather.pipeline.step.prepare.note"),
    },
    {
      id: "make-strong-tannin",
      title: t("leather.pipeline.step.make_strong_tannin.title"),
      duration: t("leather.pipeline.duration.one_day"),
      summary: t("leather.pipeline.step.make_strong_tannin.summary", {
        barrels: formatBarrels(t, strongTanninBarrels),
        batches: formatBatches(t, strongTanninBarrels),
      }),
      barrels: strongTanninBarrels,
      batches: strongTanninBarrels,
      stageAsset: getMaterialAssetPath("strong-tannin"),
      inputs: [
        t("leather.pipeline.input.logs", { count: tanninLogsForStrong }),
        t("leather.pipeline.input.weak_tannin", { liters: formatLiters(tanninLitersPerStage) }),
      ],
      outputs: [t("leather.pipeline.output.strong_tannin", { liters: formatLiters(tanninLitersPerStage) })],
    },
    {
      id: "complete",
      title: t("leather.pipeline.step.complete.title"),
      duration: t("leather.pipeline.duration.four_half_days"),
      summary: formatBarrels(t, completingBarrels),
      barrels: completingBarrels,
      stageAsset: getMaterialAssetPath("leather"),
      inputs: [preparedDescriptor, t("leather.pipeline.input.strong_tannin", { liters: formatLiters(tanninLitersPerStage) })],
      outputs: [formatUnits(t, actualLeather, "leather.term.leather")],
    },
  ];
}

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

  return {
    workflow: "leather",
    hideProfile,
    mode,
    rawHideCount,
    targetLeather,
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
}

function buildPeltSummaryMetrics({
  t,
  fatRequired,
  curedPeltCount,
  curedPeltLabel,
  splitGenericPeltCount,
  splitGenericPeltLabel,
}: {
  t: TranslateFn;
  fatRequired: number;
  curedPeltCount: number;
  curedPeltLabel: string;
  splitGenericPeltCount: number;
  splitGenericPeltLabel: string | null;
}): SummaryMetric[] {
  const metrics: SummaryMetric[] = [
    {
      id: "pelts",
      label: t("leather.pelt.metric.output"),
      value: `${curedPeltCount} ${curedPeltLabel}`,
      hint: t("leather.pelt.metric.output_hint"),
      assetPath: getMaterialAssetPath("leather"),
    },
    {
      id: "fat",
      label: t("leather.pelt.metric.fat"),
      value: formatUnits(t, fatRequired, "leather.term.fat_lump"),
      hint: t("leather.pelt.metric.fat_hint"),
    },
    {
      id: "time",
      label: t("leather.pelt.metric.time"),
      value: t("leather.pipeline.duration.forty_eight_hours"),
      hint: t("leather.pelt.metric.time_hint"),
      assetPath: getMaterialAssetPath("barrel"),
    },
  ];

  if (splitGenericPeltCount > 0 && splitGenericPeltLabel) {
    metrics.push({
      id: "split",
      label: t("leather.pelt.metric.split"),
      value: splitGenericPeltLabel,
      hint: t("leather.pelt.metric.split_hint"),
      assetPath: getHideAssetPath("raw", "huge"),
    });
  }

  return metrics;
}

function buildPeltShoppingList({
  t,
  hideProfile,
  rawHideCount,
  fatRequired,
}: {
  t: TranslateFn;
  hideProfile: HideProfile;
  rawHideCount: number;
  fatRequired: number;
}): ShoppingListItem[] {
  const items: ShoppingListItem[] = [
    {
      id: "raw-hides",
      label: t("leather.shopping.raw_hides"),
      amount: String(rawHideCount),
      hint: hideProfile.rawHideSubtitle,
      assetPath: hideProfile.rawAssetPath,
    },
    {
      id: "fat",
      label: t("leather.pelt.shopping.fat"),
      amount: String(fatRequired),
      hint: t("leather.pelt.shopping.fat_hint"),
    },
  ];

  if (hideProfile.bearVariant) {
    items.push({
      id: "knife",
      label: t("leather.pelt.shopping.knife"),
      amount: "1",
      hint: t("leather.pelt.shopping.knife_hint"),
      assetPath: getMaterialAssetPath("knife-copper"),
    });
  }

  return items;
}

function buildPeltPipeline({
  t,
  hideProfile,
  rawHideCount,
  fatRequired,
  curedPeltLabel,
  splitGenericPeltLabel,
  splitHeadCount,
}: {
  t: TranslateFn;
  hideProfile: HideProfile;
  rawHideCount: number;
  fatRequired: number;
  curedPeltLabel: string;
  splitGenericPeltLabel: string | null;
  splitHeadCount: number;
}): PipelineStep[] {
  const rawDescriptor = buildStageHideDescriptor(
    t,
    "raw",
    rawHideCount,
    hideProfile.rawSize,
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const oiledDescriptor = hideProfile.bearVariant
    ? t(`leather.descriptor.oiled.bear.${rawHideCount === 1 ? "one" : "other"}`, {
        count: rawHideCount,
        bear: getBearLabel(t, hideProfile.bearVariant),
      })
    : t(`leather.descriptor.oiled.size.${rawHideCount === 1 ? "one" : "other"}`, {
        count: rawHideCount,
        size: getSizeLabel(t, hideProfile.rawSize),
      });
  const steps: PipelineStep[] = [
    {
      id: "oil",
      title: t("leather.pelt.step.oil.title"),
      duration: t("leather.pipeline.duration.instant"),
      summary: t("leather.pelt.step.oil.summary"),
      stageAsset: hideProfile.rawAssetPath,
      inputs: [rawDescriptor, formatUnits(t, fatRequired, "leather.term.fat_lump")],
      outputs: [oiledDescriptor],
      note: hideProfile.bearVariant
        ? t("leather.pelt.step.oil.note_bear")
        : t("leather.pelt.step.oil.note_standard"),
    },
    {
      id: "cure",
      title: t("leather.pelt.step.cure.title"),
      duration: t("leather.pipeline.duration.forty_eight_hours"),
      summary: t("leather.pelt.step.cure.summary"),
      stageAsset: hideProfile.rawAssetPath,
      inputs: [oiledDescriptor],
      outputs: [`${rawHideCount} ${curedPeltLabel}`],
      note: t("leather.pelt.step.cure.note"),
    },
  ];

  if (hideProfile.bearVariant && splitGenericPeltLabel) {
    steps.push({
      id: "split",
      title: t("leather.pelt.step.split.title"),
      duration: t("leather.pipeline.duration.instant"),
      summary: t("leather.pelt.step.split.summary"),
      stageAsset: hideProfile.rawAssetPath,
      inputs: [
        `${rawHideCount} ${t("leather.pelt.label.bear_with_head")}`,
        translateCount(t, "leather.term.knife", 1),
      ],
      outputs: [
        t(`leather.pelt.output.bear_head.${splitHeadCount === 1 ? "one" : "other"}`, {
          count: splitHeadCount,
        }),
        splitGenericPeltLabel,
      ],
      note: t("leather.pelt.step.split.note"),
    });
  }

  return steps;
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
