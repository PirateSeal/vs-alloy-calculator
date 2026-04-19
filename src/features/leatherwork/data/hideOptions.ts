import { getHideAssetPath } from "@/features/leatherwork/lib/leather";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
} from "@/features/leatherwork/types/leather";

export interface HideSizeOption {
  size: HideSize;
  assetPath: string;
  leatherYield: string;
  peltHint: string;
}

export interface AnimalOption {
  variant: AnimalVariant;
  assetPath: string;
  note: string;
}

export interface BearOption {
  variant: BearVariant;
  assetPath: string;
  leatherHint: string;
  peltHint: string;
}

export const HIDE_SIZE_OPTIONS: HideSizeOption[] = [
  { size: "small", assetPath: getHideAssetPath("raw", "small"), leatherYield: "1 leather", peltHint: "4 per fat" },
  { size: "medium", assetPath: getHideAssetPath("raw", "medium"), leatherYield: "2 leather", peltHint: "2 per fat" },
  { size: "large", assetPath: getHideAssetPath("raw", "large"), leatherYield: "3 leather", peltHint: "1 per fat" },
  { size: "huge", assetPath: getHideAssetPath("raw", "huge"), leatherYield: "5 leather", peltHint: "2 fat each" },
];

export const ANIMAL_OPTIONS: AnimalOption[] = [
  { variant: "generic", assetPath: getHideAssetPath("raw", "small"), note: "Standard small hide" },
  { variant: "fox", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
  { variant: "arctic-fox", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
  { variant: "raccoon", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
];

export const BEAR_OPTIONS: BearOption[] = [
  { variant: "sun", assetPath: getHideAssetPath("raw", "large"), leatherHint: "2 huge hides -> 10 leather", peltHint: "1 fat -> 1 medium pelt + head" },
  { variant: "panda", assetPath: getHideAssetPath("raw", "large"), leatherHint: "2 huge hides -> 10 leather", peltHint: "1 fat -> 1 large pelt + head" },
  { variant: "black", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "2 huge hides -> 10 leather", peltHint: "2 fat -> 2 large pelts + head" },
  { variant: "brown", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "3 huge hides -> 15 leather", peltHint: "2 fat -> 2 huge pelts + head" },
  { variant: "polar", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "3 huge hides -> 15 leather", peltHint: "2 fat -> 3 huge pelts + head" },
];
