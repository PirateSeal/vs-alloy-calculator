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

function formatLiters(liters: number): string {
  return `${liters} L`;
}

function formatBuckets(liters: number): string {
  return `${Math.ceil(liters / BUCKET_LITERS)} ${Math.ceil(liters / BUCKET_LITERS) === 1 ? "bucket" : "buckets"}`;
}

function formatBarrels(count: number): string {
  return `${count} ${count === 1 ? "barrel" : "barrels"}`;
}

function formatBatches(count: number): string {
  return `${count} ${count === 1 ? "batch" : "batches"}`;
}

function formatUnits(count: number, singular: string, plural: string = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function titleCase(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getHideAssetPath(stage: "raw" | "soaked" | "scraped" | "prepared", size: HideSize): string {
  return `/leather/hides/${stage}/${size}.png`;
}

function getMaterialAssetPath(
  material:
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
    | "knife-copper",
): string {
  if (material === "barrel" || material === "knife-copper") {
    return `/leather/tools/${material}.png`;
  }

  return `/leather/materials/${material}.png`;
}

function getSizeLabel(size: HideSize): string {
  return size;
}

function getAnimalLabel(animalVariant: AnimalVariant): string {
  switch (animalVariant) {
    case "fox":
      return "fox";
    case "arctic-fox":
      return "arctic fox";
    case "raccoon":
      return "raccoon";
    default:
      return "generic";
  }
}

function getBearLabel(bearVariant: BearVariant): string {
  switch (bearVariant) {
    case "sun":
      return "sun bear";
    case "panda":
      return "panda bear";
    case "black":
      return "black bear";
    case "brown":
      return "brown bear";
    case "polar":
      return "polar bear";
  }
}

function buildHideDescriptor(
  count: number,
  size: HideSize,
  noun: string,
  animalVariant: AnimalVariant,
  bearVariant: BearVariant | null,
): string {
  if (bearVariant) {
    return `${count} ${getBearLabel(bearVariant)} ${count === 1 ? noun : `${noun}s`}`;
  }

  if (size === "small" && animalVariant !== "generic") {
    return `${count} ${getAnimalLabel(animalVariant)} ${count === 1 ? noun : `${noun}s`}`;
  }

  return `${count} ${getSizeLabel(size)} ${count === 1 ? noun : `${noun}s`}`;
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

function getPeltFatRequired(size: HideSize, hideCount: number, bearVariant: BearVariant | null): number {
  if (bearVariant) {
    return hideCount * BEAR_DATA[bearVariant].peltFatCost;
  }

  switch (size) {
    case "small":
      return Math.ceil(hideCount / 4);
    case "medium":
      return Math.ceil(hideCount / 2);
    case "large":
      return hideCount;
    case "huge":
      return hideCount * 2;
  }
}

export function getSelectedHideProfile({
  size,
  animalVariant = "generic",
  bearVariant = null,
  rawHideCount = 1,
}: {
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
      rawHideLabel: titleCase(getBearLabel(bearVariant)),
      rawHideSubtitle: `Raw ${rawSize} hide -> ${bearData.scrapedHugeHides} huge scraped hides each`,
      rawAssetPath: getHideAssetPath("raw", rawSize),
      soakingLitersPerRawHide: HIDE_DATA[rawSize].litersPerHide,
      soakingBarrelCapacity: HIDE_DATA[rawSize].maxPerBarrel,
      scrapedHideCountPerRawHide: bearData.scrapedHugeHides,
      scrapedHideSize: "huge",
      scrapedHideLabel: "Huge scraped hides",
      scrapedAssetPath: getHideAssetPath("scraped", "huge"),
      preparedAssetPath: getHideAssetPath("prepared", "huge"),
      leatherAssetPath: getMaterialAssetPath("leather"),
      leatherYieldPerRawHide: bearData.scrapedHugeHides * HIDE_DATA.huge.leatherYield,
    };
  }

  const label = size === "small" && animalVariant !== "generic"
    ? `${titleCase(getAnimalLabel(animalVariant))} hides`
    : `${titleCase(getSizeLabel(size))} hides`;

  const subtitle = size === "small" && animalVariant !== "generic"
    ? `${titleCase(getAnimalLabel(animalVariant))} uses the small-hide workflow`
    : `${titleCase(getSizeLabel(size))} hide workflow`;

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
    scrapedHideLabel: `${titleCase(size)} scraped hides`,
    scrapedAssetPath: getHideAssetPath("scraped", size),
    preparedAssetPath: getHideAssetPath("prepared", size),
    leatherAssetPath: getMaterialAssetPath("leather"),
    leatherYieldPerRawHide: HIDE_DATA[size].leatherYield,
  };
}

function buildLeatherSummaryMetrics({
  rawHideCount,
  actualLeather,
  totalWater,
  totalLogs,
  solvent,
  solventAmount,
  peakHideBarrels,
}: {
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
      label: "Actual output",
      value: formatUnits(actualLeather, "leather"),
      hint: `${formatUnits(rawHideCount, "raw hide")} in`,
      assetPath: getMaterialAssetPath("leather"),
    },
    {
      id: "barrels",
      label: "Peak hide barrels",
      value: String(peakHideBarrels),
      hint: "Soak, prepare, or complete at once",
      assetPath: getMaterialAssetPath("barrel"),
    },
    {
      id: "water",
      label: "Total water",
      value: formatLiters(totalWater),
      hint: formatBuckets(totalWater),
      assetPath: getMaterialAssetPath("weak-tannin"),
    },
    {
      id: "solvent",
      label: solvent === "lime" ? "Lime" : "Powdered borax",
      value: String(solventAmount),
      hint: solvent === "lime" ? "1 lime per soaking liter" : `${Math.ceil(solventAmount / 2)} borax chunks`,
      assetPath: solvent === "lime" ? getMaterialAssetPath("lime") : getMaterialAssetPath("borax-powder"),
    },
    {
      id: "logs",
      label: "Oak or acacia logs",
      value: String(totalLogs),
      hint: "Weak + strong tannin combined",
      assetPath: getMaterialAssetPath("oak-log"),
    },
  ];
}

