import type {
  AnimalVariant,
  BearVariant,
  HideProfile,
  HideSize,
} from "@/features/leatherwork/types/leather";
import {
  BEAR_DATA,
  HIDE_DATA,
  type TranslateFn,
  getAnimalLabel,
  getBearLabel,
  getHideAssetPath,
  getMaterialAssetPath,
  getSizeLabel,
} from "./core";

interface GetSelectedHideProfileOptions {
  t: TranslateFn;
  size: HideSize;
  animalVariant?: AnimalVariant;
  bearVariant?: BearVariant | null;
  rawHideCount?: number;
}

export function getSelectedHideProfile({
  t,
  size,
  animalVariant = "generic",
  bearVariant = null,
  rawHideCount = 1,
}: GetSelectedHideProfileOptions): HideProfile {
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
