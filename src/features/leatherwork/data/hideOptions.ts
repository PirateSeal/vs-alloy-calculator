import {
  BEAR_DATA,
  HIDE_DATA,
  getHideAssetPath,
} from "@/features/leatherwork/lib/leather";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
} from "@/features/leatherwork/types/leather";

export interface HideSizeOption {
  size: HideSize;
  assetPath: string;
  leatherYield: number;
  peltFatCost: number;
}

export interface AnimalOption {
  variant: AnimalVariant;
  assetPath: string;
  usesSmallHideWorkflow: boolean;
}

export interface BearOption {
  variant: BearVariant;
  assetPath: string;
}

export const HIDE_SIZE_OPTIONS: HideSizeOption[] = [
  {
    size: "small",
    assetPath: getHideAssetPath("raw", "small"),
    leatherYield: HIDE_DATA.small.leatherYield,
    peltFatCost: 0.25,
  },
  {
    size: "medium",
    assetPath: getHideAssetPath("raw", "medium"),
    leatherYield: HIDE_DATA.medium.leatherYield,
    peltFatCost: 0.5,
  },
  {
    size: "large",
    assetPath: getHideAssetPath("raw", "large"),
    leatherYield: HIDE_DATA.large.leatherYield,
    peltFatCost: 1,
  },
  {
    size: "huge",
    assetPath: getHideAssetPath("raw", "huge"),
    leatherYield: HIDE_DATA.huge.leatherYield,
    peltFatCost: 2,
  },
];

export const ANIMAL_OPTIONS: AnimalOption[] = [
  {
    variant: "generic",
    assetPath: getHideAssetPath("raw", "small"),
    usesSmallHideWorkflow: false,
  },
  {
    variant: "fox",
    assetPath: getHideAssetPath("raw", "small"),
    usesSmallHideWorkflow: true,
  },
  {
    variant: "arctic-fox",
    assetPath: getHideAssetPath("raw", "small"),
    usesSmallHideWorkflow: true,
  },
  {
    variant: "raccoon",
    assetPath: getHideAssetPath("raw", "small"),
    usesSmallHideWorkflow: true,
  },
];

export const BEAR_OPTIONS: BearOption[] = [
  {
    variant: "sun",
    assetPath: getHideAssetPath("raw", BEAR_DATA.sun.rawSize),
  },
  {
    variant: "panda",
    assetPath: getHideAssetPath("raw", BEAR_DATA.panda.rawSize),
  },
  {
    variant: "black",
    assetPath: getHideAssetPath("raw", BEAR_DATA.black.rawSize),
  },
  {
    variant: "brown",
    assetPath: getHideAssetPath("raw", BEAR_DATA.brown.rawSize),
  },
  {
    variant: "polar",
    assetPath: getHideAssetPath("raw", BEAR_DATA.polar.rawSize),
  },
];
