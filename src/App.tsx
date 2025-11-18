import { useState, useMemo, useEffect } from "react";
import { METALS, ALLOY_RECIPES } from "./data/alloys";
import type { AlloyRecipe } from "./types/alloys";
import {
  aggregateCrucible,
  evaluateAlloys,
  createEmptyCrucible,
  createPresetForAlloy,
} from "./lib/alloyLogic";
import { Header } from "./components/Header";
import { CruciblePanel } from "./components/CruciblePanel";
import { CompositionCard } from "./components/CompositionCard";
import { ResultCard } from "./components/ResultCard";
import { AlloyReferenceTable } from "./components/AlloyReferenceTable";
import { MobileWarning } from "./components/MobileWarning";

function App() {
  const [crucible, setCrucible] = useState(createEmptyCrucible());
  const [selectedRecipe, setSelectedRecipe] = useState<AlloyRecipe | null>(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      const hasSeenWarning = localStorage.getItem("mobileWarningDismissed");
      setShowMobileWarning(isMobile && !hasSeenWarning);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleDismissWarning = () => {
    localStorage.setItem("mobileWarningDismissed", "true");
    setShowMobileWarning(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <MobileWarning isOpen={showMobileWarning} onDismiss={handleDismissWarning} />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto p-4" role="main">
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
          <AlloyReferenceTable recipes={ALLOY_RECIPES} />
        )}
      </main>
    </div>
  );
}

export default App;
