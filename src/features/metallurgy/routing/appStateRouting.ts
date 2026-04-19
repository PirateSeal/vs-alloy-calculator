import { ALLOY_RECIPES, METALS } from "@/features/metallurgy/data/alloys";
import { createEmptyCrucible } from "@/features/metallurgy/lib/alloyLogic";
import { METALLURGY_VIEW_PATHS } from "@/features/metallurgy/routing/routes";
import type { AlloyRecipe, MetalId } from "@/features/metallurgy/types/alloys";
import type { CrucibleState } from "@/features/metallurgy/types/crucible";
import type {
  InventoryState,
  MetallurgyView,
  PlannerState,
  ScarcityMode,
} from "@/features/metallurgy/types/planner";
import { getLocaleFromPath, stripLocalePrefix } from "@/i18n";

const VALID_METAL_IDS = new Set<string>(METALS.map((metal) => metal.id));
const VALID_RECIPE_IDS = new Set<string>(ALLOY_RECIPES.map((recipe) => recipe.id));

export const VIEW_PATHS = METALLURGY_VIEW_PATHS;

const DEFAULT_SCARCITY_MODE: ScarcityMode = "balanced";

function createEmptyInventory(): InventoryState {
  return METALS.reduce((inventory, metal) => {
    inventory[metal.id] = 0;
    return inventory;
  }, {} as InventoryState);
}

export function createDefaultPlannerState(): PlannerState {
  return {
    scarcityMode: DEFAULT_SCARCITY_MODE,
    recipeId: null,
    targetIngots: 1,
    inventory: createEmptyInventory(),
  };
}

function normalizeViewPath(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return "/";
  }

  return stripped.endsWith("/") ? stripped : `${stripped}/`;
}

export function getMetallurgyViewFromPath(pathname: string): MetallurgyView {
  const normalized = normalizeViewPath(pathname);

  if (normalized === VIEW_PATHS.planner) {
    return "planner";
  }

  if (normalized === VIEW_PATHS.reference) {
    return "reference";
  }

  if (normalized === VIEW_PATHS.about) {
    return "about";
  }

  return "calculator";
}

export function getPathnameForMetallurgyView(pathname: string, view: MetallurgyView): string {
  const locale = getLocaleFromPath(pathname);

  if (!locale) {
    return VIEW_PATHS[view];
  }

  return VIEW_PATHS[view] === "/" ? `/${locale}/` : `/${locale}${VIEW_PATHS[view]}`;
}

export function parseCalculatorStateFromSearch(search: string): { crucible: CrucibleState; recipe: AlloyRecipe | null } {
  const params = new URLSearchParams(search);
  const base = createEmptyCrucible();
  let hasAny = false;

  for (let i = 0; i < 4; i++) {
    const param = params.get(`s${i}`);
    if (!param) continue;
    const [metalId, nuggetsStr] = param.split(":");
    const nuggets = parseInt(nuggetsStr, 10);
    if (VALID_METAL_IDS.has(metalId) && !Number.isNaN(nuggets) && nuggets >= 0 && nuggets <= 128) {
      base.slots[i] = { id: i, metalId: metalId as MetalId, nuggets };
      hasAny = true;
    }
  }

  const recipeId = params.get("r");
  const recipe =
    recipeId && VALID_RECIPE_IDS.has(recipeId)
      ? ALLOY_RECIPES.find((candidate) => candidate.id === recipeId) ?? null
      : null;

  return { crucible: hasAny ? base : createEmptyCrucible(), recipe };
}

export function parseCalculatorUrlStateFromSearch(search: string): {
  crucible: CrucibleState;
  selectedRecipeId: AlloyRecipe["id"] | null;
} {
  const parsed = parseCalculatorStateFromSearch(search);
  return {
    crucible: parsed.crucible,
    selectedRecipeId: parsed.recipe?.id ?? null,
  };
}

export function buildCalculatorSearch(crucible: CrucibleState, selectedRecipe: AlloyRecipe | null): string {
  const params = new URLSearchParams();

  for (const slot of crucible.slots) {
    if (slot.metalId && slot.nuggets > 0) {
      params.set(`s${slot.id}`, `${slot.metalId}:${slot.nuggets}`);
    }
  }

  if (selectedRecipe) {
    params.set("r", selectedRecipe.id);
  }

  return params.toString();
}

export function buildCalculatorSearchFromState(
  crucible: CrucibleState,
  selectedRecipeId: AlloyRecipe["id"] | null,
): string {
  const recipe = selectedRecipeId
    ? ALLOY_RECIPES.find((candidate) => candidate.id === selectedRecipeId) ?? null
    : null;
  return buildCalculatorSearch(crucible, recipe);
}

function isScarcityMode(value: string | null): value is ScarcityMode {
  return value === "balanced" || value === "economical" || value === "preserve-copper" || value === "max-output";
}

export function parsePlannerStateFromSearch(search: string): PlannerState {
  const defaults = createDefaultPlannerState();
  const params = new URLSearchParams(search);

  const parsedInventory = createEmptyInventory();
  for (const metal of METALS) {
    const value = params.get(`inv_${metal.id}`);
    const nuggets = value ? parseInt(value, 10) : 0;
    parsedInventory[metal.id] = Number.isNaN(nuggets) || nuggets < 0 ? 0 : nuggets;
  }

  const recipeId = params.get("recipe");
  const validRecipeId = recipeId && VALID_RECIPE_IDS.has(recipeId) ? recipeId : defaults.recipeId;
  const modeParam = params.get("mode");
  const scarcityMode: ScarcityMode = isScarcityMode(modeParam) ? modeParam : defaults.scarcityMode;
  const parsedTarget = parseInt(params.get("target") ?? "", 10);

  return {
    scarcityMode,
    recipeId: validRecipeId,
    targetIngots: Number.isNaN(parsedTarget) || parsedTarget < 1 ? defaults.targetIngots : parsedTarget,
    inventory: parsedInventory,
  };
}

export function buildPlannerSearch(state: PlannerState): string {
  const params = new URLSearchParams();

  if (state.scarcityMode !== DEFAULT_SCARCITY_MODE) {
    params.set("mode", state.scarcityMode);
  }

  if (state.recipeId) {
    params.set("recipe", state.recipeId);
  }

  if (state.targetIngots > 1) {
    params.set("target", String(state.targetIngots));
  }

  for (const metal of METALS) {
    const nuggets = state.inventory[metal.id];
    if (nuggets > 0) {
      params.set(`inv_${metal.id}`, String(nuggets));
    }
  }

  return params.toString();
}
