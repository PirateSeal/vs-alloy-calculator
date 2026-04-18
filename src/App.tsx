import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, applySeoToDocument, getLocaleFromPath, stripLocalePrefix } from "@/i18n";
import { METALS, ALLOY_RECIPES } from "./data/alloys";
import type { AlloyRecipe, MetalId } from "./types/alloys";
import type { CrucibleState } from "./types/crucible";
import { I18nProvider } from "./i18n";
import {
  aggregateCrucible,
  evaluateAlloys,
  createEmptyCrucible,
  createPresetForAlloy,
} from "./lib/alloyLogic";
import { track } from "./lib/analytics";
import { Header } from "./components/Header";
import { SeoLandingContent } from "./components/SeoLandingContent";
import { CalculatorControls } from "./components/CalculatorControls";
import { CruciblePanel } from "./components/CruciblePanel";
import { CompositionCard } from "./components/CompositionCard";
import { ResultCard } from "./components/ResultCard";
import { Footer } from "./components/Footer";
import { TranslationNotice } from "./components/TranslationNotice";
import { ShellMobileNav, ShellNavigationRail, type ShellTab } from "./components/ShellNavigation";
import { Skeleton } from "@/components/ui/skeleton";

const AlloyReferenceTable = lazy(() =>
  import("./components/AlloyReferenceTable").then((module) => ({ default: module.AlloyReferenceTable })),
);

const VALID_METAL_IDS = new Set<string>(METALS.map((metal) => metal.id));
const VALID_RECIPE_IDS = new Set<string>(ALLOY_RECIPES.map((recipe) => recipe.id));
const TAB_PATHS: Record<ShellTab, string> = {
  calculator: "/",
  reference: "/reference/",
  about: "/about/",
};

function normalizeTabPath(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return "/";
  }

  return stripped.endsWith("/") ? stripped : `${stripped}/`;
}

function getTabFromPath(pathname: string): ShellTab {
  const normalized = normalizeTabPath(pathname);

  if (normalized === "/reference/") {
    return "reference";
  }

  if (normalized === "/about/") {
    return "about";
  }

  return "calculator";
}

function getPathnameForTab(pathname: string, tab: ShellTab): string {
  const locale = getLocaleFromPath(pathname);

  if (!locale) {
    return TAB_PATHS[tab];
  }

  return TAB_PATHS[tab] === "/" ? `/${locale}/` : `/${locale}${TAB_PATHS[tab]}`;
}

function parseStateFromURL(): { crucible: CrucibleState; recipe: AlloyRecipe | null } {
  const params = new URLSearchParams(window.location.search);
  const base = createEmptyCrucible();
  let hasAny = false;

  for (let i = 0; i < 4; i++) {
    const param = params.get(`s${i}`);
    if (!param) continue;
    const [metalId, nuggetsStr] = param.split(":");
    const nuggets = parseInt(nuggetsStr, 10);
    if (VALID_METAL_IDS.has(metalId) && !Number.isNaN(nuggets) && nuggets >= 0 && nuggets <= 128) {
      base.slots[i] = { id: i, metalId: metalId as MetalId, nuggets };
      hasAny = true;
    }
  }

  const recipeId = params.get("r");
  const recipe =
    recipeId && VALID_RECIPE_IDS.has(recipeId)
      ? ALLOY_RECIPES.find((recipe) => recipe.id === recipeId) ?? null
      : null;

  return { crucible: hasAny ? base : createEmptyCrucible(), recipe };
}

const { crucible: initialCrucible, recipe: initialRecipe } = parseStateFromURL();

function App() {
  const [crucible, setCrucible] = useState<CrucibleState>(initialCrucible);
  const [selectedRecipe, setSelectedRecipe] = useState<AlloyRecipe | null>(initialRecipe);
  const [activeTab, setActiveTab] = useState<ShellTab>(() => getTabFromPath(window.location.pathname));
  const [railCollapsed, setRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("shell-rail-collapsed") === "true";
  });

  useEffect(() => {
    if (activeTab !== "calculator") {
      const nextUrl = `${window.location.pathname}${window.location.hash}`;
      history.replaceState(null, "", nextUrl);
      return;
    }

    const params = new URLSearchParams();
    for (const slot of crucible.slots) {
      if (slot.metalId && slot.nuggets > 0) {
        params.set(`s${slot.id}`, `${slot.metalId}:${slot.nuggets}`);
      }
    }
    if (selectedRecipe) {
      params.set("r", selectedRecipe.id);
    }
    const search = params.toString();
    const nextUrl = search
      ? `${window.location.pathname}?${search}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    history.replaceState(null, "", nextUrl);
  }, [activeTab, crucible, selectedRecipe]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
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

  const handleCrucibleChange = (newCrucible: typeof crucible) => {
    setCrucible(newCrucible);
  };

  const handleRecipeSelect = (recipe: AlloyRecipe | null) => {
    setSelectedRecipe(recipe);
  };

  const handleTabChange = (tab: ShellTab) => {
    setActiveTab(tab);
    const nextPathname = getPathnameForTab(window.location.pathname, tab);
    const search = tab === "calculator" ? window.location.search : "";
    history.pushState(null, "", `${nextPathname}${search}${window.location.hash}`);
    applySeoToDocument(getLocaleFromPath(nextPathname) ?? DEFAULT_LOCALE);
    track("tab-switched", { tab });
  };

  return (
    <I18nProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <ShellNavigationRail
          activeTab={activeTab}
          collapsed={railCollapsed}
          onCollapseChange={setRailCollapsed}
          onTabChange={handleTabChange}
        />

        {/* Main content — offset by the fixed sidebar width on lg+ */}
        <div className={cn(
          "flex min-h-dvh min-w-0 flex-col overflow-x-clip transition-[padding-left] duration-300",
          railCollapsed ? "lg:pl-[6rem]" : "lg:pl-[18rem]",
        )}>
          {/* Header: visible only on mobile where there is no navigation rail */}
          <div className="lg:hidden">
            <Header activeTab={activeTab} />
          </div>
          <TranslationNotice />
          <main
            className="mx-auto w-full max-w-[1680px] flex-1 px-4 pb-36 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-5"
            role="main"
          >
            {activeTab === "calculator" ? (
              <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.95fr)] xl:items-start">
                <section className="flex min-w-0 flex-col gap-4">
                  <div className="order-2 animate-surface-in animate-delay-1 xl:order-1">
                    <CalculatorControls
                      evaluation={evaluation}
                      recipes={ALLOY_RECIPES}
                      selectedRecipe={selectedRecipe}
                      onLoadPreset={handleLoadPreset}
                      onRecipeSelect={handleRecipeSelect}
                      onCrucibleChange={handleCrucibleChange}
                    />
                  </div>
                  <div className="order-1 animate-surface-in animate-delay-2 xl:order-2">
                    <CruciblePanel
                      crucible={crucible}
                      onCrucibleChange={handleCrucibleChange}
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
                    onRecipeSelect={handleRecipeSelect}
                    selectedRecipe={selectedRecipe}
                    onCrucibleChange={handleCrucibleChange}
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
            ) : activeTab === "about" ? (
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

        <ShellMobileNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </I18nProvider>
  );
}

export default App;
