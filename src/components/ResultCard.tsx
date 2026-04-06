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
import { CheckCircle2, AlertTriangle, XCircle, Info, Wand2, Maximize2, Thermometer } from "lucide-react";
import {
  calculateNuggetAdjustments,
  applyNuggetAdjustments,
  createPresetForAlloy,
} from "@/lib/alloyLogic";
import { optimizeRecipe } from "@/lib/recipeOptimizer";
import { track } from "@/lib/analytics";
import { Switch } from "@/components/ui/switch";
import type { EvaluationResult, NuggetAdjustment } from "@/lib/alloyLogic";
import type { AlloyRecipe, MetalId } from "@/types/alloys";
import type { CrucibleState } from "@/types/crucible";
import { useTranslation } from "@/i18n";

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

function joinLocalizedList(items: string[], conjunction: string): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  const head = items.slice(0, -1).join(", ");
  return `${head} ${conjunction} ${items[items.length - 1]}`;
}

function formatIngotCount(t: TranslateFn, count: number): string {
  return count === 1
    ? t("result.ingots", { n: count })
    : t("result.ingots_plural", { n: count });
}

function formatAdjustmentAction(
  t: TranslateFn,
  action: "add" | "remove",
  count: number,
  metal: string,
): string {
  const nuggets = t(count === 1 ? "common.nugget" : "common.nuggets");
  return t(
    action === "add" ? "result.adjust_action_add" : "result.adjust_action_remove",
    { count, metal, nuggets },
  ).replace(/\s+/g, " ").trim();
}

function getLocalizedAdjustmentSummary(
  adjustments: NuggetAdjustment[],
  t: TranslateFn,
  getMetalShortLabel: (metalId: MetalId) => string,
): string {
  const parts = adjustments.flatMap((adjustment) => {
    if (adjustment.action === "ok") {
      return [];
    }

    return [
      formatAdjustmentAction(
        t,
        adjustment.action,
        Math.abs(adjustment.delta),
        getMetalShortLabel(adjustment.metalId),
      ),
    ];
  });

  return joinLocalizedList(parts, t("common.and"));
}

/**
 * Computes a JSX message describing excess material in the crucible
 * and how to fix it (remove nuggets or add to reach next ingot).
 */
