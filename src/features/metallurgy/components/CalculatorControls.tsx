import { useMemo, useState } from "react";
import { Maximize2, Wand2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

type OptimizationMode = "economical" | "maximize";

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
  const mode: OptimizationMode = useEconomical ? "economical" : "maximize";

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
  const accentColor = currentRecipe ? getAlloyColor(currentRecipe.id) : "#B87333";

  const sliderStyle = useMemo(
    () =>
      ({
        "--slider-color": accentColor,
      }) as React.CSSProperties,
    [accentColor],
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

  const runMaximize = () => {
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

  const runEconomical = () => {
    if (!selectedRecipe) return;

    setUseEconomical(true);
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

  const handleModeChange = (value: string) => {
    if (!value || value === mode) return;
    if (value === "maximize") runMaximize();
    else runEconomical();
  };

  const ingotLabel =
    ingotAmount === 1
      ? t("result.ingots", { n: 1 })
      : t("result.ingots_plural", { n: ingotAmount });
  const sliderDisabled = !selectedRecipe || mode === "maximize";

  return (
    <section
      className="surface-panel overflow-hidden rounded-[1.9rem] border border-border/35 bg-card/92"
      aria-label={t("result.load_preset")}
    >
      <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(143,103,62,0.08),transparent_34%)]" />

        <div className="relative flex flex-col gap-5">
          <Select value={selectedRecipeId} onValueChange={handlePresetChange}>
            <SelectTrigger
              id="preset-select"
              aria-label={t("result.choose_alloy")}
              className="relative h-20 w-full overflow-hidden rounded-[1.5rem] border-0 bg-background/70 px-5 ring-1 ring-inset ring-border/30 transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-background/82 focus-visible:ring-primary/45 active:scale-[0.995] motion-reduce:active:scale-100 [&_svg]:size-5 [&_svg]:text-muted-foreground"
            >
              <SelectValue
                placeholder={
                  <span className="flex w-full items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/55 text-muted-foreground">
                      <Wand2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("result.load_preset")}
                      </span>
                      <span className="text-base text-muted-foreground/85">
                        {t("result.choose_alloy")}
                      </span>
                    </span>
                  </span>
                }
              >
                {currentRecipe && (
                  <span className="flex w-full items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <img
                      src={getIngotImage(currentRecipe.id)}
                      alt=""
                      className="image-outline size-11 rounded-xl bg-background/85 p-1 object-contain"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("result.load_preset")}
                      </span>
                      <span className="truncate text-balance text-lg font-semibold leading-tight text-foreground">
                        {getRecipeName(currentRecipe.id)}
                      </span>
                    </span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id} className="py-2">
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getAlloyColor(recipe.id) }}
                    />
                    <img
                      src={getIngotImage(recipe.id)}
                      alt=""
                      className="image-outline h-8 w-8 rounded-lg bg-background/75 p-1 object-contain"
                      aria-hidden="true"
                    />
                    <span className="text-base">{getRecipeName(recipe.id)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            className={cn(
              "surface-subtle flex flex-col gap-4 rounded-[1.5rem] bg-background/45 p-4 ring-1 ring-inset ring-border/25 transition-[opacity] duration-200 sm:p-5",
              !controlsEnabled && "opacity-55",
            )}
          >
            <div className="flex items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <Label
                  htmlFor="amount-slider"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {t("result.amount")}
                </Label>
                <p className="text-balance text-3xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                  {ingotLabel}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("planner.target.max_craftable", { n: maxIngots })}
              </span>
            </div>

            <div className="flex min-h-[44px] items-center" style={sliderStyle}>
              <Slider
                id="amount-slider"
                value={[ingotAmount]}
                onValueChange={handleIngotChange}
                min={1}
                max={maxIngots}
                step={1}
                aria-label={t("result.ingot_amount_aria")}
                disabled={sliderDisabled}
                className="w-full [&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)]"
              />
            </div>

            <Separator className="bg-border/30" />

            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={handleModeChange}
              disabled={!controlsEnabled}
              className="grid w-full grid-cols-2 gap-2"
              aria-label={t("result.load_preset")}
            >
              <ToggleGroupItem
                value="economical"
                variant="outline"
                className="h-11 gap-2 rounded-full border-border/45 bg-background/55 px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:active:scale-100 data-[state=on]:border-primary/60 data-[state=on]:bg-primary/15 data-[state=on]:text-foreground"
              >
                <Wand2 data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
                {t("result.economical_label")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="maximize"
                variant="outline"
                className="h-11 gap-2 rounded-full border-border/45 bg-background/55 px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:active:scale-100 data-[state=on]:border-primary/60 data-[state=on]:bg-primary/15 data-[state=on]:text-foreground"
              >
                <Maximize2 data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
                {t("result.maximize_title")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