function buildLeatherShoppingList({
  rawHideCount,
  totalWater,
  solvent,
  limeRequired,
  powderedBoraxRequired,
  totalLogs,
  hideProfile,
}: {
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
      label: "Raw hides",
      amount: String(rawHideCount),
      hint: hideProfile.rawHideSubtitle,
      assetPath: hideProfile.rawAssetPath,
    },
    {
      id: "water",
      label: "Water (total)",
      amount: formatLiters(totalWater),
      hint: formatBuckets(totalWater),
      assetPath: getMaterialAssetPath("weak-tannin"),
    },
    solvent === "lime"
      ? {
          id: "lime",
          label: "Lime",
          amount: String(limeRequired),
          hint: `${formatLiters(limeRequired)} soaking liquid`,
          assetPath: getMaterialAssetPath("lime"),
        }
      : {
          id: "powdered-borax",
          label: "Powdered borax",
          amount: String(powderedBoraxRequired),
          hint: `${Math.ceil(powderedBoraxRequired / 2)} borax chunks for diluted borax`,
          assetPath: getMaterialAssetPath("borax-powder"),
        },
    {
      id: "logs",
      label: "Oak or acacia logs",
      amount: String(totalLogs),
      hint: "Any mix of oak and acacia works",
      assetPath: getMaterialAssetPath("oak-log"),
    },
  ];
}

