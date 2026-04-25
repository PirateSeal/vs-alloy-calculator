import type { BeehiveClass, PotteryCategory, PotteryCategoryMeta, PotteryRecipe } from "@/features/pottery/types/pottery";

const ASSET_BASE = "/pottery/items";

export const POTTERY_CATEGORIES: PotteryCategoryMeta[] = [
  { id: "cooking", label: "Cooking", color: "#e8a87c" },
  { id: "storage", label: "Storage", color: "#7ba7c2" },
  { id: "agriculture", label: "Agriculture", color: "#9ab87a" },
  { id: "building", label: "Building", color: "#c2a478" },
  { id: "utility", label: "Utility", color: "#efbd8d" },
  { id: "molds", label: "Molds", color: "#b5a89d" },
];

export const POTTERY_CATEGORY_ORDER = POTTERY_CATEGORIES.map((category) => category.id);

export const POTTERY_CATEGORY_BY_ID = POTTERY_CATEGORIES.reduce(
  (map, category) => {
    map[category.id] = category;
    return map;
  },
  {} as Record<PotteryCategory, PotteryCategoryMeta>,
);

const SMALL_BEEHIVE_CLASS: BeehiveClass = "small";
const FULL_BLOCK_BEEHIVE_CLASS: BeehiveClass = "full-block";

function recipe(recipe: Omit<PotteryRecipe, "imageSrc" | "clayPerItem">): PotteryRecipe {
  return {
    ...recipe,
    imageSrc: `${ASSET_BASE}/${recipe.id}.png`,
    clayPerItem: recipe.clayCost / recipe.outputCount,
  };
}

export const POTTERY_RECIPES: PotteryRecipe[] = [
  recipe({
    id: "bowl",
    name: "Bowl",
    category: "cooking",
    clayCost: 1,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 4, outputCount: 4 },
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "cooking-pot",
    name: "Cooking Pot",
    category: "cooking",
    clayCost: 4,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 24, outputCount: 4 },
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "crock",
    name: "Crock",
    category: "storage",
    clayCost: 2,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 14, outputCount: 4 },
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "storage-vessel",
    name: "Storage Vessel",
    category: "storage",
    clayCost: 35,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    pitKilnCapacity: 1,
    beehiveClass: "storage-vessel",
    firingNotes: ["pottery.firing.note.storage_vessel_extra_fuel"],
  }),
  recipe({
    id: "jug",
    name: "Jug",
    category: "storage",
    clayCost: 5,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "watering-can",
    name: "Watering Can",
    category: "agriculture",
    clayCost: 10,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    pitKilnCapacity: 1,
    beehiveClass: FULL_BLOCK_BEEHIVE_CLASS,
  }),
  recipe({
    id: "flowerpot",
    name: "Flowerpot",
    category: "agriculture",
    clayCost: 4,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 23, outputCount: 4 },
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "planter",
    name: "Planter",
    category: "agriculture",
    clayCost: 18,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    pitKilnCapacity: 1,
    beehiveClass: FULL_BLOCK_BEEHIVE_CLASS,
  }),
  recipe({
    id: "shingles",
    name: "Shingles",
    category: "building",
    clayCost: 4,
    outputCount: 12,
    clayType: "any",
    requiresFiring: true,
    minCraft: 12,
    pitKilnCapacity: 48,
    beehiveClass: "shingles",
  }),
  recipe({
    id: "crucible-clay",
    name: "Crucible",
    category: "utility",
    clayCost: 2,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 13, outputCount: 4 },
    pitKilnCapacity: 4,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({
    id: "clay-oven",
    name: "Clay Oven",
    category: "utility",
    clayCost: 69,
    outputCount: 1,
    clayType: "fire",
    requiresFiring: false,
  }),
  recipe({
    id: "mold-ingot",
    name: "Ingot Mold",
    category: "molds",
    clayCost: 2,
    outputCount: 1,
    clayType: "any",
    requiresFiring: true,
    batchRecipe: { clayCost: 5, outputCount: 2 },
    pitKilnCapacity: 2,
    beehiveClass: SMALL_BEEHIVE_CLASS,
  }),
  recipe({ id: "mold-axe", name: "Axe Mold", category: "molds", clayCost: 11, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-hammer", name: "Hammer Mold", category: "molds", clayCost: 12, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-pickaxe", name: "Pickaxe Mold", category: "molds", clayCost: 12, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-hoe", name: "Hoe Mold", category: "molds", clayCost: 12, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-shovel", name: "Shovel Mold", category: "molds", clayCost: 11, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-helve-hammer", name: "Helve Hammer Mold", category: "molds", clayCost: 6, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-falx", name: "Falx Blade Mold", category: "molds", clayCost: 12, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-prospecting-pick", name: "Prospecting Pick Mold", category: "molds", clayCost: 13, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-lamellae", name: "Lamellae Mold", category: "molds", clayCost: 11, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
  recipe({ id: "mold-anvil", name: "Anvil Mold", category: "molds", clayCost: 28, outputCount: 1, clayType: "any", requiresFiring: true, pitKilnCapacity: 1, beehiveClass: FULL_BLOCK_BEEHIVE_CLASS }),
];

export const POTTERY_RECIPE_BY_ID = new Map(POTTERY_RECIPES.map((recipeItem) => [recipeItem.id, recipeItem]));
