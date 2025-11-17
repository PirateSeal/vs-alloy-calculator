import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CheckCircle2, AlertTriangle, XCircle, Info, Wand2 } from "lucide-react";
import { METALS } from "@/data/alloys";
import {
  calculateMaxIngots,
  calculateNuggetAdjustments,
  getAdjustmentSummary,
  applyNuggetAdjustments
} from "@/lib/alloyLogic";
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
  ratioLocked: boolean;
}

export function ResultCard({
  evaluation,
  recipes,
  crucible,
  onLoadPreset,
  onRecipeSelect,
  selectedRecipe,
  onCrucibleChange,
  ratioLocked
}: ResultCardProps) {
  const { totalUnits, totalNuggets, bestMatch } = evaluation;

  // Create a map for quick metal lookup
  const metalMap = useMemo(() => new Map(METALS.map((m) => [m.id, m])), []);

  // Calculate current ingot amount from crucible
  const currentIngotAmount = useMemo(() => {
    if (totalNuggets === 0) return 1;
    return Math.floor(totalNuggets / 20);
  }, [totalNuggets]);

  // Calculate max ingots for selected recipe
  const maxIngots = useMemo(() => {
    if (!selectedRecipe) return 25;
    return calculateMaxIngots(selectedRecipe);
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
      onLoadPreset(selectedRecipe, newAmount);
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
            <div
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
          </div>
        </div>
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

          {renderPresetSelector("Load Different Preset:")}

          <div>
            <h3 className="text-sm font-medium mb-2">Composition Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Metal</TableHead>
                  <TableHead scope="col">Required</TableHead>
                  <TableHead scope="col" className="text-right">Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestMatch.recipe.components.map((component) => {
                  const metal = metalMap.get(component.metalId);
                  const actualAmount = evaluation.amounts.find(
                    (a) => a.metalId === component.metalId
                  );
                  const actualPercent = actualAmount?.percent || 0;

                  return (
                    <TableRow key={component.metalId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={metal?.nuggetImage}
                            alt=""
                            className="w-4 h-4 object-contain"
                            aria-hidden="true"
                          />
                          {metal?.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.minPercent}% - {component.maxPercent}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {actualPercent.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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

        {/* Lock Ratio hint */}
        {ratioLocked && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" aria-hidden="true" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>Lock Ratio is enabled</strong> – Use the amount slider below to snap to a valid {bestMatch.recipe.name} mix.
            </AlertDescription>
          </Alert>
        )}

        {renderPresetSelector("Load Different Preset:")}

        <div>
          <h3 className="text-sm font-medium mb-2">Adjustments Needed</h3>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Metal</TableHead>
                  <TableHead scope="col">Required</TableHead>
                  <TableHead scope="col" className="text-right">Actual</TableHead>
                  <TableHead scope="col" className="text-right">Adjustment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestMatch.recipe.components.map((component) => {
                  const metal = metalMap.get(component.metalId);
                  const actualAmount = evaluation.amounts.find(
                    (a) => a.metalId === component.metalId
                  );
                  const actualPercent = actualAmount?.percent || 0;

                  const adjustment = nuggetAdjustments.find(
                    (adj) => adj.metalId === component.metalId
                  );

                  const violation = bestMatch.violations.find(
                    (v) => v.metalId === component.metalId
                  );

                  const isValid = !violation;
                  const isTooLow =
                    violation && actualPercent < (violation.requiredMin || 0);
                  const isTooHigh =
                    violation && actualPercent > (violation.requiredMax || 100);

                  const percentDiff = actualPercent - ((component.minPercent + component.maxPercent) / 2);

                  return (
                    <TableRow key={component.metalId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={metal?.nuggetImage}
                            alt=""
                            className="w-4 h-4 object-contain"
                            aria-hidden="true"
                          />
                          {metal?.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.minPercent}% - {component.maxPercent}%
                      </TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableCell
                            className={`text-right font-mono tabular-nums cursor-help ${
                              isValid
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {Math.round(actualPercent)}%
                          </TableCell>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{actualPercent.toFixed(1)}%</p>
                        </TooltipContent>
                      </Tooltip>
                      <TableCell className="text-right text-sm">
                        {isValid && (
                          <span className="text-green-600 dark:text-green-400" aria-label="Status: OK">
                            ✓ OK
                          </span>
                        )}
                        {isTooLow && adjustment && (
                          <span className="text-red-600 dark:text-red-400" aria-label={`Too low, add ${Math.abs(adjustment.delta)} nuggets`}>
                            Too low ({percentDiff.toFixed(1)}%) → add {Math.abs(adjustment.delta)} nuggets
                          </span>
                        )}
                        {isTooHigh && adjustment && (
                          <span className="text-orange-600 dark:text-orange-400" aria-label={`Too high, remove ${Math.abs(adjustment.delta)} nuggets`}>
                            Too high (+{percentDiff.toFixed(1)}%) → remove {Math.abs(adjustment.delta)} nuggets
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>

        {/* Adjust to Valid button */}
        {!ratioLocked && nuggetAdjustments.length > 0 && (
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
