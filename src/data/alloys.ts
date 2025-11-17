import type { Metal, AlloyRecipe } from "../types/alloys";

export const METALS: Metal[] = [
  {
    id: "copper",
    label: "Copper",
    shortLabel: "Cu",
    color: "#B87333",
    nuggetImage: "/metal-images/Nugget-nativecopper.png",
  },
  {
    id: "tin",
    label: "Tin",
    shortLabel: "Sn",
    color: "#C0C0C0",
    nuggetImage: "/metal-images/Nugget-cassiterite.png",
  },
  {
    id: "zinc",
    label: "Zinc",
    shortLabel: "Zn",
    color: "#7F8C8D",
    nuggetImage: "/metal-images/Nugget-sphalerite.png",
  },
  {
    id: "bismuth",
    label: "Bismuth",
    shortLabel: "Bi",
    color: "#E8B4F0",
    nuggetImage: "/metal-images/Nugget-bismuthinite.png",
  },
  {
    id: "gold",
    label: "Gold",
    shortLabel: "Au",
    color: "#FFD700",
    nuggetImage: "/metal-images/Nugget_nativegold.png",
  },
  {
    id: "silver",
    label: "Silver",
    shortLabel: "Ag",
    color: "#C0C0C0",
    nuggetImage: "/metal-images/Nugget-nativesilver.png",
  },
  {
    id: "lead",
    label: "Lead",
    shortLabel: "Pb",
    color: "#5D6D7E",
    nuggetImage: "/metal-images/Nugget-galena.png",
  },
  {
    id: "nickel",
    label: "Nickel",
    shortLabel: "Ni",
    color: "#8C9A9E",
    nuggetImage: "/metal-images/Nugget-pentlandite.png",
  },
];

export const ALLOY_RECIPES: AlloyRecipe[] = [
  {
    id: "tin-bronze",
    name: "Tin Bronze",
    components: [
      { metalId: "copper", minPercent: 88, maxPercent: 92 },
      { metalId: "tin", minPercent: 8, maxPercent: 12 },
    ],
    meltTempC: 950,
    notes: "Common tools & weapons",
  },
  {
    id: "bismuth-bronze",
    name: "Bismuth Bronze",
    components: [
      { metalId: "copper", minPercent: 50, maxPercent: 70 },
      { metalId: "zinc", minPercent: 20, maxPercent: 30 },
      { metalId: "bismuth", minPercent: 10, maxPercent: 20 },
    ],
    meltTempC: 850,
    notes: "Cheaper tin alternative",
  },
  {
    id: "black-bronze",
    name: "Black Bronze",
    components: [
      { metalId: "copper", minPercent: 68, maxPercent: 84 },
      { metalId: "silver", minPercent: 8, maxPercent: 16 },
      { metalId: "gold", minPercent: 8, maxPercent: 16 },
    ],
    meltTempC: 1020,
    notes: "High-tier bronze",
  },
  {
    id: "brass",
    name: "Brass",
    components: [
      { metalId: "copper", minPercent: 60, maxPercent: 70 },
      { metalId: "zinc", minPercent: 30, maxPercent: 40 },
    ],
    meltTempC: 920,
    notes: "Decorative & lanterns",
  },
  {
    id: "molybdochalkos",
    name: "Molybdochalkos",
    components: [
      { metalId: "copper", minPercent: 8, maxPercent: 12 },
      { metalId: "lead", minPercent: 88, maxPercent: 92 },
    ],
    meltTempC: 902,
    notes: "Anvil crafting",
  },
  {
    id: "lead-solder",
    name: "Lead Solder",
    components: [
      { metalId: "lead", minPercent: 45, maxPercent: 55 },
      { metalId: "tin", minPercent: 45, maxPercent: 55 },
    ],
    meltTempC: 327,
    notes: "Soldering components",
  },
  {
    id: "silver-solder",
    name: "Silver Solder",
    components: [
      { metalId: "silver", minPercent: 40, maxPercent: 50 },
      { metalId: "tin", minPercent: 50, maxPercent: 60 },
    ],
    meltTempC: 758,
    notes: "Advanced soldering",
  },
  {
    id: "cupronickel",
    name: "Cupronickel",
    components: [
      { metalId: "copper", minPercent: 65, maxPercent: 75 },
      { metalId: "nickel", minPercent: 25, maxPercent: 35 },
    ],
    meltTempC: 1171,
    notes: "Decorative metal",
  },
  {
    id: "electrum",
    name: "Electrum",
    components: [
      { metalId: "gold", minPercent: 40, maxPercent: 60 },
      { metalId: "silver", minPercent: 40, maxPercent: 60 },
    ],
    meltTempC: 1010,
    notes: "Decorative metal",
  },
];
