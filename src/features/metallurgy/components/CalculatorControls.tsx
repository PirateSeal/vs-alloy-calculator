import { useMemo, useState } from "react";
import { Maximize2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import { optimizeRecipe } from "../lib/recipeOptimizer";
import { getAlloyColor, getIngotImage } from "../data/recipeAssets";
import type { EvaluationResult } from "../lib/alloyLogic";
import type { AlloyRecipe } from "../types/alloys";
import type { CrucibleState } from "../types/crucible";

interface CalculatorControlsProps {
  evaluation: EvaluationResult;
  recipes: AlloyRecipe[];
  selectedRecipe: AlloyRecipe | null;
  onLoadPreset: (recipe: AlloyRecipe, ingotAmount: number) => void;
  onRecipeSelect: (recipe: AlloyRecipe | null) => void;
  onCrucibleChange: (crucible: CrucibleState) => void;
}

export function CalculatorControls({
  evaluation,
  recipes,
  selectedRecipe,
  onLoadPreset,
  onRecipeSelect,
  onCrucibleChange,
}: CalculatorControlsProps) {
  const { t, getRecipeName } = useTranslation();
  const [useEconomical, setUseEconomical] = useState(true);
  const selectedRecipeId = selectedRecipe?.id || "";
  const controlsEnabled = Boolean(selectedRecipe);

  const currentIngotAmount = useMemo(() => {
    if (evaluation.totalNuggets === 0) return 1;
    return Math.floor(evaluation.totalNuggets / 20);
  }, [evaluation.totalNuggets]);

  const maxIngots = useMemo(() => {
    const recipe = selectedRecipe ?? evaluation.bestMatch?.recipe;
    if (!recipe) return 25;
    const result = optimizeRecipe({ recipe, mode: "maximize" });
    return result.success ? result.ingotCount : 25;
  }, [evaluation.bestMatch?.recipe, selectedRecipe]);

  const ingotAmount = useMemo(() => {
    if (selectedRecipe && currentIngotAmount > 0) {
      return Math.min(currentIngotAmount, maxIngots);
    }
    return 1;
  }, [selectedRecipe, currentIngotAmount, maxIngots]);

  const currentRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);

  const sliderStyle = useMemo(
    () =>
      ({
        "--slider-color": currentRecipe ? getAlloyColor(currentRecipe.id) : "#B87333",
      }) as React.CSSProperties,
    [currentRecipe],
  );

  const handlePresetChange = (recipeId: string) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;

    onRecipeSelect(recipe);
    onLoadPreset(recipe, ingotAmount);
    track("preset-loaded", { alloy: recipe.id });
  };

  const handleIngotChange = (value: number[]) => {
    const newAmount = value[0];
    if (!selectedRecipe) return;

    if (useEconomical) {
      const result = optimizeRecipe({
        recipe: selectedRecipe,
        mode: "economical",
        targetIngots: newAmount,
      });
      if (result.success && result.crucible) {
        onCrucibleChange(result.crucible);
        return;
      }

      return;
    }

    onLoadPreset(selectedRecipe, newAmount);
  };

  const handleMaximize = () => {
    if (!selectedRecipe) return;

    setUseEconomical(false);
    const result = optimizeRecipe({
      recipe: selectedRecipe,
      mode: "maximize",
    });

    if (result.success && result.crucible) {
      onCrucibleChange(result.crucible);
      track("optimize-clicked", {
        strategy: "maximize",
        alloy: selectedRecipe.id,
        ingotCount: result.ingotCount,
      });
    }
  };

  const handleEconomicalOptimize = () => {
    if (!selectedRecipe) return;

    const result = optimizeRecipe({
      recipe: selectedRecipe,
      mode: "economical",
      targetIngots: ingotAmount,
    });

    if (result.success && result.crucible) {
      onCrucibleChange(result.crucible);
      track("optimize-clicked", {
        strategy: "economical",
        alloy: selectedRecipe.id,
        targetIngots: ingotAmount,
      });
    }
  };

  return (
    <section
      className="rounded-[1.75rem] border border-border/35 bg-card/90 p-5 shadow-sm"
      aria-label={t("result.load_preset")}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto] xl:items-end">
        <div className="space-y-2">
          <label htmlFor="preset-select" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("result.load_preset")}
          </label>
          <Select value={selectedRecipeId} onValueChange={handlePresetChange}>
            <SelectTrigger
              id="preset-select"
              aria-label={t("result.choose_alloy")}
              className="h-12 w-full rounded-xl border-border/50 bg-background/70"
            >
              <SelectValue placeholder={t("result.choose_alloy")}>
                {currentRecipe && (
                  <div className="flex items-center gap-3">
                    <img
                      src={getIngotImage(currentRecipe.id)}
                      alt=""
                      className="h-8 w-8 object-contain"
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
                      className="h-8 w-8 object-contain"
                      aria-hidden="true"
                    />
                    <span className="text-base">{getRecipeName(recipe.id)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!controlsEnabled && (
            <p className="text-xs text-muted-foreground">
              {t("result.choose_alloy")}
            </p>
          )}
        </div>

        <div className={cn("space-y-2 transition-opacity", !controlsEnabled && "opacity-45")}>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("result.amount")}</span>
            <span className="font-medium text-foreground">
              {ingotAmount === 1
                ? t("result.ingots", { n: 1 })
                : t("result.ingots_plural", { n: ingotAmount })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex min-h-[44px] flex-1 items-center"
              style={sliderStyle}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMaximize}
                    disabled={!selectedRecipe}
                    className="h-11 w-11 px-2"
                    title={t("result.maximize_title")}
                  >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("result.maximize_title")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-12 flex-wrap items-center gap-3 rounded-2xl bg-background/35 p-3 ring-1 ring-inset ring-border/25 transition-opacity",
            !controlsEnabled && "opacity-45",
          )}
        >
          <Switch id="economical-mode" checked={useEconomical} onCheckedChange={setUseEconomical} disabled={!selectedRecipe} />
          <label htmlFor="economical-mode" className={cn("text-sm", controlsEnabled && "cursor-pointer")}>
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
                    disabled={!selectedRecipe}
                    className="ml-auto h-11 w-11 p-0"
                  >
                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {ingotAmount === 1
                      ? t("result.economical_tooltip", { n: 1 })
                      : t("result.economical_tooltip_plural", { n: ingotAmount })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </section>
  );
}
