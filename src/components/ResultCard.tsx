import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, XCircle, Info, Wand2, Maximize2 } from "lucide-react";
import { METALS } from "@/data/alloys";
import {
  calculateNuggetAdjustments,
  getAdjustmentSummary,
  applyNuggetAdjustments,
  createPresetForAlloy,
  aggregateCrucible
} from "@/lib/alloyLogic";
import { optimizeRecipe } from "@/lib/recipeOptimizer";
import { Switch } from "@/components/ui/switch";
import type { EvaluationResult } from "@/lib/alloyLogic";
import type { AlloyRecipe } from "@/types/alloys";
import type { CrucibleState } from "@/types/crucible";

interface ResultCardProps {
  evaluation: EvaluationResult;
  recipes: AlloyRecipe[];
  crucible: CrucibleState;
  onLoadPreset: (recipe: AlloyRecipe, ingotAmount: number) => void;
  onRecipeSelect: (recipe: AlloyRecipe | null) => void;
  selectedRecipe: AlloyRecipe | null;
  onCrucibleChange: (crucible: CrucibleState) => void;
}

export function ResultCard({
  evaluation,
  recipes,
  crucible,
  onLoadPreset,
  onRecipeSelect,
  selectedRecipe,
  onCrucibleChange
}: ResultCardProps) {
  const { totalUnits, totalNuggets, bestMatch } = evaluation;

  const [useEconomical, setUseEconomical] = useState(true);

  // Create a map for quick metal lookup
  const metalMap = useMemo(() => new Map(METALS.map((m) => [m.id, m])), []);

  // Calculate current ingot amount from crucible
  const currentIngotAmount = useMemo(() => {
    if (totalNuggets === 0) return 1;
    return Math.floor(totalNuggets / 20);
  }, [totalNuggets]);

  // Calculate max ingots for selected recipe using the maximization strategy
  const maxIngots = useMemo(() => {
    if (!selectedRecipe) return 25;
    const result = optimizeRecipe({
      recipe: selectedRecipe,
      mode: 'maximize',
    });
    return result.success ? result.ingotCount : 25;
  }, [selectedRecipe]);

  // Derive ingot amount from current crucible when recipe is selected
  const ingotAmount = useMemo(() => {
    if (selectedRecipe && currentIngotAmount > 0) {
      return Math.min(currentIngotAmount, maxIngots);
    }
    return 1;
  }, [selectedRecipe, currentIngotAmount, maxIngots]);

  // Calculate nugget adjustments for close match
  const nuggetAdjustments = useMemo(() => {
    if (!bestMatch || bestMatch.isExact) return [];
    return calculateNuggetAdjustments(evaluation.amounts, bestMatch.recipe, bestMatch.violations);
  }, [bestMatch, evaluation.amounts]);

  const adjustmentSummary = useMemo(() => {
    if (nuggetAdjustments.length === 0) return '';
    return getAdjustmentSummary(nuggetAdjustments, metalMap);
  }, [nuggetAdjustments, metalMap]);

  // Derive selected recipe ID from selectedRecipe prop
  const selectedRecipeId = selectedRecipe?.id || "";

  const handleAdjustToValid = () => {
    if (!bestMatch || nuggetAdjustments.length === 0) return;

    const adjustedCrucible = applyNuggetAdjustments(crucible, nuggetAdjustments);
    onCrucibleChange(adjustedCrucible);
    onRecipeSelect(bestMatch.recipe);
  };

  // Helper to get ingot image path
  const getIngotImage = (recipeId: string) => {
    return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
  };

  // Get color for alloy based on its primary metal
  const getAlloyColor = (recipeId: string): string => {
    const colorMap: Record<string, string> = {
      "tin-bronze": "#CD7F32", // Bronze color
      "bismuth-bronze": "#D4A574", // Light bronze
      "black-bronze": "#3B2F2F", // Dark bronze
      "brass": "#B5A642", // Brass yellow
      "molybdochalkos": "#5D6D7E", // Lead gray
      "lead-solder": "#5D6D7E", // Lead gray
      "silver-solder": "#C0C0C0", // Silver
      "cupronickel": "#8C9A9E", // Nickel gray
      "electrum": "#E5D68A", // Gold-silver mix
    };
    return colorMap[recipeId] || "#B87333"; // Default copper color
  };

  const handlePresetChange = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      onRecipeSelect(recipe);
      onLoadPreset(recipe, ingotAmount);
    }
  };

  const handleIngotChange = (value: number[]) => {
    const newAmount = value[0];
    if (selectedRecipe) {
      if (useEconomical) {
        // Use economical optimization when slider is moved and switch is enabled
        const result = optimizeRecipe({
          recipe: selectedRecipe,
          mode: 'economical',
          targetIngots: newAmount,
        });
        if (result.success && result.crucible) {
          onCrucibleChange(result.crucible);
        } else {
          // Fallback to preset if optimization fails
          onLoadPreset(selectedRecipe, newAmount);
        }
      } else {
        onLoadPreset(selectedRecipe, newAmount);
      }
    }
  };

  const handleMaximize = () => {
    if (!selectedRecipe) return;

    setUseEconomical(false);
    const result = optimizeRecipe({
      recipe: selectedRecipe,
      mode: 'maximize',
    });

    if (result.success && result.crucible) {
      onCrucibleChange(result.crucible);
    }
  };

  const handleEconomicalOptimize = () => {
    if (!selectedRecipe) return;

    const result = optimizeRecipe({
      recipe: selectedRecipe,
      mode: 'economical',
      targetIngots: ingotAmount,
    });

    if (result.success && result.crucible) {
      onCrucibleChange(result.crucible);
    }
  };

  // Render preset selector
  const renderPresetSelector = (label: string) => {
    const currentRecipe = recipes.find((r) => r.id === selectedRecipeId);

    return (
      <div className="space-y-3">
        <label htmlFor="preset-select" className="text-sm font-medium">
          {label}
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-[2]">
            <Select value={selectedRecipeId} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset-select" aria-label="Select alloy preset" className="h-12">
                <SelectValue placeholder="Choose an alloy...">
                  {currentRecipe && (
                    <div className="flex items-center gap-3">
                      <img
                        src={getIngotImage(currentRecipe.id)}
                        alt=""
                        className="w-8 h-8 object-contain"
                        aria-hidden="true"
                      />
                      <span className="text-base">{currentRecipe.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id} className="py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={getIngotImage(recipe.id)}
                        alt=""
                        className="w-8 h-8 object-contain"
                        aria-hidden="true"
                      />
                      <span className="text-base">{recipe.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Amount</span>
              <span className="font-medium text-foreground">{ingotAmount} ingot{ingotAmount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-2 items-center">
              <div
                className="flex-1"
                style={{
                  // @ts-expect-error - CSS custom property
                  '--slider-color': currentRecipe ? getAlloyColor(currentRecipe.id) : '#B87333'
                }}
              >
                <Slider
                  value={[ingotAmount]}
                  onValueChange={handleIngotChange}
                  min={1}
                  max={maxIngots}
                  step={1}
                  aria-label="Ingot amount"
                  disabled={!selectedRecipe}
                  className="[&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)]"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMaximize}
                disabled={!selectedRecipe}
                className="px-2"
                title="Maximize ingots"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {selectedRecipe && (
          <div className="flex items-center gap-2 text-sm">
            <Switch
              id="economical-mode"
              checked={useEconomical}
              onCheckedChange={setUseEconomical}
            />
            <label htmlFor="economical-mode" className="text-sm cursor-pointer">
              Use economical optimization
            </label>
            {useEconomical && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEconomicalOptimize}
                      className="h-8 w-8 p-0"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Optimize economically for {ingotAmount} ingot{ingotAmount !== 1 ? 's' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    );
  };

  // Empty state
  if (totalUnits === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Alloy Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert role="status" aria-live="polite">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Add metals to the crucible to see alloy results
            </AlertDescription>
          </Alert>

          {renderPresetSelector("Load Preset:")}
        </CardContent>
      </Card>
    );
  }

  // No match state
  if (!bestMatch) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Alloy Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              No known alloy from this composition
            </AlertDescription>
          </Alert>

          {renderPresetSelector("Load Preset:")}
        </CardContent>
      </Card>
    );
  }

  // Exact match state
  if (bestMatch.isExact) {
    const hasEnoughForIngot = totalUnits >= 100;
    const unitsNeeded = 100 - totalUnits;

    // Check if total units align with complete ingots
    const UNITS_PER_INGOT = 100;
    const completeIngots = Math.floor(totalUnits / UNITS_PER_INGOT);
    const excessUnits = totalUnits % UNITS_PER_INGOT;
    const hasExcessMaterial = excessUnits > 0;
    const excessNuggets = Math.floor(excessUnits / 5);

    // Calculate which metals have excess and what's needed for next ingot
    let excessMessage: React.ReactNode = '';
    if (hasExcessMaterial && hasEnoughForIngot) {
      // Check if n+1 ingots is possible first
      const canMakeNextIngot = completeIngots + 1 <= maxIngots;

      // Use optimizeRecipe to get the actual target amounts for complete ingots
      const currentIngotsResult = optimizeRecipe({
        recipe: bestMatch.recipe,
        mode: 'economical',
        targetIngots: completeIngots,
      });

      // Find which metals are contributing to the excess
      const excessMetals: Array<{ metalId: string; nuggets: number }> = [];

      if (currentIngotsResult.success && currentIngotsResult.crucible) {
        // Aggregate target crucible
        const targetAmounts = new Map<string, number>();
        for (const slot of currentIngotsResult.crucible.slots) {
          if (slot.metalId) {
            const current = targetAmounts.get(slot.metalId) || 0;
            targetAmounts.set(slot.metalId, current + slot.nuggets);
          }
        }

        // Compare with current amounts
        for (const component of bestMatch.recipe.components) {
          const currentAmount = evaluation.amounts.find(a => a.metalId === component.metalId);
          const currentNuggets = currentAmount?.nuggets || 0;
          const targetNuggets = targetAmounts.get(component.metalId) || 0;

          if (currentNuggets > targetNuggets) {
            const metal = metalMap.get(component.metalId);
            excessMetals.push({
              metalId: metal?.shortLabel || component.metalId,
              nuggets: currentNuggets - targetNuggets
            });
          }
        }
      }

      // Build the message
      const removeText = excessMetals.length > 0
        ? excessMetals.map(m => `${m.nuggets} ${m.metalId}`).join(' and ')
        : `${excessNuggets}`;


      if (canMakeNextIngot) {

        // Use optimizeRecipe to get the actual amounts needed for n+1 ingots
        const nextIngotsResult = optimizeRecipe({
          recipe: bestMatch.recipe,
          mode: 'economical',
          targetIngots: completeIngots + 1,
        });


        if (nextIngotsResult.success && nextIngotsResult.crucible) {
          // Aggregate target crucible for next ingot
          const nextTargetAmounts = new Map<string, number>();
          for (const slot of nextIngotsResult.crucible.slots) {
            if (slot.metalId) {
              const current = nextTargetAmounts.get(slot.metalId) || 0;
              nextTargetAmounts.set(slot.metalId, current + slot.nuggets);
            }
          }


          // Calculate which metals need to be added
          const addMetals: Array<{ metalId: string; nuggets: number }> = [];
          for (const component of bestMatch.recipe.components) {
            const currentAmount = evaluation.amounts.find(a => a.metalId === component.metalId);
            const currentNuggets = currentAmount?.nuggets || 0;
            const targetNuggets = nextTargetAmounts.get(component.metalId) || 0;

            console.log(`[ExcessMaterial] ${component.metalId}: current=${currentNuggets}, target=${targetNuggets}`);

            if (targetNuggets > currentNuggets) {
              const metal = metalMap.get(component.metalId);
              addMetals.push({
                metalId: metal?.shortLabel || component.metalId,
                nuggets: targetNuggets - currentNuggets
              });
            }
          }


          if (addMetals.length > 0) {
            const addText = addMetals.map(m => `${m.nuggets} ${m.metalId}`).join(' and ');
            const totalAddNuggets = addMetals.reduce((sum, m) => sum + m.nuggets, 0);

            excessMessage = (
              <>
                <span className="font-bold text-white">Remove {removeText} nugget{excessNuggets !== 1 ? 's' : ''}</span> ({excessUnits} units) or <span className="font-bold text-white">add {addText} nugget{totalAddNuggets !== 1 ? 's' : ''}</span> to make <span className="font-bold text-white">{completeIngots + 1} ingots</span>.
              </>
            );
          } else {
            // No metals need to be added (shouldn't happen but handle it)
            excessMessage = (
              <>
                <span className="font-bold text-white">Remove {removeText} nugget{excessNuggets !== 1 ? 's' : ''}</span> ({excessUnits} units) to make exactly <span className="font-bold text-white">{completeIngots} ingots</span>.
              </>
            );
          }
        } else {
          // Fallback: try using createPresetForAlloy instead
          const presetCrucible = createPresetForAlloy(bestMatch.recipe, completeIngots + 1);
          const presetAmounts = aggregateCrucible(presetCrucible);


          // Calculate which metals need to be added using preset
          const addMetals: Array<{ metalId: string; nuggets: number }> = [];
          for (const presetAmount of presetAmounts) {
            const currentAmount = evaluation.amounts.find(a => a.metalId === presetAmount.metalId);
            const currentNuggets = currentAmount?.nuggets || 0;

            if (presetAmount.nuggets > currentNuggets) {
              const metal = metalMap.get(presetAmount.metalId);
              addMetals.push({
                metalId: metal?.shortLabel || presetAmount.metalId,
                nuggets: presetAmount.nuggets - currentNuggets
              });
            }
          }


          if (addMetals.length > 0) {
            const addText = addMetals.map(m => `${m.nuggets} ${m.metalId}`).join(' and ');
            const totalAddNuggets = addMetals.reduce((sum, m) => sum + m.nuggets, 0);

            excessMessage = (
              <>
                <span className="font-bold text-white">Remove {removeText} nugget{excessNuggets !== 1 ? 's' : ''}</span> ({excessUnits} units) or <span className="font-bold text-white">add {addText} nugget{totalAddNuggets !== 1 ? 's' : ''}</span> to make <span className="font-bold text-white">{completeIngots + 1} ingots</span>.
              </>
            );
          } else {
            excessMessage = (
              <>
                <span className="font-bold text-white">Remove {removeText} nugget{excessNuggets !== 1 ? 's' : ''}</span> ({excessUnits} units) to make exactly <span className="font-bold text-white">{completeIngots} ingots</span>.
              </>
            );
          }
        }
      } else {
        excessMessage = (
          <>
            <span className="font-bold text-white">Remove {removeText} nugget{excessNuggets !== 1 ? 's' : ''}</span> ({excessUnits} units) to make exactly <span className="font-bold text-white">{completeIngots} ingots</span>.
          </>
        );
      }
    }

    return (
      <Card className="border-green-500/50 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              {bestMatch.recipe.name}
            </CardTitle>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              Valid alloy
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-500/50 bg-green-500/10" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              This composition creates a valid {bestMatch.recipe.name} alloy!
            </AlertDescription>
          </Alert>

          {!hasEnoughForIngot && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>Not enough material:</strong> You need {unitsNeeded} more units ({Math.ceil(unitsNeeded / 5)} nuggets) to make 1 ingot (100 units minimum).
              </AlertDescription>
            </Alert>
          )}

          {hasExcessMaterial && hasEnoughForIngot && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>Excess material:</strong> {excessMessage}
              </AlertDescription>
            </Alert>
          )}

          {renderPresetSelector("Load Different Preset:")}
        </CardContent>
      </Card>
    );
  }

  // Close match state (not exact)
  return (
    <Card className="border-orange-500/50 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
              Closest alloy: {bestMatch.recipe.name}
            </CardTitle>
            <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Not valid yet – adjust composition
            </p>
          </div>
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Not valid yet
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary hint with adjustment guidance */}
        {adjustmentSummary && (
          <Alert className="border-orange-500/50 bg-orange-500/10" role="status" aria-live="polite">
            <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              <strong>{adjustmentSummary}</strong> to create a valid {bestMatch.recipe.name} mix.
            </AlertDescription>
          </Alert>
        )}

        {renderPresetSelector("Load Different Preset:")}

        {/* Adjust to Valid button */}
        {nuggetAdjustments.length > 0 && (
          <Button
            onClick={handleAdjustToValid}
            className="w-full"
            size="lg"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Adjust to Valid {bestMatch.recipe.name}
          </Button>
        )}

        {/* Show contamination if present */}
        {bestMatch.violations.some((v) => !v.requiredMin && !v.requiredMax) && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Contamination detected:</strong> This alloy contains metals
              that shouldn't be present:{" "}
              {bestMatch.violations
                .filter((v) => !v.requiredMin && !v.requiredMax)
                .map((v) => metalMap.get(v.metalId)?.label)
                .join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