function computeExcessMessage(
  bestMatch: EvaluationResult["bestMatch"],
  evaluation: EvaluationResult,
  maxIngots: number,
  t: TranslateFn,
  getMetalShortLabel: (metalId: MetalId) => string,
): React.ReactNode {
  if (!bestMatch || !bestMatch.isExact) return null;

  const UNITS_PER_INGOT = 100;
  const { totalUnits } = evaluation;
  const completeIngots = Math.floor(totalUnits / UNITS_PER_INGOT);
  const excessUnits = totalUnits % UNITS_PER_INGOT;
  const excessNuggets = Math.floor(excessUnits / 5);

  if (excessUnits === 0 || totalUnits < 100) return null;

  // Compute per-metal excess vs the clean target for completeIngots
  const currentIngotsResult = optimizeRecipe({
    recipe: bestMatch.recipe,
    mode: "economical",
    targetIngots: completeIngots,
  });

  const excessMetals: Array<{ label: string; nuggets: number }> = [];
  if (currentIngotsResult.success && currentIngotsResult.crucible) {
    const targetAmounts = new Map<string, number>();
    for (const slot of currentIngotsResult.crucible.slots) {
      if (slot.metalId) {
        targetAmounts.set(slot.metalId, (targetAmounts.get(slot.metalId) || 0) + slot.nuggets);
      }
    }
    for (const component of bestMatch.recipe.components) {
      const current = evaluation.amounts.find(a => a.metalId === component.metalId)?.nuggets || 0;
      const target = targetAmounts.get(component.metalId) || 0;
      if (current > target) {
        excessMetals.push({
          label: getMetalShortLabel(component.metalId),
          nuggets: current - target,
        });
      }
    }
  }

  const removeText = excessMetals.length > 0
    ? joinLocalizedList(
        excessMetals.map((metal) =>
          formatAdjustmentAction(t, "remove", metal.nuggets, metal.label),
        ),
        t("common.and"),
      )
    : formatAdjustmentAction(t, "remove", excessNuggets, "");

  // Check if we can make one more ingot
  const canMakeNextIngot = completeIngots + 1 <= maxIngots;
  if (!canMakeNextIngot) {
    return (
      <>
        <span className="font-bold text-white">
          {t("result.excess_remove_only", {
            remove: removeText,
            units: excessUnits,
            unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
            ingots: formatIngotCount(t, completeIngots),
          })}
        </span>
      </>
    );
  }

  // Compute what metals to add for n+1 ingots
  const nextResult = optimizeRecipe({
    recipe: bestMatch.recipe,
    mode: "economical",
    targetIngots: completeIngots + 1,
  });

  let nextCrucible = nextResult.success ? nextResult.crucible : null;
  if (!nextCrucible) {
    nextCrucible = createPresetForAlloy(bestMatch.recipe, completeIngots + 1);
  }

  const addMetals: Array<{ label: string; nuggets: number }> = [];
  if (nextCrucible) {
    const nextTargetAmounts = new Map<string, number>();
    for (const slot of nextCrucible.slots) {
      if (slot.metalId) {
        nextTargetAmounts.set(slot.metalId, (nextTargetAmounts.get(slot.metalId) || 0) + slot.nuggets);
      }
    }
    for (const component of bestMatch.recipe.components) {
      const current = evaluation.amounts.find(a => a.metalId === component.metalId)?.nuggets || 0;
      const target = nextTargetAmounts.get(component.metalId) || 0;
      if (target > current) {
        addMetals.push({
          label: getMetalShortLabel(component.metalId),
          nuggets: target - current,
        });
      }
    }
  }

  if (addMetals.length > 0) {
    const addText = joinLocalizedList(
      addMetals.map((metal) =>
        formatAdjustmentAction(t, "add", metal.nuggets, metal.label),
      ),
      t("common.and"),
    );
    return (
      <>
        <span className="font-bold text-white">
          {t("result.excess_remove_or_add", {
            remove: removeText,
            units: excessUnits,
            unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
            add: addText,
            ingots: formatIngotCount(t, completeIngots + 1),
          })}
        </span>
      </>
    );
  }

  return (
    <>
      <span className="font-bold text-white">
        {t("result.excess_remove_only", {
          remove: removeText,
          units: excessUnits,
          unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
          ingots: formatIngotCount(t, completeIngots),
        })}
      </span>
    </>
  );
}

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
  const { t, getMetalLabel, getMetalShortLabel, getRecipeName } = useTranslation();

  const [useEconomical, setUseEconomical] = useState(true);

  // Calculate current ingot amount from crucible
  const currentIngotAmount = useMemo(() => {
    if (totalNuggets === 0) return 1;
    return Math.floor(totalNuggets / 20);
  }, [totalNuggets]);

  // Calculate max ingots for selected recipe using the maximization strategy
  const maxIngots = useMemo(() => {
    const recipe = selectedRecipe ?? bestMatch?.recipe;
    if (!recipe) return 25;
    const result = optimizeRecipe({
      recipe,
      mode: 'maximize',
    });
    return result.success ? result.ingotCount : 25;
  }, [bestMatch?.recipe, selectedRecipe]);

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
    return getLocalizedAdjustmentSummary(nuggetAdjustments, t, getMetalShortLabel);
  }, [getMetalShortLabel, nuggetAdjustments, t]);

  // Derive selected recipe ID from selectedRecipe prop
  const selectedRecipeId = selectedRecipe?.id || "";

  const handleAdjustToValid = () => {
    if (!bestMatch || nuggetAdjustments.length === 0) return;

    const adjustedCrucible = applyNuggetAdjustments(crucible, nuggetAdjustments);
    onCrucibleChange(adjustedCrucible);
    onRecipeSelect(bestMatch.recipe);
    track("adjust-clicked", { alloy: bestMatch.recipe.id });
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
      track("preset-loaded", { alloy: recipe.id });
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
      track("optimize-clicked", { strategy: "maximize", alloy: selectedRecipe.id, ingotCount: result.ingotCount });
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
      track("optimize-clicked", { strategy: "economical", alloy: selectedRecipe.id, targetIngots: ingotAmount });
    }
  };

  // Render preset selector
  const renderPresetSelector = (label: string) => {
    const currentRecipe = recipes.find((r) => r.id === selectedRecipeId);

    return (
      <div className="space-y-3">
        <label htmlFor="preset-select" className="text-sm font-medium">
          {t(label)}
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-[2]">
            <Select value={selectedRecipeId} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset-select" aria-label={t("result.choose_alloy")} className="h-12">
                <SelectValue placeholder={t("result.choose_alloy")}>
                  {currentRecipe && (
                    <div className="flex items-center gap-3">
                      <img
                        src={getIngotImage(currentRecipe.id)}
                        alt=""
                        className="w-8 h-8 object-contain"
                        aria-hidden="true"
                      />
                      <span className="text-base">{getRecipeName(currentRecipe.id)}</span>
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
                      <span className="text-base">{getRecipeName(recipe.id)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("result.amount")}</span>
              <span className="font-medium text-foreground">
                {ingotAmount === 1 ? t("result.ingots", { n: 1 }) : t("result.ingots_plural", { n: ingotAmount })}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <div
                className="flex-1 flex items-center min-h-[44px]"
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
                  aria-label={t("result.ingot_amount_aria")}
                  disabled={!selectedRecipe}
                  className="w-full [&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)]"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMaximize}
                disabled={!selectedRecipe}
                className="px-2"
                title={t("result.maximize_title")}
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
              {t("result.economical_label")}
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
                    <p>{ingotAmount === 1 ? t("result.economical_tooltip", { n: 1 }) : t("result.economical_tooltip_plural", { n: ingotAmount })}</p>
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
          <CardTitle>{t("result.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert role="status" aria-live="polite">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {t("result.empty")}
            </AlertDescription>
          </Alert>

          {renderPresetSelector("result.load_preset")}
        </CardContent>
      </Card>
    );
  }

  // No match state
  if (!bestMatch) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>{t("result.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {t("result.no_match")}
            </AlertDescription>
          </Alert>

          {renderPresetSelector("result.load_preset")}
        </CardContent>
      </Card>
    );
  }

  // Exact match state
  if (bestMatch.isExact) {
    const hasEnoughForIngot = totalUnits >= 100;
    const unitsNeeded = 100 - totalUnits;
    const excessUnits = totalUnits % 100;
    const hasExcessMaterial = excessUnits > 0;
    const excessMessage = computeExcessMessage(bestMatch, evaluation, maxIngots, t, getMetalShortLabel);

    return (
      <Card className="border-green-500/50 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
                {getRecipeName(bestMatch.recipe.id)}
              </CardTitle>
              {bestMatch.recipe.meltTempC && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3" aria-hidden="true" />
                  {t("result.melts_at", { temp: bestMatch.recipe.meltTempC })}
                </span>
              )}
            </div>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              {t("result.valid_badge")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-500/50 bg-green-500/10" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              {t("result.valid_message", { alloy: getRecipeName(bestMatch.recipe.id) })}
            </AlertDescription>
          </Alert>

          {!hasEnoughForIngot && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                {t("result.not_enough", { units: unitsNeeded, nuggets: Math.ceil(unitsNeeded / 5) })}
              </AlertDescription>
            </Alert>
          )}

          {hasExcessMaterial && hasEnoughForIngot && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>{t("result.excess_label")}</strong> {excessMessage}
              </AlertDescription>
            </Alert>
          )}

          {renderPresetSelector("result.load_different")}
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
              {t("result.closest", { alloy: getRecipeName(bestMatch.recipe.id) })}
            </CardTitle>
            <div className="flex items-center gap-3">
              <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                {t("result.not_valid_subtitle")}
              </p>
              {bestMatch.recipe.meltTempC && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3" aria-hidden="true" />
                  {t("result.temp_short", { temp: bestMatch.recipe.meltTempC })}
                </span>
              )}
            </div>
          </div>
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            {t("result.not_valid_badge")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary hint with adjustment guidance */}
        {adjustmentSummary && (
          <Alert className="border-orange-500/50 bg-orange-500/10" role="status" aria-live="polite">
            <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              <strong>{t("result.valid_mix_hint", {
                summary: adjustmentSummary,
                alloy: getRecipeName(bestMatch.recipe.id),
              })}</strong>
            </AlertDescription>
          </Alert>
        )}

        {renderPresetSelector("result.load_different")}

        {/* Adjust to Valid button */}
        {nuggetAdjustments.length > 0 && (
          <Button
            onClick={handleAdjustToValid}
            className="w-full"
            size="lg"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {t("result.adjust_button", { alloy: getRecipeName(bestMatch.recipe.id) })}
          </Button>
        )}

        {/* Show contamination if present */}
        {bestMatch.violations.some((v) => !v.requiredMin && !v.requiredMax) && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {t("result.contamination", {
                metals: bestMatch.violations
                  .filter((v) => !v.requiredMin && !v.requiredMax)
                  .map((v) => getMetalLabel(v.metalId))
                  .join(", ")
              })}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
