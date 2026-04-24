import { PotteryCalculator } from "@/features/pottery/components/PotteryCalculator";
import { PotteryPlanner } from "@/features/pottery/components/PotteryPlanner";
import { usePotteryUrlSync } from "@/features/pottery/store/usePotteryUrlSync";
import { usePotteryView } from "@/features/pottery/store/usePotteryView";

export function PotteryApp() {
  const { activeView, calculatorState, plannerState, setCalculatorState, setPlannerState } = usePotteryView();
  usePotteryUrlSync();

  if (activeView === "pottery-planner") {
    return <PotteryPlanner state={plannerState} onStateChange={setPlannerState} />;
  }

  return <PotteryCalculator state={calculatorState} onStateChange={setCalculatorState} />;
}
