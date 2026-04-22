import { useMemo, useState } from "react";
import { Maximize2, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
      className="surface-panel overflow-hidden rounded-[1.9rem] border border-border/35 bg-card/92"
      aria-label={t("result.load_preset")}
    >
      <div className="relative overflow-hidden px-5 py-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(143,103,62,0.08),transparent_34%)]" />
        <div className="relative space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/90">
                {t("result.load_preset")}
              </p>
              {controlsEnabled ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  · {t("planner.target.max_craftable", { n: maxIngots })}
                </span>
              ) : null}
            </div>

            <div
              className={cn(
                "surface-subtle flex min-h-12 flex-wrap items-center gap-3 rounded-[1.4rem] bg-background/45 p-3 ring-1 ring-inset ring-border/25 transition-opacity",
                !controlsEnabled && "opacity-45",
              )}
            >
              <Switch
                id="economical-mode"
                checked={useEconomical}
                onCheckedChange={setUseEconomical}
                disabled={!selectedRecipe}
              />
              <Label
                htmlFor="economical-mode"
                className={cn(controlsEnabled && "cursor-pointer")}
              >
                {t("result.economical_label")}
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEconomicalOptimize}
                disabled={!selectedRecipe || !useEconomical}
                className="ml-auto rounded-full px-3"
              >
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                {t("planner.mode.economical")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
            <div className="surface-subtle flex flex-col gap-2 rounded-[1.5rem] bg-background/42 p-4 ring-1 ring-inset ring-border/25">
              <Label
                htmlFor="preset-select"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                {t("result.choose_alloy")}
              </Label>
              <Select value={selectedRecipeId} onValueChange={handlePresetChange}>
                <SelectTrigger
                  id="preset-select"
                  aria-label={t("result.choose_alloy")}
                  className="h-14 w-full rounded-[1rem] border-border/50 bg-background/78"
                >
                  <SelectValue placeholder={t("result.choose_alloy")}>
                    {currentRecipe && (
                      <div className="flex items-center gap-3">
                        <img
                          src={getIngotImage(currentRecipe.id)}
                          alt=""
                          className="image-outline h-9 w-9 rounded-xl bg-background/75 p-1.5 object-contain"
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
                          className="image-outline h-8 w-8 rounded-lg bg-background/75 p-1 object-contain"
                          aria-hidden="true"
                        />
                        <span className="text-base">{getRecipeName(recipe.id)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!controlsEnabled && (
                <p className="text-xs text-muted-foreground" data-pretty-text>
                  {t("result.choose_alloy")}
                </p>
              )}
            </div>

            <div className={cn("surface-subtle rounded-[1.5rem] bg-background/42 p-4 ring-1 ring-inset ring-border/25 transition-opacity", !controlsEnabled && "opacity-45")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("result.amount")}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {ingotAmount === 1
                      ? t("result.ingots", { n: 1 })
                      : t("result.ingots_plural", { n: ingotAmount })}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full bg-background/72 px-3 py-1 ring-1 ring-inset ring-border/25">
                  {t("planner.target.max_craftable", { n: maxIngots })}
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex min-h-[44px] flex-1 items-center" style={sliderStyle}>
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
                  className="h-11 rounded-full px-3"
                  title={t("result.maximize_title")}
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("result.maximize_title")}</span>
                </Button>
              </div>
            </div>
          </div>

          {controlsEnabled && currentRecipe ? (
            <div className="surface-subtle flex flex-wrap items-center gap-3 rounded-[1.4rem] bg-background/35 p-3 ring-1 ring-inset ring-border/20">
              <img
                src={getIngotImage(currentRecipe.id)}
                alt=""
                className="image-outline h-10 w-10 rounded-2xl bg-background/75 p-1.5 object-contain"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{getRecipeName(currentRecipe.id)}</p>
                <p className="text-xs text-muted-foreground" data-pretty-text>
                  {useEconomical ? t("result.economical_label") : t("result.maximize_title")}
                </p>
              </div>
              <Badge className="gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {ingotAmount === 1
                  ? t("result.ingots", { n: 1 })
                  : t("result.ingots_plural", { n: ingotAmount })}
              </Badge>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