function buildLeatherPipeline({
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
  const rawDescriptor = buildHideDescriptor(
    rawHideCount,
    hideProfile.rawSize,
    "hide",
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const soakedDescriptor = buildHideDescriptor(
    rawHideCount,
    hideProfile.rawSize,
    "soaked hide",
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const scrapedDescriptor = `${scrapedHideCount} scraped ${hideProfile.scrapedHideSize} ${scrapedHideCount === 1 ? "hide" : "hides"}`;
  const preparedDescriptor = `${scrapedHideCount} prepared ${hideProfile.scrapedHideSize} ${scrapedHideCount === 1 ? "hide" : "hides"}`;

  return [
    {
      id: "make-weak-tannin",
      title: "Make weak tannin",
      duration: "1 day",
      summary: `${formatBarrels(weakTanninBarrelsPerRound)} per round · ${formatBatches(weakTanninBarrelsPerRound * 2)} total`,
      barrels: weakTanninBarrelsPerRound,
      batches: weakTanninBarrelsPerRound * 2,
      stageAsset: getMaterialAssetPath("weak-tannin"),
      inputs: [
        `${tanninLogsForWeak} oak or acacia logs`,
        `${formatLiters(weakTanninWater)} water`,
      ],
      outputs: [
        `${formatLiters(weakTanninBarrelsPerRound * TANNIN_BATCH_LITERS * 2)} weak tannin for preparing`,
        `${formatLiters(tanninLitersPerStage)} weak tannin saved for strong conversion`,
      ],
      note: "Start tannin before soaking, or while hides are still in the first barrel step.",
    },
    {
      id: "soak",
      title: "Soak hides",
      duration: "20 hours",
      summary: formatBarrels(soakingBarrels),
      barrels: soakingBarrels,
      stageAsset: getHideAssetPath("soaked", hideProfile.rawSize),
      inputs: [
        rawDescriptor,
        `${formatLiters(soakingLiters)} water`,
        solvent === "lime" ? `${limeRequired} lime` : `${powderedBoraxRequired} powdered borax`,
      ],
      outputs: [soakedDescriptor],
      note: "This step uses the raw hide size. Bears only turn into huge hides after scraping.",
    },
    {
      id: "scrape",
      title: "Scrape",
      duration: "Instant",
      summary: "Knife + crafting grid",
      stageAsset: hideProfile.scrapedAssetPath,
      inputs: [soakedDescriptor, "1 knife"],
      outputs: [scrapedDescriptor],
      note: hideProfile.bearVariant
        ? `Each ${getBearLabel(hideProfile.bearVariant)} hide scrapes into ${hideProfile.scrapedHideCountPerRawHide} huge hides.`
        : hideProfile.rawSize === "small" && hideProfile.animalVariant !== "generic"
          ? `${titleCase(getAnimalLabel(hideProfile.animalVariant))} uses the standard small-hide scrape result.`
          : undefined,
    },
    {
      id: "prepare",
      title: "Prepare hides",
      duration: "3 days",
      summary: formatBarrels(preparingBarrels),
      barrels: preparingBarrels,
      stageAsset: hideProfile.preparedAssetPath,
      inputs: [scrapedDescriptor, `${formatLiters(tanninLitersPerStage)} weak tannin`],
      outputs: [preparedDescriptor],
      note: "This is the handoff point where the reserved weak tannin should be converted to strong tannin.",
    },
    {
      id: "make-strong-tannin",
      title: "Make strong tannin",
      duration: "1 day",
      summary: `${formatBarrels(strongTanninBarrels)} · ${formatBatches(strongTanninBarrels)}`,
      barrels: strongTanninBarrels,
      batches: strongTanninBarrels,
      stageAsset: getMaterialAssetPath("strong-tannin"),
      inputs: [
        `${tanninLogsForStrong} oak or acacia logs`,
        `${formatLiters(tanninLitersPerStage)} weak tannin`,
      ],
      outputs: [`${formatLiters(tanninLitersPerStage)} strong tannin`],
    },
    {
      id: "complete",
      title: "Complete leather",
      duration: "4.5 days",
      summary: formatBarrels(completingBarrels),
      barrels: completingBarrels,
      stageAsset: getMaterialAssetPath("leather"),
      inputs: [preparedDescriptor, `${formatLiters(tanninLitersPerStage)} strong tannin`],
      outputs: [`${formatUnits(actualLeather, "leather")}`],
    },
  ];
}

export function calculateLeatherPlan({
  hideCount,
  mode,
  size,
  solvent,
  targetLeather = null,
  animalVariant = "generic",
  bearVariant = null,
}: {
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
      rawHideCount,
      actualLeather,
      totalWater,
      totalLogs,
      solvent,
      solventAmount: solvent === "lime" ? soakingLiters : powderedBoraxRequired,
      peakHideBarrels: Math.max(soakingBarrels, preparingBarrels),
    }),
    shoppingList: buildLeatherShoppingList({
      rawHideCount,
      totalWater,
      solvent,
      limeRequired: soakingLiters,
      powderedBoraxRequired,
      totalLogs,
      hideProfile,
    }),
    pipeline: buildLeatherPipeline({
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
  fatRequired,
  curedPeltCount,
  curedPeltLabel,
  splitGenericPeltCount,
  splitGenericPeltLabel,
}: {
  fatRequired: number;
  curedPeltCount: number;
  curedPeltLabel: string;
  splitGenericPeltCount: number;
  splitGenericPeltLabel: string | null;
}): SummaryMetric[] {
  const metrics: SummaryMetric[] = [
    {
      id: "pelts",
      label: "Cured output",
      value: `${curedPeltCount} ${curedPeltLabel}`,
      hint: "After 48 hours of curing",
      assetPath: getMaterialAssetPath("leather"),
    },
    {
      id: "fat",
      label: "Fat required",
      value: formatUnits(fatRequired, "fat lump"),
      hint: "Applied in the crafting grid",
    },
    {
      id: "time",
      label: "Cure time",
      value: "48 hours",
      hint: "Storage location does not matter",
      assetPath: getMaterialAssetPath("barrel"),
    },
  ];

  if (splitGenericPeltCount > 0 && splitGenericPeltLabel) {
    metrics.push({
      id: "split",
      label: "If split after curing",
      value: `${splitGenericPeltCount} ${splitGenericPeltLabel}`,
      hint: "Plus one bear head per raw hide",
      assetPath: getHideAssetPath("raw", "huge"),
    });
  }

  return metrics;
}

function buildPeltShoppingList({
  hideProfile,
  rawHideCount,
  fatRequired,
}: {
  hideProfile: HideProfile;
  rawHideCount: number;
  fatRequired: number;
}): ShoppingListItem[] {
  const items: ShoppingListItem[] = [
    {
      id: "raw-hides",
      label: "Raw hides",
      amount: String(rawHideCount),
      hint: hideProfile.rawHideSubtitle,
      assetPath: hideProfile.rawAssetPath,
    },
    {
      id: "fat",
      label: "Fat",
      amount: String(fatRequired),
      hint: "Used to oil the hides before curing",
    },
  ];

  if (hideProfile.bearVariant) {
    items.push({
      id: "knife",
      label: "Knife",
      amount: "1",
      hint: "Only needed if you want to split the cured bear pelt",
      assetPath: getMaterialAssetPath("knife-copper"),
    });
  }

  return items;
}

function buildPeltPipeline({
  hideProfile,
  rawHideCount,
  fatRequired,
  curedPeltLabel,
  splitGenericPeltCount,
  splitGenericPeltLabel,
  splitHeadCount,
}: {
  hideProfile: HideProfile;
  rawHideCount: number;
  fatRequired: number;
  curedPeltLabel: string;
  splitGenericPeltCount: number;
  splitGenericPeltLabel: string | null;
  splitHeadCount: number;
}): PipelineStep[] {
  const rawDescriptor = buildHideDescriptor(
    rawHideCount,
    hideProfile.rawSize,
    "hide",
    hideProfile.animalVariant,
    hideProfile.bearVariant,
  );
  const oiledDescriptor = hideProfile.bearVariant
    ? `${rawHideCount} oiled ${getBearLabel(hideProfile.bearVariant)} hides`
    : `${rawHideCount} oiled ${hideProfile.rawSize} hides`;
  const steps: PipelineStep[] = [
    {
      id: "oil",
      title: "Oil hides",
      duration: "Instant",
      summary: "Crafting grid",
      stageAsset: hideProfile.rawAssetPath,
      inputs: [rawDescriptor, formatUnits(fatRequired, "fat lump")],
      outputs: [oiledDescriptor],
      note: hideProfile.bearVariant
        ? "Bear hides take 1 or 2 fat each depending on species."
        : "Small hides oil in groups of four, medium in groups of two, large individually.",
    },
    {
      id: "cure",
      title: "Cure pelts",
      duration: "48 hours",
      summary: "No barrel required",
      stageAsset: hideProfile.rawAssetPath,
      inputs: [oiledDescriptor],
      outputs: [`${rawHideCount} ${curedPeltLabel}`],
      note: "Curing time is fixed. Storage location does not affect the result.",
    },
  ];

  if (hideProfile.bearVariant && splitGenericPeltLabel) {
    steps.push({
      id: "split",
      title: "Split bear pelts",
      duration: "Instant",
      summary: "Optional knife step",
      stageAsset: hideProfile.rawAssetPath,
      inputs: [`${rawHideCount} bear pelts with head`, "1 knife"],
      outputs: [
        `${splitHeadCount} bear ${splitHeadCount === 1 ? "head" : "heads"}`,
        `${splitGenericPeltCount} ${splitGenericPeltLabel}`,
      ],
      note: "Bear armor recipes use the head separately from the body pelt.",
    });
  }

  return steps;
}

export function calculatePeltPlan({
  hideCount,
  size,
  animalVariant = "generic",
  bearVariant = null,
}: {
  hideCount: number;
  size: HideSize;
  animalVariant?: AnimalVariant;
  bearVariant?: BearVariant | null;
}): PeltCalculation {
  const hideProfile = getSelectedHideProfile({
    size,
    animalVariant,
    bearVariant,
    rawHideCount: hideCount,
  });
  const fatRequired = getPeltFatRequired(hideProfile.rawSize, hideCount, bearVariant);
  const splitGenericPeltCount = bearVariant ? hideCount * BEAR_DATA[bearVariant].splitPeltCount : 0;
  const splitGenericPeltSize = bearVariant ? BEAR_DATA[bearVariant].splitPeltSize : null;
  const splitGenericPeltLabel = splitGenericPeltSize
    ? `${splitGenericPeltCount} ${splitGenericPeltSize} ${splitGenericPeltCount === 1 ? "pelt" : "pelts"}`
    : null;

  return {
    workflow: "pelt",
    hideProfile,
    rawHideCount: hideCount,
    fatRequired,
    curingDuration: "48 hours",
    curedPeltCount: hideCount,
    curedPeltLabel: bearVariant ? "bear pelts with head" : `${hideProfile.rawSize} pelts`,
    curedPeltAssetPath: hideProfile.rawAssetPath,
    splitGenericPeltCount,
    splitGenericPeltSize,
    splitGenericPeltLabel,
    splitHeadCount: bearVariant ? hideCount : 0,
    summaryMetrics: buildPeltSummaryMetrics({
      fatRequired,
      curedPeltCount: hideCount,
      curedPeltLabel: bearVariant ? "bear pelts with head" : `${hideProfile.rawSize} pelts`,
      splitGenericPeltCount,
      splitGenericPeltLabel,
    }),
    shoppingList: buildPeltShoppingList({
      hideProfile,
      rawHideCount: hideCount,
      fatRequired,
    }),
    pipeline: buildPeltPipeline({
      hideProfile,
      rawHideCount: hideCount,
      fatRequired,
      curedPeltLabel: bearVariant ? "bear pelts with head" : `${hideProfile.rawSize} pelts`,
      splitGenericPeltCount,
      splitGenericPeltLabel,
      splitHeadCount: bearVariant ? hideCount : 0,
    }),
  };
}
