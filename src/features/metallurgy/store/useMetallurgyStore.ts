import { create } from "zustand";
import { createEmptyCrucible } from "@/features/metallurgy/lib/alloyLogic";
import {
  createDefaultPlannerState,
  getMetallurgyViewFromPath,
  parseCalculatorUrlStateFromSearch,
  parsePlannerStateFromSearch,
} from "@/features/metallurgy/routing/appStateRouting";
import type { AlloyRecipe } from "@/features/metallurgy/types/alloys";
import type { CrucibleState } from "@/features/metallurgy/types/crucible";
import type { MetallurgyView, PlannerState } from "@/features/metallurgy/types/planner";

type StateUpdater<T> = T | ((current: T) => T);

interface MetallurgyStoreState {
  activeView: MetallurgyView;
  calculatorCrucible: CrucibleState;
  selectedRecipeId: AlloyRecipe["id"] | null;
  plannerState: PlannerState;
  setActiveView: (view: MetallurgyView) => void;
  setCrucible: (update: StateUpdater<CrucibleState>) => void;
  setSelectedRecipeId: (recipeId: AlloyRecipe["id"] | null) => void;
  setPlannerState: (update: StateUpdater<PlannerState>) => void;
  hydrateFromLocation: (pathname: string, search: string) => void;
}

function resolveUpdate<T>(current: T, update: StateUpdater<T>): T {
  return typeof update === "function" ? (update as (value: T) => T)(current) : update;
}

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      activeView: "calculator" as MetallurgyView,
      calculatorCrucible: createEmptyCrucible(),
      selectedRecipeId: null,
      plannerState: createDefaultPlannerState(),
    };
  }

  const activeView = getMetallurgyViewFromPath(window.location.pathname);
  const calculatorState = parseCalculatorUrlStateFromSearch(window.location.search);
  const plannerState = parsePlannerStateFromSearch(window.location.search);

  return {
    activeView,
    calculatorCrucible: activeView === "calculator" ? calculatorState.crucible : createEmptyCrucible(),
    selectedRecipeId: activeView === "calculator" ? calculatorState.selectedRecipeId : null,
    plannerState: activeView === "planner" ? plannerState : createDefaultPlannerState(),
  };
}

export const useMetallurgyStore = create<MetallurgyStoreState>((set) => ({
  ...getInitialState(),
  setActiveView: (activeView) => set({ activeView }),
  setCrucible: (update) =>
    set((state) => ({
      calculatorCrucible: resolveUpdate(state.calculatorCrucible, update),
    })),
  setSelectedRecipeId: (selectedRecipeId) => set({ selectedRecipeId }),
  setPlannerState: (update) =>
    set((state) => ({
      plannerState: resolveUpdate(state.plannerState, update),
    })),
  hydrateFromLocation: (pathname, search) =>
    set((state) => {
      const activeView = getMetallurgyViewFromPath(pathname);

      if (activeView === "calculator") {
        const calculatorState = parseCalculatorUrlStateFromSearch(search);
        return {
          activeView,
          calculatorCrucible: calculatorState.crucible,
          selectedRecipeId: calculatorState.selectedRecipeId,
        };
      }

      if (activeView === "planner") {
        return {
          activeView,
          plannerState: parsePlannerStateFromSearch(search),
        };
      }

      return {
        activeView,
        calculatorCrucible: state.calculatorCrucible,
        selectedRecipeId: state.selectedRecipeId,
        plannerState: state.plannerState,
      };
    }),
}));
