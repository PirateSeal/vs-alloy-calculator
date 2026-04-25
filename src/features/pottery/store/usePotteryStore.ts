import { create } from "zustand";
import {
  createDefaultPotteryCalculatorState,
  createDefaultPotteryPlannerState,
  getPotteryViewFromPath,
  parsePotteryCalculatorStateFromSearch,
  parsePotteryPlannerStateFromSearch,
} from "@/features/pottery/routing/appStateRouting";
import type { PotteryCalculatorState, PotteryPlannerState, PotteryView } from "@/features/pottery/types/pottery";

type StateUpdater<T> = T | ((current: T) => T);

interface PotteryStoreState {
  activeView: PotteryView;
  calculatorState: PotteryCalculatorState;
  plannerState: PotteryPlannerState;
  setActiveView: (view: PotteryView) => void;
  setCalculatorState: (update: StateUpdater<PotteryCalculatorState>) => void;
  setPlannerState: (update: StateUpdater<PotteryPlannerState>) => void;
  hydrateFromLocation: (pathname: string, search: string) => void;
}

function resolveUpdate<T>(current: T, update: StateUpdater<T>): T {
  return typeof update === "function" ? (update as (value: T) => T)(current) : update;
}

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      activeView: "pottery-calculator" as PotteryView,
      calculatorState: createDefaultPotteryCalculatorState(),
      plannerState: createDefaultPotteryPlannerState(),
    };
  }

  const activeView = getPotteryViewFromPath(window.location.pathname);
  return {
    activeView,
    calculatorState:
      activeView === "pottery-calculator"
        ? parsePotteryCalculatorStateFromSearch(window.location.search)
        : createDefaultPotteryCalculatorState(),
    plannerState:
      activeView === "pottery-planner"
        ? parsePotteryPlannerStateFromSearch(window.location.search)
        : createDefaultPotteryPlannerState(),
  };
}

export const usePotteryStore = create<PotteryStoreState>((set) => ({
  ...getInitialState(),
  setActiveView: (activeView) => set({ activeView }),
  setCalculatorState: (update) =>
    set((state) => ({
      calculatorState: resolveUpdate(state.calculatorState, update),
    })),
  setPlannerState: (update) =>
    set((state) => ({
      plannerState: resolveUpdate(state.plannerState, update),
    })),
  hydrateFromLocation: (pathname, search) =>
    set((state) => {
      const activeView = getPotteryViewFromPath(pathname);
      if (activeView === "pottery-calculator") {
        return {
          activeView,
          calculatorState: parsePotteryCalculatorStateFromSearch(search),
          plannerState: state.plannerState,
        };
      }

      return {
        activeView,
        calculatorState: state.calculatorState,
        plannerState: parsePotteryPlannerStateFromSearch(search),
      };
    }),
}));
