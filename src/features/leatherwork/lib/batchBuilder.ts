import type {
  HideProfile,
  LeatherPipelineStep,
  PipelineStep,
  ShoppingListItem,
  Solvent,
  SummaryMetric,
} from "@/features/leatherwork/types/leather";
import {
  TANNIN_BATCH_LITERS,
  type TranslateFn,
  buildStageHideDescriptor,
  formatBarrels,
  formatBatches,
  formatBuckets,
  formatLiters,
  formatUnits,
  getAnimalLabel,
  getBearLabel,
  getHideAssetPath,
  getMaterialAssetPath,
  getSizeLabel,
  translateCount,
} from "./core";

export function buildLeatherSummaryMetrics({
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
      assetPath: solvent === "lime"
        ? getMaterialAssetPath("lime")
        : getMaterialAssetPath("borax-powder"),
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

export function buildLeatherShoppingList({
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

export function buildLeatherPipeline({
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
}): LeatherPipelineStep[] {
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
      inputs: [
        scrapedDescriptor,
        t("leather.pipeline.input.weak_tannin", { liters: formatLiters(tanninLitersPerStage) }),
      ],
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
      outputs: [
        t("leather.pipeline.output.strong_tannin", {
          liters: formatLiters(tanninLitersPerStage),
        }),
      ],
    },
    {
      id: "complete",
      title: t("leather.pipeline.step.complete.title"),
      duration: t("leather.pipeline.duration.four_half_days"),
      summary: formatBarrels(t, completingBarrels),
      barrels: completingBarrels,
      stageAsset: getMaterialAssetPath("leather"),
      inputs: [
        preparedDescriptor,
        t("leather.pipeline.input.strong_tannin", { liters: formatLiters(tanninLitersPerStage) }),
      ],
      outputs: [formatUnits(t, actualLeather, "leather.term.leather")],
    },
  ];
}

export function buildPeltSummaryMetrics({
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

export function buildPeltShoppingList({
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

export function buildPeltPipeline({
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
