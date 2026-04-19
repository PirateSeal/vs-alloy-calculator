import { useShallow } from "zustand/shallow";
import { useMetallurgyStore } from "@/features/metallurgy/store/useMetallurgyStore";

export function useMetallurgyView() {
  return useMetallurgyStore(
    useShallow((state) => ({
      activeView: state.activeView,
      calculatorCrucible: state.calculatorCrucible,
      selectedRecipeId: state.selectedRecipeId,
      plannerState: state.plannerState,
      setCrucible: state.setCrucible,
      setSelectedRecipeId: state.setSelectedRecipeId,
      setPlannerState: state.setPlannerState,
    })),
  );
}
