import { POTTERY_RECIPE_BY_ID, POTTERY_RECIPES } from "@/features/pottery/data/recipes";
import { POTTERY_VIEW_PATHS } from "@/features/pottery/routing/routes";
import { DEFAULT_KILN_FUEL_TYPE, KILN_FUEL_OPTIONS } from "@/features/pottery/lib/potteryLogic";
import type { KilnFuelType, KilnMode, PotteryCalculatorState, PotteryPlanItem, PotteryPlannerState, PotteryView } from "@/features/pottery/types/pottery";
import { getLocaleFromPath, stripLocalePrefix } from "@/i18n";

const VALID_RECIPE_IDS = new Set(POTTERY_RECIPES.map((recipe) => recipe.id));
const VALID_FUEL_TYPES = new Set<KilnFuelType>(KILN_FUEL_OPTIONS.map((fuel) => fuel.type));
const MAX_QUANTITY = 9999;

export function createDefaultPotteryCalculatorState(): PotteryCalculatorState {
  return {
    recipeId: null,
    quantity: 1,
  };
}

export function createDefaultPotteryPlannerState(): PotteryPlannerState {
  return {
    plan: [],
    invAny: 0,
    invFire: 0,
    kilnMode: "pit",
    fuelType: DEFAULT_KILN_FUEL_TYPE,
  };
}

function parseNonNegativeInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, MAX_QUANTITY);
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, MAX_QUANTITY);
}

function parseKilnMode(value: string | null): KilnMode {
  return value === "beehive" ? "beehive" : "pit";
}

function parseFuelType(value: string | null): KilnFuelType {
  return value && VALID_FUEL_TYPES.has(value as KilnFuelType) ? (value as KilnFuelType) : DEFAULT_KILN_FUEL_TYPE;
}

function normalizePath(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") return "/";
  return stripped.endsWith("/") ? stripped : `${stripped}/`;
}

export function getPotteryViewFromPath(pathname: string): PotteryView {
  const normalized = normalizePath(pathname);
  if (normalized === POTTERY_VIEW_PATHS["pottery-planner"]) return "pottery-planner";
  return "pottery-calculator";
}

export function getPathnameForPotteryView(pathname: string, view: PotteryView): string {
  const locale = getLocaleFromPath(pathname);
  const viewPath = POTTERY_VIEW_PATHS[view];
  return locale ? `/${locale}${viewPath}` : viewPath;
}

export function parsePotteryCalculatorStateFromSearch(search: string): PotteryCalculatorState {
  const defaults = createDefaultPotteryCalculatorState();
  const params = new URLSearchParams(search);
  const recipeId = params.get("item");

  return {
    recipeId: recipeId && VALID_RECIPE_IDS.has(recipeId) ? recipeId : defaults.recipeId,
    quantity: parsePositiveInt(params.get("qty"), defaults.quantity),
  };
}

function parsePlan(value: string | null): PotteryPlanItem[] {
  if (!value) return [];

  const items: PotteryPlanItem[] = [];
  for (const chunk of value.split(",")) {
    const [recipeId, quantityValue] = chunk.split(":");
    if (!recipeId || !VALID_RECIPE_IDS.has(recipeId)) continue;

    const quantity = parsePositiveInt(quantityValue ?? null, 1);
    const existing = items.find((item) => item.recipeId === recipeId);
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
    } else {
      items.push({ recipeId, quantity });
    }
  }

  return items;
}

export function parsePotteryPlannerStateFromSearch(search: string): PotteryPlannerState {
  const defaults = createDefaultPotteryPlannerState();
  const params = new URLSearchParams(search);

  return {
    plan: parsePlan(params.get("plan")),
    invAny: parseNonNegativeInt(params.get("inv-any"), defaults.invAny),
    invFire: parseNonNegativeInt(params.get("inv-fire"), defaults.invFire),
    kilnMode: parseKilnMode(params.get("kiln")),
    fuelType: parseFuelType(params.get("fuel")),
  };
}

export function buildPotteryCalculatorSearch(state: PotteryCalculatorState): string {
  const defaults = createDefaultPotteryCalculatorState();
  const params = new URLSearchParams();

  if (state.recipeId && POTTERY_RECIPE_BY_ID.has(state.recipeId)) {
    params.set("item", state.recipeId);
  }
  if (state.quantity !== defaults.quantity) {
    params.set("qty", String(state.quantity));
  }

  return params.toString();
}

export function buildPotteryPlannerSearch(state: PotteryPlannerState): string {
  const params = new URLSearchParams();
  const validPlan = state.plan.filter((item) => POTTERY_RECIPE_BY_ID.has(item.recipeId) && item.quantity > 0);

  if (validPlan.length > 0) {
    params.set("plan", validPlan.map((item) => `${item.recipeId}:${item.quantity}`).join(","));
  }
  if (state.invAny > 0) {
    params.set("inv-any", String(state.invAny));
  }
  if (state.invFire > 0) {
    params.set("inv-fire", String(state.invFire));
  }
  if (state.kilnMode !== "pit") {
    params.set("kiln", state.kilnMode);
  }
  if (state.fuelType !== DEFAULT_KILN_FUEL_TYPE && VALID_FUEL_TYPES.has(state.fuelType)) {
    params.set("fuel", state.fuelType);
  }

  return params.toString();
}
