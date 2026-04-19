import { Suspense, lazy, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShellMobileNav, ShellNavigationRail } from "@/components/ShellNavigation";
import { TranslationNotice } from "@/components/TranslationNotice";
import { ALLOY_RECIPES, METALS } from "./data/alloys";
import { createPresetForAlloy, aggregateCrucible, evaluateAlloys } from "./lib/alloyLogic";
import { CalculatorControls } from "./components/CalculatorControls";
import { CompositionCard } from "./components/CompositionCard";
import { CruciblePanel } from "./components/CruciblePanel";
import { PlannerView } from "./components/PlannerView";
import { ResultCard } from "./components/ResultCard";
import { SeoLandingContent } from "./components/SeoLandingContent";
import { useMetallurgyStore } from "./store/useMetallurgyStore";
import { useMetallurgyUrlSync } from "./store/useMetallurgyUrlSync";
import type { AlloyRecipe } from "./types/alloys";
import type { AppDomain } from "./types/planner";

const AlloyReferenceTable = lazy(() =>
  import("./components/AlloyReferenceTable").then((module) => ({ default: module.AlloyReferenceTable })),
);

interface MetallurgyAppProps {
  railCollapsed: boolean;
  onRailCollapsedChange: (collapsed: boolean) => void;
}

export function MetallurgyApp({ railCollapsed, onRailCollapsedChange }: MetallurgyAppProps) {
  const activeDomain: AppDomain = "metallurgy";
  const activeView = useMetallurgyStore((state) => state.activeView);
  const calculatorCrucible = useMetallurgyStore((state) => state.calculatorCrucible);
  const selectedRecipeId = useMetallurgyStore((state) => state.selectedRecipeId);
  const plannerState = useMetallurgyStore((state) => state.plannerState);
  const setCrucible = useMetallurgyStore((state) => state.setCrucible);
  const setSelectedRecipeId = useMetallurgyStore((state) => state.setSelectedRecipeId);
  const setPlannerState = useMetallurgyStore((state) => state.setPlannerState);
  const { navigateToView } = useMetallurgyUrlSync();

  const selectedRecipe = useMemo(
    () => ALLOY_RECIPES.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [selectedRecipeId],
  );
  const amounts = useMemo(() => aggregateCrucible(calculatorCrucible), [calculatorCrucible]);
  const evaluation = useMemo(() => evaluateAlloys(amounts, ALLOY_RECIPES), [amounts]);
  const resultCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? selectedRecipe?.id ?? "none"}-${evaluation.bestMatch?.isExact ? "exact" : "other"}`;
  const compositionCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? "none"}`;

  const handleLoadPreset = (recipe: AlloyRecipe, ingotAmount: number) => {
    setSelectedRecipeId(recipe.id);
    setCrucible(createPresetForAlloy(recipe, ingotAmount));
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ShellNavigationRail
        activeView={activeView}
        activeDomain={activeDomain}
        collapsed={railCollapsed}
        onCollapseChange={onRailCollapsedChange}
        onTabChange={navigateToView}
      />

      <div
        className={cn(
          "flex min-h-dvh min-w-0 flex-col overflow-x-clip transition-[padding-left] duration-300",
          railCollapsed ? "lg:pl-[6rem]" : "lg:pl-[18rem]",
        )}
      >
        <div className="lg:hidden">
          <Header activeTab={activeView} />
        </div>
        <TranslationNotice />
        <main
          className="mx-auto w-full max-w-[1680px] flex-1 px-4 pb-36 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-5"
          role="main"
        >
          {activeView === "calculator" ? (
            <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.95fr)] xl:items-start">
              <section className="flex min-w-0 flex-col gap-4">
                <div className="order-2 animate-surface-in animate-delay-1 xl:order-1">
                  <CalculatorControls
                    evaluation={evaluation}
                    recipes={ALLOY_RECIPES}
                    selectedRecipe={selectedRecipe}
                    onLoadPreset={handleLoadPreset}
                    onRecipeSelect={(recipe) => setSelectedRecipeId(recipe?.id ?? null)}
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
                  onRecipeSelect={(recipe) => setSelectedRecipeId(recipe?.id ?? null)}
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
          ) : activeView === "about" ? (
            <SeoLandingContent />
          ) : (
            <Suspense
              fallback={
                <div className="animate-surface-in space-y-4 rounded-2xl bg-card/60 p-4 shadow-sm ring-1 ring-inset ring-border/20">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
              }
            >
              <AlloyReferenceTable recipes={ALLOY_RECIPES} />
            </Suspense>
          )}
        </main>
        <Footer />
      </div>

      <ShellMobileNav activeView={activeView} onTabChange={navigateToView} />
    </div>
  );
}
