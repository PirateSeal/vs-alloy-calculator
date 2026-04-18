import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, applySeoToDocument, getLocaleFromPath } from "@/i18n";
import { METALS, ALLOY_RECIPES } from "./data/alloys";
import type { AlloyRecipe } from "./types/alloys";
import type { CrucibleState } from "./types/crucible";
import type { AppDomain, MetallurgyView, PlannerState } from "./types/planner";
import { I18nProvider } from "./i18n";
import {
  aggregateCrucible,
  evaluateAlloys,
  createEmptyCrucible,
  createPresetForAlloy,
} from "./lib/alloyLogic";
import {
  buildCalculatorSearch,
  buildPlannerSearch,
  createDefaultPlannerState,
  getMetallurgyViewFromPath,
  getPathnameForMetallurgyView,
  parseCalculatorStateFromSearch,
  parsePlannerStateFromSearch,
} from "./lib/appStateRouting";
import { track } from "./lib/analytics";
import { Header } from "./components/Header";
import { SeoLandingContent } from "./components/SeoLandingContent";
import { PlannerView } from "./components/PlannerView";
import { CalculatorControls } from "./components/CalculatorControls";
import { CruciblePanel } from "./components/CruciblePanel";
import { CompositionCard } from "./components/CompositionCard";
import { ResultCard } from "./components/ResultCard";
import { Footer } from "./components/Footer";
import { TranslationNotice } from "./components/TranslationNotice";
import { ShellMobileNav, ShellNavigationRail } from "./components/ShellNavigation";
import { Skeleton } from "@/components/ui/skeleton";

const AlloyReferenceTable = lazy(() =>
  import("./components/AlloyReferenceTable").then((module) => ({ default: module.AlloyReferenceTable })),
);

interface InitialAppState {
  view: MetallurgyView;
  crucible: CrucibleState;
  recipe: AlloyRecipe | null;
  planner: PlannerState;
}

function getInitialAppState(): InitialAppState {
  const view = getMetallurgyViewFromPath(window.location.pathname);
  const calculatorState = parseCalculatorStateFromSearch(window.location.search);
  const plannerState = parsePlannerStateFromSearch(window.location.search);

  return {
    view,
    crucible: view === "calculator" ? calculatorState.crucible : createEmptyCrucible(),
    recipe: view === "calculator" ? calculatorState.recipe : null,
    planner: view === "planner" ? plannerState : createDefaultPlannerState(),
  };
}

function App() {
  const [initialState] = useState<InitialAppState>(getInitialAppState);
  const activeDomain: AppDomain = "metallurgy";
  const [crucible, setCrucible] = useState<CrucibleState>(initialState.crucible);
  const [selectedRecipe, setSelectedRecipe] = useState<AlloyRecipe | null>(initialState.recipe);
  const [plannerState, setPlannerState] = useState<PlannerState>(initialState.planner);
  const [activeView, setActiveView] = useState<MetallurgyView>(initialState.view);
  const [railCollapsed, setRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("shell-rail-collapsed") === "true";
  });

  useEffect(() => {
    let search = "";
    if (activeView === "calculator") {
      search = buildCalculatorSearch(crucible, selectedRecipe);
    } else if (activeView === "planner") {
      search = buildPlannerSearch(plannerState);
    }

    const nextUrl = search
      ? `${window.location.pathname}?${search}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    history.replaceState(null, "", nextUrl);
  }, [activeView, crucible, plannerState, selectedRecipe]);

  useEffect(() => {
    const handlePopState = () => {
      const nextView = getMetallurgyViewFromPath(window.location.pathname);
      setActiveView(nextView);

      if (nextView === "calculator") {
        const calculatorState = parseCalculatorStateFromSearch(window.location.search);
        setCrucible(calculatorState.crucible);
        setSelectedRecipe(calculatorState.recipe);
      }

      if (nextView === "planner") {
        setPlannerState(parsePlannerStateFromSearch(window.location.search));
      }

      applySeoToDocument(getLocaleFromPath(window.location.pathname) ?? DEFAULT_LOCALE);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("shell-rail-collapsed", String(railCollapsed));
  }, [railCollapsed]);

  const amounts = useMemo(() => aggregateCrucible(crucible), [crucible]);
  const evaluation = useMemo(() => evaluateAlloys(amounts, ALLOY_RECIPES), [amounts]);
  const resultCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? selectedRecipe?.id ?? "none"}-${evaluation.bestMatch?.isExact ? "exact" : "other"}`;
  const compositionCardKey = `${evaluation.totalUnits === 0 ? "empty" : "filled"}-${evaluation.bestMatch?.recipe.id ?? "none"}`;

  const handleLoadPreset = (recipe: AlloyRecipe, ingotAmount: number) => {
    const presetCrucible = createPresetForAlloy(recipe, ingotAmount);
    setSelectedRecipe(recipe);
    setCrucible(presetCrucible);
  };

  const handleTabChange = (view: MetallurgyView) => {
    setActiveView(view);
    const nextPathname = getPathnameForMetallurgyView(window.location.pathname, view);
    const search =
      view === "calculator"
        ? buildCalculatorSearch(crucible, selectedRecipe)
        : view === "planner"
          ? buildPlannerSearch(plannerState)
          : "";

    history.pushState(null, "", `${nextPathname}${search ? `?${search}` : ""}${window.location.hash}`);
    applySeoToDocument(getLocaleFromPath(nextPathname) ?? DEFAULT_LOCALE);
    track("tab-switched", { tab: view, domain: activeDomain });
  };

  return (
    <I18nProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <ShellNavigationRail
          activeView={activeView}
          activeDomain={activeDomain}
          collapsed={railCollapsed}
          onCollapseChange={setRailCollapsed}
          onTabChange={handleTabChange}
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
                      onRecipeSelect={setSelectedRecipe}
                      onCrucibleChange={setCrucible}
                    />
                  </div>
                  <div className="order-1 animate-surface-in animate-delay-2 xl:order-2">
                    <CruciblePanel
                      crucible={crucible}
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
                    crucible={crucible}
                    onRecipeSelect={setSelectedRecipe}
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

        <ShellMobileNav activeView={activeView} onTabChange={handleTabChange} />
      </div>
    </I18nProvider>
  );
}

export default App;
