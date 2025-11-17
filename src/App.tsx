import { useState, useMemo } from "react";
import { Calculator, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function App() {
  const [crucible, setCrucible] = useState(createEmptyCrucible());

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
    setCrucible(presetCrucible);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="calculator" className="flex flex-1">
          <TabsList className="flex flex-col items-center justify-start h-full w-16 rounded-none border-none bg-muted/40 p-1 pt-2 gap-1 shrink-0" aria-label="Calculator and reference navigation">
            <TabsTrigger
              value="calculator"
              className="w-12 h-10 data-[state=active]:bg-background border-none p-0"
              aria-label="Calculator"
            >
              <Calculator className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="reference"
              className="w-12 h-10 data-[state=active]:bg-background border-none p-0"
              aria-label="Alloy Reference"
            >
              <BookOpen className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <main className="flex-1 overflow-hidden" role="main">
            <TabsContent value="calculator" className="m-0 p-4">
              <div className="space-y-4">
                <CruciblePanel
                  crucible={crucible}
                  onCrucibleChange={setCrucible}
                  allMetals={METALS}
                  recipes={ALLOY_RECIPES}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <CompositionCard
                    amounts={evaluation.amounts}
                    totalNuggets={evaluation.totalNuggets}
                    totalUnits={evaluation.totalUnits}
                  />
                  <ResultCard
                    evaluation={evaluation}
                    recipes={ALLOY_RECIPES}
                    onLoadPreset={handleLoadPreset}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reference" className="m-0 p-4">
              <AlloyReferenceTable recipes={ALLOY_RECIPES} />
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
