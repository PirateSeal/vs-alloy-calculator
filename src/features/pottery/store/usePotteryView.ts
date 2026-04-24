import { useShallow } from "zustand/shallow";
import { usePotteryStore } from "@/features/pottery/store/usePotteryStore";

export function usePotteryView() {
  return usePotteryStore(
    useShallow((state) => ({
      activeView: state.activeView,
      calculatorState: state.calculatorState,
      plannerState: state.plannerState,
      setActiveView: state.setActiveView,
      setCalculatorState: state.setCalculatorState,
      setPlannerState: state.setPlannerState,
    })),
  );
}
