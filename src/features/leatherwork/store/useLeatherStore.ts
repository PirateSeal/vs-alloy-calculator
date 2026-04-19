import { create } from "zustand";
import { createDefaultLeatherState, parseLeatherStateFromSearch } from "@/features/leatherwork/routing/appStateRouting";
import type {
  BearVariant,
  HideSize,
  LeatherState,
} from "@/features/leatherwork/types/leather";

interface LeatherStoreState extends LeatherState {
  updateInputs: (update: Partial<LeatherState>) => void;
  hydrateFromLocation: (_pathname: string, search: string) => void;
}

const BEAR_SIZE_MAP: Record<BearVariant, HideSize> = {
  sun: "large",
  panda: "large",
  black: "huge",
  brown: "huge",
  polar: "huge",
};

export function normalizeLeatherState(
  state: LeatherState,
  update: Partial<LeatherState>,
): LeatherState {
  const next = { ...state, ...update };

  if (next.workflow === "pelt") {
    next.mode = "hides";
  }

  if (next.bearVariant) {
    next.size = BEAR_SIZE_MAP[next.bearVariant];
    next.animalVariant = "generic";
    return next;
  }

  if (next.size !== "small") {
    next.animalVariant = "generic";
  }

  return next;
}

function getInitialState(): LeatherState {
  if (typeof window === "undefined") {
    return createDefaultLeatherState();
  }

  return parseLeatherStateFromSearch(window.location.search);
}

export const useLeatherStore = create<LeatherStoreState>((set) => ({
  ...getInitialState(),
  updateInputs: (update) => set((state) => normalizeLeatherState(state, update)),
  hydrateFromLocation: (_pathname, search) => set(parseLeatherStateFromSearch(search)),
}));
