import { useCallback, useMemo } from "react";
import { ALLOY_RECIPES, METALS } from "./data/alloys";
import { createPresetForAlloy, aggregateCrucible, evaluateAlloys } from "./lib/alloyLogic";
import { CalculatorControls } from "./components/CalculatorControls";
import { CompositionCard } from "./components/CompositionCard";
import { CruciblePanel } from "./components/CruciblePanel";
import { PlannerView } from "./components/PlannerView";
import { ResultCard } from "./components/ResultCard";
import { useMetallurgyUrlSync } from "./store/useMetallurgyUrlSync";
import { useMetallurgyView } from "./store/useMetallurgyView";
import type { AlloyRecipe } from "./types/alloys";

export function MetallurgyApp() {
  const {
    activeView,
    calculatorCrucible,
    selectedRecipeId,
    plannerState,
    setCrucible,
    setSelectedRecipeId,
    setPlannerState,
  } = useMetallurgyView();
  useMetallurgyUrlSync();

  const selectedRecipe = useMemo(
    () => ALLOY_RECIPES.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [selectedRecipeId],
  );
  const amounts = useMemo(() => aggregateCrucible(calculatorCrucible), [calculatorCrucible]);
  const evaluation = useMemo(() => evaluateAlloys(amounts, ALLOY_RECIPES), [amounts]);
  const resultCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? selectedRecipe?.id ?? "none"}-${evaluation.bestMatch?.isExact ? "exact" : "other"}`;
  const compositionCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? "none"}`;

  const handleRecipeSelect = useCallback(
    (recipe: AlloyRecipe | null) => {
      setSelectedRecipeId(recipe?.id ?? null);
    },
    [setSelectedRecipeId],
  );

  const handleLoadPreset = useCallback(
    (recipe: AlloyRecipe, ingotAmount: number) => {
      setSelectedRecipeId(recipe.id);
      setCrucible(createPresetForAlloy(recipe, ingotAmount));
    },
    [setCrucible, setSelectedRecipeId],
  );

  return (
    activeView === "calculator" ? (
      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.95fr)] xl:items-start">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="order-2 animate-surface-in animate-delay-1 xl:order-1">
            <CalculatorControls
              evaluation={evaluation}
              recipes={ALLOY_RECIPES}
              selectedRecipe={selectedRecipe}
              onLoadPreset={handleLoadPreset}
              onRecipeSelect={handleRecipeSelect}
              onCrucibleChange={setCrucible}
            />
          </div>
          <div className="order-1 animate-surface-in animate-delay-2 xl:order-2">
            <CruciblePanel
              crucible={calculatorCrucible}
              onCrucibleChange={setCrucible}
              allMetals={METALS}
              recipes={ALLOY_RECIPES}
            />
          </div>
        </section>
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <ResultCard
            key={resultCardKey}
            evaluation={evaluation}
            crucible={calculatorCrucible}
            onRecipeSelect={handleRecipeSelect}
            selectedRecipe={selectedRecipe}
            onCrucibleChange={setCrucible}
          />
          <CompositionCard
            key={compositionCardKey}
            amounts={evaluation.amounts}
            totalNuggets={evaluation.totalNuggets}
            totalUnits={evaluation.totalUnits}
            bestMatch={evaluation.bestMatch}
          />
        </aside>
      </div>
    ) : activeView === "planner" ? (
      <PlannerView recipes={ALLOY_RECIPES} state={plannerState} onStateChange={setPlannerState} />
    ) : null
  );
}
