import type { Metal, AlloyRecipe } from "@/features/metallurgy/types/alloys";

export const METALS: Metal[] = [
  { id: "copper",  color: "#B87333", nuggetImage: "/metal-images/Nugget-nativecopper.png" },
  { id: "tin",     color: "#C0C0C0", nuggetImage: "/metal-images/Nugget-cassiterite.png" },
  { id: "zinc",    color: "#7F8C8D", nuggetImage: "/metal-images/Nugget-sphalerite.png" },
  { id: "bismuth", color: "#E8B4F0", nuggetImage: "/metal-images/Nugget-bismuthinite.png" },
  { id: "gold",    color: "#FFD700", nuggetImage: "/metal-images/Nugget_nativegold.png" },
  { id: "silver",  color: "#D8D8D8", nuggetImage: "/metal-images/Nugget-nativesilver.png" },
  { id: "lead",    color: "#5D6D7E", nuggetImage: "/metal-images/Nugget-galena.png" },
  { id: "nickel",  color: "#8C9A9E", nuggetImage: "/metal-images/Nugget-pentlandite.png" },
];

export const ALLOY_RECIPES: AlloyRecipe[] = [
  {
    id: "tin-bronze",
    components: [
      { metalId: "copper", minPercent: 88, maxPercent: 92 },
      { metalId: "tin", minPercent: 8, maxPercent: 12 },
    ],
    meltTempC: 950,
  },
  {
    id: "bismuth-bronze",
    components: [
      { metalId: "copper", minPercent: 50, maxPercent: 70 },
      { metalId: "zinc", minPercent: 20, maxPercent: 30 },
      { metalId: "bismuth", minPercent: 10, maxPercent: 20 },
    ],
    meltTempC: 850,
  },
  {
    id: "black-bronze",
    components: [
      { metalId: "copper", minPercent: 68, maxPercent: 84 },
      { metalId: "silver", minPercent: 8, maxPercent: 16 },
      { metalId: "gold", minPercent: 8, maxPercent: 16 },
    ],
    meltTempC: 1020,
  },
  {
    id: "brass",
    components: [
      { metalId: "copper", minPercent: 60, maxPercent: 70 },
      { metalId: "zinc", minPercent: 30, maxPercent: 40 },
    ],
    meltTempC: 920,
  },
  {
    id: "molybdochalkos",
    components: [
      { metalId: "copper", minPercent: 8, maxPercent: 12 },
      { metalId: "lead", minPercent: 88, maxPercent: 92 },
    ],
    meltTempC: 902,
  },
  {
    id: "lead-solder",
    components: [
      { metalId: "lead", minPercent: 45, maxPercent: 55 },
      { metalId: "tin", minPercent: 45, maxPercent: 55 },
    ],
    meltTempC: 327,
  },
  {
    id: "silver-solder",
    components: [
      { metalId: "silver", minPercent: 40, maxPercent: 50 },
      { metalId: "tin", minPercent: 50, maxPercent: 60 },
    ],
    meltTempC: 758,
  },
  {
    id: "cupronickel",
    components: [
      { metalId: "copper", minPercent: 65, maxPercent: 75 },
      { metalId: "nickel", minPercent: 25, maxPercent: 35 },
    ],
    meltTempC: 1171,
  },
  {
    id: "electrum",
    components: [
      { metalId: "gold", minPercent: 40, maxPercent: 60 },
      { metalId: "silver", minPercent: 40, maxPercent: 60 },
    ],
    meltTempC: 1010,
  },
];
