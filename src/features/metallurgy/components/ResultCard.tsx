import { memo, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  FlameKindling,
  Info,
  Thermometer,
  Wand2,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import {
  applyNuggetAdjustments,
  calculateNuggetAdjustments,
  createPresetForAlloy,
} from "../lib/alloyLogic";
import { optimizeRecipe } from "../lib/recipeOptimizer";
import type { EvaluationResult, NuggetAdjustment } from "../lib/alloyLogic";
import type { AlloyRecipe, MetalId } from "../types/alloys";
import type { CrucibleState } from "../types/crucible";

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;
type StatusTone = "success" | "warning" | "destructive" | "neutral";

function joinLocalizedList(items: string[], conjunction: string): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

function formatIngotCount(t: TranslateFn, count: number): string {
  return count === 1 ? t("result.ingots", { n: count }) : t("result.ingots_plural", { n: count });
}

function formatAdjustmentAction(
  t: TranslateFn,
  action: "add" | "remove",
  count: number,
  metal: string,
) {
  return t(
    action === "add" ? "result.adjust_action_add" : "result.adjust_action_remove",
    { count, metal, nuggets: t(count === 1 ? "common.nugget" : "common.nuggets") },
  ).replace(/\s+/g, " ").trim();
}

function getLocalizedAdjustmentSummary(
  adjustments: NuggetAdjustment[],
  t: TranslateFn,
  getMetalShortLabel: (metalId: MetalId) => string,
) {
  const parts = adjustments.flatMap((adjustment) => {
    if (adjustment.action === "ok") return [];
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

function computeExcessMessage(
  bestMatch: EvaluationResult["bestMatch"],
  evaluation: EvaluationResult,
  maxIngots: number,
  t: TranslateFn,
  getMetalShortLabel: (metalId: MetalId) => string,
): React.ReactNode {
  if (!bestMatch || !bestMatch.isExact) return null;

  const UNITS_PER_INGOT = 100;
  const completeIngots = Math.floor(evaluation.totalUnits / UNITS_PER_INGOT);
  const excessUnits = evaluation.totalUnits % UNITS_PER_INGOT;
  const excessNuggets = Math.floor(excessUnits / 5);
  if (excessUnits === 0 || evaluation.totalUnits < 100) return null;

  const economicalResult = optimizeRecipe({
    recipe: bestMatch.recipe,
    mode: "economical",
    targetIngots: completeIngots,
  });

  const excessMetals: Array<{ label: string; nuggets: number }> = [];
  if (economicalResult.success && economicalResult.crucible) {
    const targetAmounts = new Map<string, number>();
    for (const slot of economicalResult.crucible.slots) {
      if (slot.metalId) {
        targetAmounts.set(slot.metalId, (targetAmounts.get(slot.metalId) || 0) + slot.nuggets);
      }
    }
    for (const component of bestMatch.recipe.components) {
      const current = evaluation.amounts.find((amount) => amount.metalId === component.metalId)?.nuggets || 0;
      const target = targetAmounts.get(component.metalId) || 0;
      if (current > target) {
        excessMetals.push({
          label: getMetalShortLabel(component.metalId),
          nuggets: current - target,
        });
      }
    }
  }

  const removeText =
    excessMetals.length > 0
      ? joinLocalizedList(
          excessMetals.map((metal) => formatAdjustmentAction(t, "remove", metal.nuggets, metal.label)),
          t("common.and"),
        )
      : formatAdjustmentAction(t, "remove", excessNuggets, "");

  const canMakeNextIngot = completeIngots + 1 <= maxIngots;
  if (!canMakeNextIngot) {
    return (
      <span className="font-semibold text-foreground">
        {t("result.excess_remove_only", {
          remove: removeText,
          units: excessUnits,
          unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
          ingots: formatIngotCount(t, completeIngots),
        })}
      </span>
    );
  }

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
      const current = evaluation.amounts.find((amount) => amount.metalId === component.metalId)?.nuggets || 0;
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
      addMetals.map((metal) => formatAdjustmentAction(t, "add", metal.nuggets, metal.label)),
      t("common.and"),
    );
    return (
      <span className="font-semibold text-foreground">
        {t("result.excess_remove_or_add", {
          remove: removeText,
          units: excessUnits,
          unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
          add: addText,
          ingots: formatIngotCount(t, completeIngots + 1),
        })}
      </span>
    );
  }

  return (
    <span className="font-semibold text-foreground">
      {t("result.excess_remove_only", {
        remove: removeText,
        units: excessUnits,
        unitsLabel: t(excessUnits === 1 ? "common.unit" : "common.units"),
        ingots: formatIngotCount(t, completeIngots),
      })}
    </span>
  );
}

interface ResultCardProps {
  evaluation: EvaluationResult;
  crucible: CrucibleState;
  onRecipeSelect: (recipe: AlloyRecipe | null) => void;
  selectedRecipe: AlloyRecipe | null;
  onCrucibleChange: (crucible: CrucibleState) => void;
}

export const ResultCard = memo(function ResultCard({
  evaluation,
  crucible,
  onRecipeSelect,
  selectedRecipe,
  onCrucibleChange,
}: ResultCardProps) {
  const { totalUnits, totalNuggets, bestMatch } = evaluation;
  const { t, getMetalLabel, getMetalShortLabel, getRecipeName } = useTranslation();
  const isEmpty = totalUnits === 0;
  const maxIngots = useMemo(() => {
    const recipe = selectedRecipe ?? bestMatch?.recipe;
    if (!recipe) return 25;
    const result = optimizeRecipe({ recipe, mode: "maximize" });
    return result.success ? result.ingotCount : 25;
  }, [bestMatch?.recipe, selectedRecipe]);

  const nuggetAdjustments = useMemo(() => {
    if (!bestMatch || bestMatch.isExact) return [];
    return calculateNuggetAdjustments(evaluation.amounts, bestMatch.recipe, bestMatch.violations);
  }, [bestMatch, evaluation.amounts]);

  const adjustmentSummary = useMemo(() => {
    if (nuggetAdjustments.length === 0) return "";
    return getLocalizedAdjustmentSummary(nuggetAdjustments, t, getMetalShortLabel);
  }, [getMetalShortLabel, nuggetAdjustments, t]);

  const productRecipe = bestMatch?.recipe ?? selectedRecipe ?? null;
  const productName = productRecipe ? getRecipeName(productRecipe.id) : t("result.title");
  const productTemperature = productRecipe?.meltTempC ?? null;
  const contaminationViolations = bestMatch?.violations.filter((v) => !v.requiredMin && !v.requiredMax) ?? [];
  const hasContamination = contaminationViolations.length > 0;
  const excessMessage = useMemo(
    () => computeExcessMessage(bestMatch, evaluation, maxIngots, t, getMetalShortLabel),
    [bestMatch, evaluation, getMetalShortLabel, maxIngots, t],
  );

  const status = useMemo(() => {
    if (isEmpty) {
      return {
        tone: "neutral" as StatusTone,
        label: t("result.empty"),
        icon: <Info className="h-4 w-4" aria-hidden="true" />,
        summary: t("result.empty"),
      };
    }

    if (bestMatch?.isExact) {
      return {
        tone: "success" as StatusTone,
        label: t("result.valid_badge"),
        icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
        summary: t("result.valid_message", { alloy: productName }),
      };
    }

    if (bestMatch) {
      return {
        tone: "warning" as StatusTone,
        label: t("result.not_valid_badge"),
        icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
        summary: adjustmentSummary || t("result.not_valid_subtitle"),
      };
    }

    return {
      tone: "destructive" as StatusTone,
      label: t("result.no_match"),
      icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
      summary: t("result.no_match"),
    };
  }, [adjustmentSummary, bestMatch, isEmpty, productName, t]);

  const toneClasses = {
    success: "border-success/25 bg-card/90",
    warning: "border-primary/25 bg-card/90",
    destructive: "border-destructive/25 bg-card/90",
    neutral: "border-border/35 bg-card/90",
  }[status.tone];

  const badgeClasses = {
    success: "bg-secondary text-secondary-foreground",
    warning: "bg-primary/15 text-foreground",
    destructive: "bg-destructive/15 text-foreground",
    neutral: "bg-background/65 text-foreground",
  }[status.tone];

  const heroLead =
    isEmpty
      ? t("result.empty")
      : bestMatch?.isExact
        ? t("result.valid_message", { alloy: productName })
        : bestMatch
          ? adjustmentSummary || t("result.not_valid_subtitle")
          : t("result.no_match");
  const unitsNeeded = Math.max(0, 100 - totalUnits);

  const handleAdjustToValid = () => {
    if (!bestMatch || nuggetAdjustments.length === 0) return;

    const adjustedCrucible = applyNuggetAdjustments(crucible, nuggetAdjustments);
    onCrucibleChange(adjustedCrucible);
    onRecipeSelect(bestMatch.recipe);
    track("adjust-clicked", { alloy: bestMatch.recipe.id });
  };

  return (
    <Card className={`animate-surface-in animate-delay-2 overflow-hidden rounded-[1.75rem] border shadow-sm ${toneClasses}`}>
      <div className={`relative ${isEmpty ? "min-h-[12.5rem]" : "min-h-[22rem]"}`}>
        <>
          <img
            src="/crucible.png"
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${isEmpty ? "opacity-30 saturate-50" : "opacity-85"}`}
            aria-hidden="true"
          />
          <div
            className={`absolute inset-0 ${isEmpty ? "bg-gradient-to-t from-background via-background/92 to-background/72" : "bg-gradient-to-t from-background via-background/60 to-background/10"}`}
          />
        </>
        <div
          className={`relative flex flex-col justify-between p-5 sm:p-6 ${isEmpty ? "min-h-[12.5rem]" : "min-h-[22rem]"}`}
        >
          <div className="flex flex-wrap gap-2">
            <Badge className={badgeClasses}>
              <span className="mr-1.5 inline-flex items-center">{status.icon}</span>
              {status.label}
            </Badge>
            {productTemperature && (
              <Badge variant="outline" className="border-border/50 bg-background/70">
                <Thermometer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t("result.melts_at", { temp: productTemperature })}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
              {t("result.current_product")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {isEmpty ? t("composition.empty") : productName}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {heroLead}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/65 px-3 py-1.5">
                <FlameKindling className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="font-mono tabular-nums text-foreground">{totalNuggets}</span>
                {t(totalNuggets === 1 ? "common.nugget" : "common.nuggets")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/65 px-3 py-1.5">
                <span className="font-mono tabular-nums text-foreground">{totalUnits}</span>
                {t(totalUnits === 1 ? "common.unit" : "common.units")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isEmpty && (
      <CardContent className="space-y-4 border-t border-border/30 bg-background/20 p-5 sm:p-6">
        {bestMatch?.isExact && totalUnits > 0 && totalUnits < 100 && (
          <Alert className="border-primary/35 bg-primary/10" role="status" aria-live="polite">
            <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
            <AlertDescription className="text-foreground">
              {t("result.not_enough", {
                units: unitsNeeded,
                nuggets: Math.ceil(unitsNeeded / 5),
              })}
            </AlertDescription>
          </Alert>
        )}

        {totalUnits > 0 && bestMatch && !bestMatch.isExact && adjustmentSummary && (
          <Alert className="border-primary/35 bg-primary/10" role="status" aria-live="polite">
            <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
            <AlertDescription className="text-foreground">
              <strong>{t("result.valid_mix_hint", { summary: adjustmentSummary, alloy: productName })}</strong>
            </AlertDescription>
          </Alert>
        )}

        {bestMatch?.isExact && excessMessage && evaluation.totalUnits >= 100 && evaluation.totalUnits % 100 > 0 && (
          <Alert className="border-primary/35 bg-primary/10">
            <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
            <AlertDescription className="text-foreground">
              <strong>{t("result.excess_label")}</strong> {excessMessage}
            </AlertDescription>
          </Alert>
        )}

        {hasContamination && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {t("result.contamination", {
                metals: contaminationViolations.map((violation) => getMetalLabel(violation.metalId)).join(", "),
              })}
            </AlertDescription>
          </Alert>
        )}

        {!bestMatch && totalUnits > 0 && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{t("result.no_match")}</AlertDescription>
          </Alert>
        )}

        {bestMatch?.isExact ? (
          <Alert className="border-secondary/40 bg-secondary/10" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4 text-secondary-foreground" aria-hidden="true" />
            <AlertDescription className="text-foreground">
              {t("result.valid_message", { alloy: productName })}
            </AlertDescription>
          </Alert>
        ) : (
          nuggetAdjustments.length > 0 && (
            <Button onClick={handleAdjustToValid} className="w-full" size="lg">
              <Wand2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("result.adjust_button", { alloy: productName })}
            </Button>
          )
        )}
      </CardContent>
      )}
    </Card>
  );
});
