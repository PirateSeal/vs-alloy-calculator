import { useShallow } from "zustand/shallow";
import { useMetallurgyStore } from "@/features/metallurgy/store/useMetallurgyStore";

export function useMetallurgyUrlState() {
  return useMetallurgyStore(
    useShallow((state) => ({
      activeView: state.activeView,
      calculatorCrucible: state.calculatorCrucible,
      selectedRecipeId: state.selectedRecipeId,
      plannerState: state.plannerState,
      setActiveView: state.setActiveView,
      hydrateFromLocation: state.hydrateFromLocation,
    })),
  );
}
