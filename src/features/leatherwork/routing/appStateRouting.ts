import { LEATHER_VIEW_PATH } from "@/features/leatherwork/routing/routes";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherMode,
  LeatherState,
  LeatherWorkflow,
  Solvent,
} from "@/features/leatherwork/types/leather";
import { getLocaleFromPath, stripLocalePrefix } from "@/i18n";

const VALID_SIZES = new Set<HideSize>(["small", "medium", "large", "huge"]);
const VALID_MODES = new Set<LeatherMode>(["hides", "leather"]);
const VALID_WORKFLOWS = new Set<LeatherWorkflow>(["leather", "pelt"]);
const VALID_SOLVENTS = new Set<Solvent>(["lime", "borax"]);
const VALID_ANIMALS = new Set<AnimalVariant>(["generic", "fox", "arctic-fox", "raccoon"]);
const VALID_BEARS = new Set<BearVariant>(["sun", "panda", "black", "brown", "polar"]);
const MAX_COUNT = 999;

const BEAR_SIZE_MAP: Record<BearVariant, HideSize> = {
  sun: "large",
  panda: "large",
  black: "huge",
  brown: "huge",
  polar: "huge",
};

export function createDefaultLeatherState(): LeatherState {
  return {
    workflow: "leather",
    mode: "hides",
    size: "small",
    animalVariant: "generic",
    bearVariant: null,
    hideCount: 1,
    targetLeather: 1,
    solvent: "lime",
  };
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, MAX_COUNT);
}

function normalizeAnimalVariant(size: HideSize, animalVariant: AnimalVariant): AnimalVariant {
  return size === "small" ? animalVariant : "generic";
}

function normalizeBearVariant(value: string | null): BearVariant | null {
  return value && VALID_BEARS.has(value as BearVariant) ? (value as BearVariant) : null;
}

function normalizeSize(value: string | null): HideSize | null {
  return value && VALID_SIZES.has(value as HideSize) ? (value as HideSize) : null;
}

export function parseLeatherStateFromSearch(search: string): LeatherState {
  const defaults = createDefaultLeatherState();
  const params = new URLSearchParams(search);
  const bearVariant = normalizeBearVariant(params.get("bear"));
  const size = bearVariant
    ? BEAR_SIZE_MAP[bearVariant]
    : normalizeSize(params.get("size")) ?? defaults.size;
  const workflow = VALID_WORKFLOWS.has(params.get("workflow") as LeatherWorkflow)
    ? (params.get("workflow") as LeatherWorkflow)
    : defaults.workflow;
  const mode = VALID_MODES.has(params.get("mode") as LeatherMode)
    ? (params.get("mode") as LeatherMode)
    : defaults.mode;
  const solvent = VALID_SOLVENTS.has(params.get("solvent") as Solvent)
    ? (params.get("solvent") as Solvent)
    : defaults.solvent;
  const rawAnimal = params.get("animal");
  const animalVariant = rawAnimal && VALID_ANIMALS.has(rawAnimal as AnimalVariant)
    ? normalizeAnimalVariant(size, rawAnimal as AnimalVariant)
    : normalizeAnimalVariant(size, defaults.animalVariant);

  return {
    workflow,
    mode: workflow === "pelt" ? "hides" : mode,
    size,
    animalVariant,
    bearVariant,
    hideCount: parsePositiveInt(params.get("count"), defaults.hideCount),
    targetLeather: parsePositiveInt(params.get("target"), defaults.targetLeather),
    solvent,
  };
}

export function buildLeatherSearch(state: LeatherState): string {
  const defaults = createDefaultLeatherState();
  const params = new URLSearchParams();

  if (state.workflow !== defaults.workflow) {
    params.set("workflow", state.workflow);
  }

  if (state.mode !== defaults.mode) {
    params.set("mode", state.mode);
  }

  if (state.bearVariant) {
    params.set("bear", state.bearVariant);
  } else if (state.size !== defaults.size) {
    params.set("size", state.size);
  }

  if (!state.bearVariant && state.size === "small" && state.animalVariant !== defaults.animalVariant) {
    params.set("animal", state.animalVariant);
  }

  if (state.workflow === "pelt" || state.mode === "hides") {
    if (state.hideCount !== defaults.hideCount) {
      params.set("count", String(state.hideCount));
    }
  } else {
    params.set("target", String(state.targetLeather));
  }

  if (state.workflow === "leather" && state.solvent !== defaults.solvent) {
    params.set("solvent", state.solvent);
  }

  return params.toString();
}

function normalizeLeatherPath(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return "/";
  }

  return stripped.endsWith("/") ? stripped : `${stripped}/`;
}

export function isLeatherPath(pathname: string): boolean {
  return normalizeLeatherPath(pathname) === LEATHER_VIEW_PATH;
}

export function getLeatherPathname(pathname: string): string {
  const locale = getLocaleFromPath(pathname);

  if (!locale) {
    return LEATHER_VIEW_PATH;
  }

  return `/${locale}${LEATHER_VIEW_PATH}`;
}
