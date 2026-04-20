import { AlertTriangle, ArrowRight, Pickaxe, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { METALS } from "@/features/metallurgy/data/alloys";
import { getIngotImage } from "@/features/metallurgy/data/recipeAssets";
import type { AlloyRecipe, MetalId } from "@/features/metallurgy/types/alloys";
import type {
  CraftableRecipeResult,
  RecipePlannerResult,
  ScarcityMode,
} from "@/features/metallurgy/types/planner";
import { getLocalePath, useTranslation } from "@/i18n";
import { trackPlannerOpenInCalculator } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function formatInventoryList(
  inventory: Record<MetalId, number>,
  getMetalShortLabel: (metalId: MetalId) => string,
) {
  return METALS
    .filter((metal) => inventory[metal.id] > 0)
    .map((metal) => `${inventory[metal.id]} ${getMetalShortLabel(metal.id)}`)
    .join(", ");
}

function getScarcityReason(
  mode: ScarcityMode,
  ingots: number,
  runs: number,
  copperUsed: number,
  rarityCost: number,
) {
  if (mode === "economical") {
    return `Lowest rarity cost found (${rarityCost.toFixed(1)}) while still producing ${ingots} ingots.`;
  }

  if (mode === "preserve-copper") {
    return `Uses ${copperUsed} copper nuggets to preserve copper-heavy progression paths.`;
  }

  if (mode === "max-output") {
    return `Prioritized the highest output first, then reduced the plan to ${runs} run${runs === 1 ? "" : "s"}.`;
  }

  return `Balanced toward midpoint ratios, reasonable leftovers, and ${runs} executable run${runs === 1 ? "" : "s"}.`;
}

function getBreakpointText(
  value: number | null,
  fallback: string,
  formatter: (n: number) => string,
) {
  return value === null ? fallback : formatter(value);
}

interface PlannerOutputProps {
  recipes: AlloyRecipe[];
  resultList: CraftableRecipeResult[];
  scarcityMode: ScarcityMode;
  expandedRecipeId: AlloyRecipe["id"] | null;
  targetIngots: number;
  selectedPlan: RecipePlannerResult | null;
  onToggleExpand: (result: CraftableRecipeResult) => void;
  onTargetIngotsChange: (value: number) => void;
}

export function PlannerOutput({
  recipes,
  resultList,
  scarcityMode,
  expandedRecipeId,
  targetIngots,
  selectedPlan,
  onToggleExpand,
  onTargetIngotsChange,
}: PlannerOutputProps) {
  const { locale, t, getMetalLabel, getMetalShortLabel, getRecipeName } = useTranslation();

  if (resultList.length === 0) {
    return (
      <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <Pickaxe className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t("planner.find.empty")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {resultList.map((result) => {
        const recipe = recipes.find((candidate) => candidate.id === result.recipeId);
        if (!recipe) return null;

        const isExpanded = expandedRecipeId === result.recipeId;
        const recipePlan = isExpanded ? selectedPlan : null;
        const selectedTargetIngots = recipePlan?.selectedTargetIngots ?? targetIngots;
        const targetInputMax = recipePlan?.maxCraftableIngots ?? result.totalIngots;

        return (
          <Card key={result.recipeId} className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
            <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getIngotImage(result.recipeId)}
                  alt=""
                  className="h-14 w-14 rounded-2xl bg-background/70 p-2 object-contain ring-1 ring-inset ring-border/25"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <CardTitle className="text-2xl tracking-tight">{getRecipeName(result.recipeId)}</CardTitle>
                  <CardDescription>
                    {getScarcityReason(
                      scarcityMode,
                      result.totalIngots,
                      result.plan.runs.length,
                      result.copperUsed,
                      result.rarityCost,
                    )}
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                className="rounded-full"
                variant={isExpanded ? "outline" : "default"}
                onClick={() => onToggleExpand(result)}
              >
                <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
                {t(isExpanded ? "planner.find.hide_plan" : "planner.find.open_plan")}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-3 rounded-3xl border border-border/30 bg-background/45 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-primary/12 px-3 py-1.5 text-foreground">
                      {t("planner.find.max_output", { n: result.totalIngots })}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-foreground">
                      {t("planner.find.limiting_metal", {
                        metal: result.limitingMetalId
                          ? getMetalLabel(result.limitingMetalId)
                          : t("planner.target.none"),
                      })}
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("planner.plan.consumed", {
                      inventory: formatInventoryList(result.consumed, getMetalShortLabel),
                    })}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("planner.plan.remaining", {
                      inventory: formatInventoryList(result.leftovers, getMetalShortLabel) || t("planner.target.none"),
                    })}
                  </p>
                </div>

                <div className="space-y-3 rounded-3xl border border-border/30 bg-background/45 p-4">
                  <p className="text-sm font-semibold text-foreground">{t("planner.find.run_summary")}</p>
                  {result.plan.runs.map((run) => (
                    <div key={`${result.recipeId}-${run.runNumber}`} className="rounded-2xl bg-card/85 px-3 py-2 text-sm">
                      <p className="font-semibold text-foreground">
                        {t("planner.run.title", { n: run.runNumber })}
                      </p>
                      <p className="text-muted-foreground">
                        {t("planner.run.subtitle", {
                          ingots: run.ingotsProduced,
                          consumed: formatInventoryList(run.consumed, getMetalShortLabel),
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {isExpanded && recipePlan && (
                <div className="space-y-4 rounded-3xl border border-border/30 bg-background/35 p-4">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
                    <div className="rounded-2xl border border-border/25 bg-card/80 px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{t("planner.target.recipe")}</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{getRecipeName(result.recipeId)}</p>
                    </div>
                    <NumberInput
                      value={targetIngots}
                      onChange={onTargetIngotsChange}
                      min={1}
                      max={Math.max(1, targetInputMax)}
                      className="h-12 w-full"
                      aria-label={t("planner.target.ingots_aria")}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <Card className="rounded-3xl border-border/30 bg-background/40 shadow-none">
                      <CardHeader>
                        <CardTitle>{t("planner.plan.summary_title")}</CardTitle>
                        <CardDescription>
                          {getScarcityReason(
                            scarcityMode,
                            selectedTargetIngots,
                            recipePlan.plan?.runs.length ?? result.plan.runs.length,
                            recipePlan.plan
                              ? recipePlan.plan.inventoryBefore.copper - recipePlan.plan.inventoryAfter.copper
                              : result.copperUsed,
                            result.rarityCost,
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="rounded-full bg-primary/12 px-3 py-1.5 text-foreground">
                            {t("planner.plan.total_ingots", { n: selectedTargetIngots })}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-foreground">
                            {t("planner.plan.total_runs", { n: recipePlan.plan?.runs.length ?? 0 })}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {t("planner.plan.leftovers", {
                            inventory: formatInventoryList(recipePlan.plan?.leftovers ?? result.leftovers, getMetalShortLabel)
                              || t("planner.target.none"),
                          })}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/30 bg-background/40 shadow-none">
                      <CardHeader>
                        <CardTitle>{t("planner.target.breakpoints")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          {t("planner.target.minimum_valid", {
                            n: getBreakpointText(recipePlan.insights.minimumValidIngots, t("planner.target.none"), (n) => String(n)),
                          })}
                        </p>
                        <p>
                          {t("planner.target.previous_valid", {
                            n: getBreakpointText(recipePlan.insights.previousValidIngots, t("planner.target.none"), (n) => String(n)),
                          })}
                        </p>
                        <p>
                          {recipePlan.insights.nextValidIngots === null
                            ? t("planner.target.next_valid_none")
                            : t("planner.target.next_valid", { n: recipePlan.insights.nextValidIngots })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {!recipePlan.plan ? (
                    <Alert className="border-primary/35 bg-primary/10">
                      <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
                      <AlertDescription className="text-foreground">
                        {t("planner.target.invalid_target", {
                          n: targetIngots,
                          previous: getBreakpointText(recipePlan.insights.previousValidIngots, t("planner.target.none"), (n) => String(n)),
                          next:
                            recipePlan.insights.nextValidIngots === null
                              ? t("planner.target.none")
                              : String(recipePlan.insights.nextValidIngots),
                        })}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {recipePlan.plan.runs.map((run) => {
                        const calculatorParams = new URLSearchParams();
                        for (const slot of run.crucible.slots) {
                          if (slot.metalId && slot.nuggets > 0) {
                            calculatorParams.set(`s${slot.id}`, `${slot.metalId}:${slot.nuggets}`);
                          }
                        }
                        calculatorParams.set("r", result.recipeId);
                        const calculatorHref = `${getLocalePath(locale, "/")}?${calculatorParams.toString()}`;

                        return (
                          <Card key={`${result.recipeId}-${run.runNumber}-detail`} className="rounded-3xl border-border/30 bg-background/30 shadow-none">
                            <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-xl">{t("planner.run.title", { n: run.runNumber })}</CardTitle>
                                <CardDescription>
                                  {t("planner.run.subtitle", {
                                    ingots: run.ingotsProduced,
                                    consumed: formatInventoryList(run.consumed, getMetalShortLabel),
                                  })}
                                </CardDescription>
                              </div>

                              <a
                                href={calculatorHref}
                                onClick={() =>
                                  trackPlannerOpenInCalculator({
                                    recipe: result.recipeId,
                                    run: run.runNumber,
                                    ingots: run.ingotsProduced,
                                  })}
                                className={cn(
                                  "inline-flex h-11 items-center justify-center rounded-full border border-border/45 bg-background/70 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50",
                                )}
                              >
                                {t("planner.run.open_in_calculator")}
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                              </a>
                            </CardHeader>

                            <CardContent className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                              <div className="rounded-2xl border border-border/25 bg-card/80 p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {t("planner.run.crucible_load")}
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                  {run.crucible.slots
                                    .filter((slot) => slot.metalId && slot.nuggets > 0)
                                    .map((slot) => (
                                      <div key={slot.id} className="rounded-2xl bg-background/65 px-3 py-2 text-sm">
                                        <p className="font-semibold text-foreground">
                                          {getMetalLabel(slot.metalId as MetalId)}
                                        </p>
                                        <p className="text-muted-foreground">
                                          {t("planner.run.slot_nuggets", { n: slot.nuggets })}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-border/25 bg-card/80 p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {t("planner.run.remaining_inventory")}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                  {formatInventoryList(run.inventoryAfter, getMetalShortLabel) || t("planner.target.none")}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
