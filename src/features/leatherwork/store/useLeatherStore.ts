import { create } from "zustand";
import { createDefaultLeatherState, parseLeatherStateFromSearch } from "@/features/leatherwork/routing/appStateRouting";
import type { LeatherState } from "@/features/leatherwork/types/leather";

type StateUpdater<T> = T | ((current: T) => T);

interface LeatherStoreState extends LeatherState {
  setState: (update: StateUpdater<LeatherState>) => void;
  hydrateFromLocation: (_pathname: string, search: string) => void;
}

function resolveUpdate<T>(current: T, update: StateUpdater<T>): T {
  return typeof update === "function" ? (update as (value: T) => T)(current) : update;
}

function getInitialState(): LeatherState {
  if (typeof window === "undefined") {
    return createDefaultLeatherState();
  }

  return parseLeatherStateFromSearch(window.location.search);
}

export const useLeatherStore = create<LeatherStoreState>((set) => ({
  ...getInitialState(),
  setState: (update) =>
    set((state) => ({ ...state, ...resolveUpdate<LeatherState>(state, update) })),
  hydrateFromLocation: (_pathname, search) => set(parseLeatherStateFromSearch(search)),
}));
