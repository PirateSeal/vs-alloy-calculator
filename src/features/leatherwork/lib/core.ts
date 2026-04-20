import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  HideSizeData,
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

const PELT_FAT_PER_HIDE: Record<HideSize, number> = {
  small: 0.25,
  medium: 0.5,
  large: 1,
  huge: 2,
};

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function translateCount(
  t: TranslateFn,
  baseKey: string,
  count: number,
  vars?: Record<string, string | number>,
): string {
  return t(`${baseKey}.${count === 1 ? "one" : "other"}`, { count, ...vars });
}

export function formatLiters(liters: number): string {
  return `${liters} L`;
}

export function formatBuckets(t: TranslateFn, liters: number): string {
  return translateCount(t, "leather.count.bucket", Math.ceil(liters / BUCKET_LITERS));
}

export function formatBarrels(t: TranslateFn, count: number): string {
  return translateCount(t, "leather.count.barrel", count);
}

export function formatBatches(t: TranslateFn, count: number): string {
  return translateCount(t, "leather.count.batch", count);
}

export function formatUnits(t: TranslateFn, count: number, baseKey: string): string {
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

export function getSizeLabel(t: TranslateFn, size: HideSize): string {
  return t(`leather.hide_size.${size}`);
}

export function getAnimalLabel(t: TranslateFn, animalVariant: AnimalVariant): string {
  return t(`leather.animal.${animalVariant}`);
}

export function getBearLabel(t: TranslateFn, bearVariant: BearVariant): string {
  return t(`leather.bear.${bearVariant}`);
}

export function buildStageHideDescriptor(
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

export function getPeltFatRequired(
  size: HideSize,
  hideCount: number,
  bearVariant: BearVariant | null,
): number {
  if (bearVariant) {
    return hideCount * BEAR_DATA[bearVariant].peltFatCost;
  }

  return Math.ceil(hideCount * PELT_FAT_PER_HIDE[size]);
}
