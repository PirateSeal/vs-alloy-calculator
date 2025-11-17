import type { Metal, AlloyRecipe } from "../types/alloys";

export const METALS: Metal[] = [
  {
    id: "copper",
    label: "Copper",
    shortLabel: "Cu",
    color: "#B87333",
  },
  {
    id: "tin",
    label: "Tin",
    shortLabel: "Sn",
    color: "#C0C0C0",
  },
  {
    id: "zinc",
    label: "Zinc",
    shortLabel: "Zn",
    color: "#7F8C8D",
  },
  {
    id: "bismuth",
    label: "Bismuth",
    shortLabel: "Bi",
    color: "#E8B4F0",
  },
  {
    id: "gold",
    label: "Gold",
    shortLabel: "Au",
    color: "#FFD700",
  },
  {
    id: "silver",
    label: "Silver",
    shortLabel: "Ag",
    color: "#C0C0C0",
  },
  {
    id: "lead",
    label: "Lead",
    shortLabel: "Pb",
    color: "#5D6D7E",
  },
  {
    id: "nickel",
    label: "Nickel",
    shortLabel: "Ni",
    color: "#8C9A9E",
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
  },
  {
    id: "brass",
    name: "Brass",
    components: [
      { metalId: "copper", minPercent: 60, maxPercent: 70 },
      { metalId: "zinc", minPercent: 30, maxPercent: 40 },
    ],
    meltTempC: 920,
  },
  {
    id: "molybdochalkos",
    name: "Molybdochalkos",
    components: [
      { metalId: "copper", minPercent: 8, maxPercent: 12 },
      { metalId: "lead", minPercent: 88, maxPercent: 92 },
    ],
    meltTempC: 902,
  },
  {
    id: "lead-solder",
    name: "Lead Solder",
    components: [
      { metalId: "lead", minPercent: 45, maxPercent: 55 },
      { metalId: "tin", minPercent: 45, maxPercent: 55 },
    ],
    meltTempC: 327,
  },
  {
    id: "silver-solder",
    name: "Silver Solder",
    components: [
      { metalId: "silver", minPercent: 40, maxPercent: 50 },
      { metalId: "tin", minPercent: 50, maxPercent: 60 },
    ],
    meltTempC: 758,
  },
  {
    id: "cupronickel",
    name: "Cupronickel",
    components: [
      { metalId: "copper", minPercent: 65, maxPercent: 75 },
      { metalId: "nickel", minPercent: 25, maxPercent: 35 },
    ],
    meltTempC: 1171,
  },
  {
    id: "electrum",
    name: "Electrum",
    components: [
      { metalId: "gold", minPercent: 40, maxPercent: 60 },
      { metalId: "silver", minPercent: 40, maxPercent: 60 },
    ],
    meltTempC: 1010,
  },
];
