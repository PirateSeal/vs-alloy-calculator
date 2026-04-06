import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { METALS, ALLOY_RECIPES } from "./data/alloys";
import type { AlloyRecipe } from "./types/alloys";
import type { MetalId } from "./types/alloys";
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
import { CruciblePanel } from "./components/CruciblePanel";
import { CompositionCard } from "./components/CompositionCard";
import { ResultCard } from "./components/ResultCard";
import { Skeleton } from "@/components/ui/skeleton";

const AlloyReferenceTable = lazy(() => import("./components/AlloyReferenceTable").then(module => ({ default: module.AlloyReferenceTable })));
import { Footer } from "./components/Footer";
import { TranslationNotice } from "./components/TranslationNotice";

const VALID_METAL_IDS = new Set<string>(METALS.map(m => m.id));
const VALID_RECIPE_IDS = new Set<string>(ALLOY_RECIPES.map(r => r.id));

function parseStateFromURL(): { crucible: CrucibleState; recipe: AlloyRecipe | null } {
  const params = new URLSearchParams(window.location.search);
  const base = createEmptyCrucible();
  let hasAny = false;

  for (let i = 0; i < 4; i++) {
    const param = params.get(`s${i}`);
    if (!param) continue;
    const [metalId, nuggetsStr] = param.split(":");
    const nuggets = parseInt(nuggetsStr, 10);
    if (VALID_METAL_IDS.has(metalId) && !isNaN(nuggets) && nuggets >= 0 && nuggets <= 128) {
      base.slots[i] = { id: i, metalId: metalId as MetalId, nuggets };
      hasAny = true;
    }
  }

  const recipeId = params.get("r");
  const recipe = recipeId && VALID_RECIPE_IDS.has(recipeId)
    ? ALLOY_RECIPES.find(r => r.id === recipeId) ?? null
    : null;

  return { crucible: hasAny ? base : createEmptyCrucible(), recipe };
}

const { crucible: initialCrucible, recipe: initialRecipe } = parseStateFromURL();

function App() {
  const [crucible, setCrucible] = useState<CrucibleState>(initialCrucible);
  const [selectedRecipe, setSelectedRecipe] = useState<AlloyRecipe | null>(initialRecipe);
  const [activeTab, setActiveTab] = useState("calculator");

  // Sync crucible + selected recipe → URL
  useEffect(() => {
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
  }, [crucible, selectedRecipe]);

  const amounts = useMemo(
    () => aggregateCrucible(crucible),
    [crucible]
  );

  const evaluation = useMemo(
    () => evaluateAlloys(amounts, ALLOY_RECIPES),
    [amounts]
  );

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

  return (
    <I18nProvider>
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); track("tab-switched", { tab }); }} />
      <TranslationNotice />
      <main className="flex-1 p-4" role="main">
        {activeTab === "calculator" && (
          <div className="space-y-4">
            <CruciblePanel
              crucible={crucible}
              onCrucibleChange={handleCrucibleChange}
              allMetals={METALS}
              recipes={ALLOY_RECIPES}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <CompositionCard
                amounts={evaluation.amounts}
                totalNuggets={evaluation.totalNuggets}
                totalUnits={evaluation.totalUnits}
                bestMatch={evaluation.bestMatch}
              />
              <ResultCard
                evaluation={evaluation}
                recipes={ALLOY_RECIPES}
                crucible={crucible}
                onLoadPreset={handleLoadPreset}
                onRecipeSelect={handleRecipeSelect}
                selectedRecipe={selectedRecipe}
                onCrucibleChange={handleCrucibleChange}
              />
            </div>
          </div>
        )}
        {activeTab === "reference" && (
          <Suspense fallback={
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          }>
            <AlloyReferenceTable recipes={ALLOY_RECIPES} />
          </Suspense>
        )}
      </main>
      <Footer />
    </div>
    </I18nProvider>
  );
}

export default App;
