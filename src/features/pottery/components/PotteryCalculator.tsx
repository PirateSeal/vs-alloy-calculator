import { useMemo } from "react";
import { Info } from "lucide-react";
import { POTTERY_RECIPE_BY_ID } from "@/features/pottery/data/recipes";
import { calcClayCost, calcCraftedOutput, calcMaxCraftable, clampPositiveInt } from "@/features/pottery/lib/potteryLogic";
import type { PotteryCalculatorState } from "@/features/pottery/types/pottery";
import { CategoryPill, ClayTypeBadge, FiringBadge, NudgeRow, PotteryItemTile, SectionLabel } from "@/features/pottery/components/PotteryUi";
import { PotteryItemPicker } from "@/features/pottery/components/PotteryItemPicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface PotteryCalculatorProps {
  state: PotteryCalculatorState;
  onStateChange: (update: PotteryCalculatorState | ((current: PotteryCalculatorState) => PotteryCalculatorState)) => void;
}

function formatClayPerItem(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function PotteryCalculator({ state, onStateChange }: PotteryCalculatorProps) {
  const { t } = useTranslation();
  const recipe = useMemo(
    () => (state.recipeId ? POTTERY_RECIPE_BY_ID.get(state.recipeId) ?? null : null),
    [state.recipeId],
  );
  const recipeName = recipe ? t(`pottery.recipe.${recipe.id}`) : "";
  const quantity = clampPositiveInt(state.quantity);
  const totalClay = recipe ? calcClayCost(recipe, quantity) : 0;
  const craftedOutput = recipe ? calcCraftedOutput(recipe, quantity) : 0;
  const maxFromSample = recipe ? Math.max(100, calcMaxCraftable({ any: 200, fire: recipe.clayType === "fire" ? 200 : 0 }, recipe)) : 100;

  const setRecipeId = (recipeId: string | null) => {
    onStateChange((current) => ({ ...current, recipeId }));
  };
  const setQuantity = (nextQuantity: number) => {
    onStateChange((current) => ({ ...current, quantity: clampPositiveInt(nextQuantity) }));
  };

  return (
    <div className="space-y-4">
      <header className="animate-surface-in flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
        <h1 id="pottery-calculator-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("pottery.calculator.title")}
        </h1>
        <p className="text-sm text-muted-foreground" data-pretty-text>
          {t("pottery.calculator.description")}
        </p>
      </header>

      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.95fr)] xl:items-start">
        <Card className="animate-surface-in animate-delay-1 overflow-hidden rounded-[1.9rem] border-border/35 bg-card/92 surface-panel">
          <CardHeader className="border-b border-border/30 bg-background/20 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              {recipe ? (
                <PotteryItemTile recipe={recipe} />
              ) : (
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-border/30 bg-background/65">
                  <Info className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Label className="sr-only" htmlFor="pottery-item">
                  {t("pottery.item.label")}
                </Label>
                <PotteryItemPicker value={state.recipeId} onChange={setRecipeId} />
              </div>
            </div>
            {recipe ? (
              <div className="flex flex-wrap gap-2 pt-3">
                <ClayTypeBadge type={recipe.clayType} />
                <CategoryPill category={recipe.category} />
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <SectionLabel>{t("pottery.quantity")}</SectionLabel>
                <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-2">
                  <span className="font-mono text-4xl font-semibold leading-none tabular-nums">{quantity}</span>
                  <span className="text-sm text-muted-foreground">{recipe ? recipeName : t("pottery.items")}</span>
                </div>
              </div>
              <Input
                type="number"
                min={1}
                max={9999}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="h-12 w-32 rounded-[1rem] border-border/45 bg-background/70 text-center font-mono text-lg font-semibold tabular-nums"
                aria-label={t("pottery.quantity")}
              />
            </div>

            <div className="mt-5">
              <Slider
                value={[Math.min(quantity, maxFromSample)]}
                min={1}
                max={maxFromSample}
                step={1}
                onValueChange={([value]) => setQuantity(value)}
                aria-label={t("pottery.quantity_slider")}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                {recipe ? (
                  <span className="text-primary">
                    {t("pottery.calculator.max_from_clay", {
                      max: calcMaxCraftable({ any: 200, fire: recipe.clayType === "fire" ? 200 : 0 }, recipe),
                      clay: 200,
                    })}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <NudgeRow value={quantity} onChange={setQuantity} min={1} />
            </div>
          </CardContent>
        </Card>

        <aside className="animate-surface-in animate-delay-2 xl:sticky xl:top-6">
          <Card
            key={`${recipe?.id ?? "empty"}-${quantity}`}
            className={cn(
              "overflow-hidden rounded-[1.9rem] bg-card/92 surface-panel",
              recipe?.clayType === "fire"
                ? "border-destructive/30"
                : recipe
                  ? "border-success/25"
                  : "border-border/35",
            )}
          >
            {!recipe ? (
              <Empty className="min-h-[26rem] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Info />
                  </EmptyMedia>
                  <EmptyTitle>{t("pottery.calculator.empty_title")}</EmptyTitle>
                  <EmptyDescription>
                    {t("pottery.calculator.empty_description")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <CardContent className="relative overflow-hidden p-5 sm:p-6">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-90"
                    style={{
                      background: `radial-gradient(ellipse 80% 80% at 100% 0%, ${recipe.clayType === "fire" ? "rgba(160,91,79,0.22)" : "rgba(239,189,141,0.18)"}, transparent 65%)`,
                    }}
                  />
                  <div className="relative">
                    <div className="flex flex-wrap gap-2">
                      <ClayTypeBadge type={recipe.clayType} />
                      <FiringBadge required={recipe.requiresFiring} />
                    </div>
                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                          {t("pottery.clay_required")}
                        </p>
                        <p className="mt-2 font-mono text-[3.5rem] font-semibold leading-none tabular-nums">
                          {totalClay}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {t("pottery.calculator.clay_for", { clay: t("pottery.clay"), quantity, item: recipeName })}
                        </p>
                      </div>
                      <PotteryItemTile recipe={recipe} className="hidden size-24 rounded-[1.6rem] p-3 sm:inline-flex" imageClassName="rounded-[1rem]" />
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[1rem] bg-background/68 px-3 py-3">
                        <p className="text-xs text-muted-foreground">{t("pottery.clay_per_item")}</p>
                        <p className="font-mono text-lg font-semibold tabular-nums">{formatClayPerItem(recipe.clayPerItem)}</p>
                      </div>
                      <div className="rounded-[1rem] bg-background/68 px-3 py-3">
                        <p className="text-xs text-muted-foreground">{t("pottery.output_from_crafts")}</p>
                        <p className="font-mono text-lg font-semibold tabular-nums">{craftedOutput}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="border-t border-border/30 bg-background/24 p-5">
                  <div className="flex flex-wrap gap-2">
                    <CategoryPill category={recipe.category} className="px-3 py-1.5 text-xs" />
                  </div>
                  {recipe.batchRecipe ? (
                    <div className="mt-4 rounded-[1.4rem] bg-background/30 p-4 ring-1 ring-inset ring-border/25">
                      <p className="text-sm font-semibold">{t("pottery.batch_recipe")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("pottery.batch_recipe_sentence", {
                          clayCost: recipe.batchRecipe.clayCost,
                          outputCount: recipe.batchRecipe.outputCount,
                        })}
                      </p>
                    </div>
                  ) : null}
                  {recipe.id === "clay-oven" ? (
                    <Alert className="mt-4 border-destructive/25 bg-destructive/10">
                      <AlertTitle>{t("pottery.fire_clay_only_title")}</AlertTitle>
                      <AlertDescription>
                        {t("pottery.fire_clay_only_description")}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  {recipe.id === "shingles" ? (
                    <Alert className="mt-4 border-primary/25 bg-primary/10">
                      <AlertTitle>{t("pottery.minimum_craft_title")}</AlertTitle>
                      <AlertDescription>
                        {t("pottery.minimum_craft_description", { output: craftedOutput })}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </CardContent>
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
