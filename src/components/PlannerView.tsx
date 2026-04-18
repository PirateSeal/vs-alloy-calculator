import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Pickaxe, Zap } from "lucide-react";
import { METALS } from "@/data/alloys";
import { getLocalePath, useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  findCraftableRecipes,
  getInventoryTotalNuggets,
  normalizeInventoryState,
  planRecipeFromInventory,
} from "@/lib/planner";
import type { AlloyRecipe, MetalId } from "@/types/alloys";
import type { PlannerState, ScarcityMode } from "@/types/planner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlannerViewProps {
  recipes: AlloyRecipe[];
  state: PlannerState;
  onStateChange: React.Dispatch<React.SetStateAction<PlannerState>>;
}

function getIngotImage(recipeId: string) {
  return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
}

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

export function PlannerView({ recipes, state, onStateChange }: PlannerViewProps) {
  const { locale, t, getMetalLabel, getMetalShortLabel, getRecipeName } = useTranslation();
  const inventory = useMemo(() => normalizeInventoryState(state.inventory), [state.inventory]);
  const totalInventoryNuggets = useMemo(() => getInventoryTotalNuggets(inventory), [inventory]);
  const resultList = useMemo(
    () => findCraftableRecipes(inventory, recipes, state.scarcityMode),
    [inventory, recipes, state.scarcityMode],
  );
  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === state.recipeId) ?? null,
    [recipes, state.recipeId],
  );
  const selectedPlan = useMemo(
    () => (selectedRecipe ? planRecipeFromInventory(selectedRecipe, inventory, state.scarcityMode, state.targetIngots) : null),
    [inventory, selectedRecipe, state.scarcityMode, state.targetIngots],
  );

  const updateInventory = (metalId: MetalId, nuggets: number) => {
    onStateChange((current) => ({
      ...current,
      inventory: {
        ...current.inventory,
        [metalId]: nuggets,
      },
    }));
  };

  const clearInventory = () => {
    onStateChange((current) => ({
      ...current,
      inventory: normalizeInventoryState(),
      recipeId: null,
      targetIngots: 1,
    }));
  };

  return (
    <section className="animate-surface-in space-y-4" aria-labelledby="planner-title">
      <div className="overflow-hidden rounded-[1.9rem] border border-border/30 bg-card/90 shadow-sm ring-1 ring-inset ring-border/20">
        <div className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(133,180,255,0.12),transparent_38%)]" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
                {t("header.domain.metallurgy")}
              </p>
              <CardTitle id="planner-title" className="text-3xl font-semibold tracking-tight sm:text-[2.35rem]">
                {t("planner.title")}
              </CardTitle>
              <CardDescription className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
                {t("planner.description")}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="h-11 rounded-full bg-primary/12 px-4 text-sm font-semibold text-foreground">
                {t("planner.discovery.label")}
              </Badge>

              <div className="min-w-[15rem]">
                <Select
                  value={state.scarcityMode}
                  onValueChange={(value: ScarcityMode) =>
                    onStateChange((current) => ({ ...current, scarcityMode: value }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-full border-border/45 bg-background/70">
                    <SelectValue placeholder={t("planner.mode.label")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">{t("planner.mode.balanced")}</SelectItem>
                    <SelectItem value="economical">{t("planner.mode.economical")}</SelectItem>
                    <SelectItem value="preserve-copper">{t("planner.mode.preserve_copper")}</SelectItem>
                    <SelectItem value="max-output">{t("planner.mode.max_output")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t("planner.inventory.title")}</CardTitle>
            <CardDescription>{t("planner.inventory.description")}</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={clearInventory}>
            {t("planner.inventory.clear")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {METALS.map((metal) => (
              <div key={metal.id} className="rounded-2xl border border-border/35 bg-background/45 p-3">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={metal.nuggetImage}
                    alt=""
                    className="h-10 w-10 rounded-xl bg-background/70 p-1 object-contain ring-1 ring-inset ring-border/25"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{getMetalLabel(metal.id)}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {getMetalShortLabel(metal.id)}
                    </p>
                  </div>
                </div>
                <NumberInput
                  value={inventory[metal.id]}
                  onChange={(value) => updateInventory(metal.id, value)}
                  min={0}
                  max={9999}
                  className="w-full"
                  aria-label={t("planner.inventory.metal_aria", { metal: getMetalLabel(metal.id) })}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-semibold">
              {t("planner.inventory.total_nuggets", { n: totalInventoryNuggets })}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-semibold">
              {t("planner.inventory.total_ingots", { n: Math.floor(totalInventoryNuggets / 20) })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {resultList.length === 0 ? (
          <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
            <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <Pickaxe className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t("planner.find.empty")}</p>
            </CardContent>
          </Card>
        ) : (
          resultList.map((result) => {
            const recipe = recipes.find((candidate) => candidate.id === result.recipeId);
            if (!recipe) return null;

            const isExpanded = state.recipeId === result.recipeId;
            const recipePlan = isExpanded ? selectedPlan : null;
            const selectedTargetIngots = recipePlan?.selectedTargetIngots ?? state.targetIngots;
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
                          state.scarcityMode,
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
                    onClick={() =>
                      onStateChange((current) => ({
                        ...current,
                        recipeId: current.recipeId === result.recipeId ? null : result.recipeId,
                        targetIngots: current.recipeId === result.recipeId ? current.targetIngots : result.totalIngots,
                      }))
                    }
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
                          value={state.targetIngots}
                          onChange={(value) =>
                            onStateChange((current) => ({ ...current, targetIngots: value }))
                          }
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
                                state.scarcityMode,
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
                                n: getBreakpointText(
                                  recipePlan.insights.minimumValidIngots,
                                  t("planner.target.none"),
                                  (n) => String(n),
                                ),
                              })}
                            </p>
                            <p>
                              {t("planner.target.previous_valid", {
                                n: getBreakpointText(
                                  recipePlan.insights.previousValidIngots,
                                  t("planner.target.none"),
                                  (n) => String(n),
                                ),
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
                              n: state.targetIngots,
                              previous: getBreakpointText(
                                recipePlan.insights.previousValidIngots,
                                t("planner.target.none"),
                                (n) => String(n),
                              ),
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
          })
        )}
      </div>
    </section>
  );
}
