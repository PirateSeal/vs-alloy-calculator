import { useMemo, useState } from "react";
import { Amphora, Flame, PackageCheck, Plus, Trash2 } from "lucide-react";
import { POTTERY_RECIPE_BY_ID } from "@/features/pottery/data/recipes";
import {
  KILN_FUEL_OPTIONS,
  calcBeehiveKilnPlan,
  calcClayCost,
  calcFeasibility,
  calcMaxCraftable,
  calcPitKilnPlan,
  clampPositiveInt,
  getKilnFuelOption,
  hydratePlanItems,
} from "@/features/pottery/lib/potteryLogic";
import type { KilnFuelType, KilnMode, PotteryCategory, PotteryPlannerState } from "@/features/pottery/types/pottery";
import { CategoryPill, ClayTypeBadge, NudgeRow, PotteryItemTile, SectionLabel } from "@/features/pottery/components/PotteryUi";
import { PotteryItemPicker } from "@/features/pottery/components/PotteryItemPicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface PotteryPlannerProps {
  state: PotteryPlannerState;
  onStateChange: (update: PotteryPlannerState | ((current: PotteryPlannerState) => PotteryPlannerState)) => void;
}

export function PotteryPlanner({ state, onStateChange }: PotteryPlannerProps) {
  const { t } = useTranslation();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const plan = useMemo(() => hydratePlanItems(state.plan, POTTERY_RECIPE_BY_ID), [state.plan]);
  const feasibility = useMemo(
    () => calcFeasibility({ any: state.invAny, fire: state.invFire }, plan),
    [plan, state.invAny, state.invFire],
  );
  const pitKilnPlan = useMemo(() => calcPitKilnPlan(plan, state.fuelType), [plan, state.fuelType]);
  const beehiveKilnPlan = useMemo(() => calcBeehiveKilnPlan(plan, state.fuelType), [plan, state.fuelType]);
  const totalItems = plan.reduce((sum, item) => sum + item.quantity, 0);

  const updateInventory = (field: "invAny" | "invFire", value: number) => {
    onStateChange((current) => ({ ...current, [field]: Math.max(0, Math.floor(value) || 0) }));
  };
  const addItem = (recipeId: string | null) => {
    if (!recipeId || !POTTERY_RECIPE_BY_ID.has(recipeId)) return;
    onStateChange((current) => {
      const existingIndex = current.plan.findIndex((item) => item.recipeId === recipeId);
      if (existingIndex >= 0) {
        const plan = current.plan.map((item, index) =>
          index === existingIndex ? { ...item, quantity: clampPositiveInt(item.quantity + 1) } : item,
        );
        return { ...current, plan };
      }
      return { ...current, plan: [...current.plan, { recipeId, quantity: 1 }] };
    });
    setSelectedRecipeId(null);
  };
  const setItemQuantity = (index: number, quantity: number) => {
    onStateChange((current) => ({
      ...current,
      plan: current.plan.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: clampPositiveInt(quantity) } : item,
      ),
    }));
  };
  const removeItem = (index: number) => {
    onStateChange((current) => ({
      ...current,
      plan: current.plan.filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const clearPlan = () => {
    onStateChange((current) => ({ ...current, plan: [] }));
  };
  const setKilnMode = (kilnMode: KilnMode) => {
    onStateChange((current) => ({ ...current, kilnMode }));
  };
  const setFuelType = (fuelType: KilnFuelType) => {
    onStateChange((current) => ({ ...current, fuelType }));
  };

  const totalsByCategory = plan.reduce(
    (totals, item) => {
      totals[item.recipe.category] = (totals[item.recipe.category] ?? 0) + calcClayCost(item.recipe, item.quantity);
      return totals;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      <header className="animate-surface-in flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
        <h1 id="pottery-planner-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("pottery.planner.title")}
        </h1>
        <p className="text-sm text-muted-foreground" data-pretty-text>
          {t("pottery.planner.description")}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <aside className="animate-surface-in animate-delay-1 flex flex-col gap-4 lg:sticky lg:top-6">
          <Card className="overflow-hidden rounded-[1.9rem] border-border/35 bg-card/92 surface-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Amphora className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("pottery.inventory.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t("pottery.inventory.description")}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <InventoryInput
                label={t("pottery.inventory.any_clay")}
                description={t("pottery.inventory.any_clay_description")}
                value={state.invAny}
                onChange={(value) => updateInventory("invAny", value)}
                deltas={[-50, -10, 10, 50]}
              />
              <Separator className="bg-border/30" />
              <InventoryInput
                label={t("pottery.inventory.fire_clay")}
                description={t("pottery.inventory.fire_clay_description")}
                value={state.invFire}
                onChange={(value) => updateInventory("invFire", value)}
                deltas={[-10, -1, 1, 10]}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                {t("pottery.inventory.fire_clay_note")}
              </p>
            </CardContent>
          </Card>

          <SummaryCard
            planCount={plan.length}
            totalItems={totalItems}
            invAny={state.invAny}
            invFire={state.invFire}
            feasibility={feasibility}
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="animate-surface-in animate-delay-2 overflow-hidden rounded-[1.9rem] border-border/35 bg-card/92 surface-panel">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/30 bg-background/20">
              <div>
                <CardTitle className="text-base">{t("pottery.plan.title")}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.length === 0
                    ? t("pottery.plan.empty_summary")
                    : t("pottery.plan.summary", { types: plan.length, items: totalItems })}
                </p>
              </div>
              {plan.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive" onClick={clearPlan}>
                  {t("pottery.clear_all")}
                </Button>
              ) : null}
            </CardHeader>

            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              {plan.length === 0 ? (
                <Empty className="min-h-48 border-0 bg-background/25">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PackageCheck />
                    </EmptyMedia>
                    <EmptyTitle>{t("pottery.plan.empty_title")}</EmptyTitle>
                    <EmptyDescription>{t("pottery.plan.empty_description")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-2">
                  {plan.map((item, index) => {
                    const cost = calcClayCost(item.recipe, item.quantity);
                    const itemName = t(`pottery.recipe.${item.recipe.id}`);
                    const maxCraftable = calcMaxCraftable({ any: state.invAny, fire: state.invFire }, item.recipe);
                    const short = maxCraftable < item.quantity;
                    return (
                      <div
                        key={`${item.recipe.id}-${index}`}
                        className={cn(
                          "animate-surface-in-soft grid gap-3 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center",
                          short ? "border-destructive/25 bg-destructive/7" : "border-border/25 bg-background/40",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <PotteryItemTile recipe={item.recipe} className="size-10 rounded-[0.9rem]" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{itemName}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <CategoryPill category={item.recipe.category} />
                              <ClayTypeBadge type={item.recipe.clayType} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="icon" className="size-10 rounded-[1rem]" onClick={() => setItemQuantity(index, item.quantity - 1)}>
                            <span aria-hidden="true">-</span>
                            <span className="sr-only">{t("pottery.decrease_item", { item: itemName })}</span>
                          </Button>
                          <NumberInput value={item.quantity} min={1} max={9999} onChange={(value) => setItemQuantity(index, value)} className="w-28" aria-label={t("pottery.item_quantity", { item: itemName })} />
                          <Button type="button" variant="outline" size="icon" className="size-10 rounded-[1rem]" onClick={() => setItemQuantity(index, item.quantity + 1)}>
                            <Plus data-icon="inline-start" />
                            <span className="sr-only">{t("pottery.increase_item", { item: itemName })}</span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="text-right">
                            <p className="font-mono text-lg font-bold tabular-nums">{cost}</p>
                            <p className={cn("text-xs", short ? "text-destructive" : "text-muted-foreground")}>
                              {short ? t("pottery.max_value", { max: maxCraftable }) : t("pottery.clay")}
                            </p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="size-10 rounded-[1rem] text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)}>
                            <Trash2 data-icon="inline-start" />
                            <span className="sr-only">{t("pottery.remove_item", { item: itemName })}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-3 rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <PotteryItemPicker value={selectedRecipeId} onChange={setSelectedRecipeId} placeholder={t("pottery.plan.add_placeholder")} />
                <Button type="button" className="h-14 rounded-[1rem]" disabled={!selectedRecipeId} onClick={() => addItem(selectedRecipeId)}>
                  <Plus data-icon="inline-start" />
                  {t("pottery.add")}
                </Button>
              </div>
            </CardContent>

            {plan.length > 0 ? (
              <CardContent className="border-t border-border/30 bg-background/24 p-4 sm:p-5">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(totalsByCategory).map(([category, total]) => (
                    <span key={category} className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/55 px-3 py-1.5 text-xs font-semibold">
                      <CategoryPill category={category as PotteryCategory} />
                      <span className="font-mono tabular-nums">{total}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            ) : null}
          </Card>

          <KilnPlannerCard
            kilnMode={state.kilnMode}
            fuelType={state.fuelType}
            pitPlan={pitKilnPlan}
            beehivePlan={beehiveKilnPlan}
            onKilnModeChange={setKilnMode}
            onFuelTypeChange={setFuelType}
          />
        </div>
      </div>
    </div>
  );
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function KilnPlannerCard({
  kilnMode,
  fuelType,
  pitPlan,
  beehivePlan,
  onKilnModeChange,
  onFuelTypeChange,
}: {
  kilnMode: KilnMode;
  fuelType: KilnFuelType;
  pitPlan: ReturnType<typeof calcPitKilnPlan>;
  beehivePlan: ReturnType<typeof calcBeehiveKilnPlan>;
  onKilnModeChange: (kilnMode: KilnMode) => void;
  onFuelTypeChange: (fuelType: KilnFuelType) => void;
}) {
  const { t } = useTranslation();
  const fuelOption = getKilnFuelOption(fuelType);
  const hasFireableItems = kilnMode === "pit" ? pitPlan.fireableItems > 0 : beehivePlan.fireableItems > 0;

  return (
    <Card className="animate-surface-in animate-delay-3 overflow-hidden rounded-[1.9rem] border-border/35 bg-card/92 surface-panel">
      <CardHeader className="gap-4 border-b border-border/30 bg-background/20 p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("pottery.kiln.title")}
          </CardTitle>
          <p className="mt-1 text-sm leading-6 text-muted-foreground" data-pretty-text>
            {t("pottery.kiln.description")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-[24rem]">
          <ToggleGroup
            type="single"
            value={kilnMode}
            onValueChange={(value) => {
              if (value === "pit" || value === "beehive") onKilnModeChange(value);
            }}
            className="grid min-h-11 grid-cols-2 rounded-[1.25rem] bg-background/55 p-1"
            aria-label={t("pottery.kiln.mode_label")}
          >
            <ToggleGroupItem value="pit" className="min-h-9 rounded-[1rem] px-3 text-xs">
              {t("pottery.kiln.mode.pit")}
            </ToggleGroupItem>
            <ToggleGroupItem value="beehive" className="min-h-9 rounded-[1rem] px-3 text-xs">
              {t("pottery.kiln.mode.beehive")}
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={fuelType} onValueChange={(value) => onFuelTypeChange(value as KilnFuelType)}>
            <SelectTrigger className="h-11 rounded-[1rem] border-border/45 bg-background/70 text-sm shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[1rem] border-border/30 bg-popover/98">
              <SelectGroup>
                {KILN_FUEL_OPTIONS.map((fuel) => (
                  <SelectItem key={fuel.type} value={fuel.type} className="rounded-xl">
                    {t(fuel.labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {!hasFireableItems ? (
          <p className="rounded-[1.25rem] border border-border/30 bg-background/35 p-4 text-sm leading-6 text-muted-foreground">
            {t("pottery.kiln.empty")}
          </p>
        ) : kilnMode === "pit" ? (
          <PitKilnSummary plan={pitPlan} fuelLabel={t(fuelOption.labelKey)} />
        ) : (
          <BeehiveKilnSummary plan={beehivePlan} fuelLabel={t(fuelOption.labelKey)} />
        )}
      </CardContent>
    </Card>
  );
}

function PitKilnSummary({
  plan,
  fuelLabel,
}: {
  plan: ReturnType<typeof calcPitKilnPlan>;
  fuelLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KilnMetric label={t("pottery.kiln.pit.cycles")} value={plan.cycles} />
        <KilnMetric label={t("pottery.kiln.fireable_items")} value={plan.fireableItems} />
        <KilnMetric label={t("pottery.kiln.dry_grass")} value={plan.dryGrass} />
        <KilnMetric label={t("pottery.kiln.sticks")} value={plan.sticks} />
      </div>
      <div className="grid gap-2 rounded-[1.25rem] border border-border/30 bg-background/35 p-4 sm:grid-cols-2">
        <Breakdown label={fuelLabel} value={plan.fuel} />
        <Breakdown label={t("pottery.kiln.total_time")} value={t("pottery.kiln.hours", { hours: formatHours(plan.durationHours) })} />
      </div>
      <Alert className="border-primary/25 bg-primary/10">
        <AlertTitle>{t("pottery.kiln.pit.guidance_title")}</AlertTitle>
        <AlertDescription>{t("pottery.kiln.pit.guidance_body")}</AlertDescription>
      </Alert>
    </div>
  );
}

function BeehiveKilnSummary({
  plan,
  fuelLabel,
}: {
  plan: ReturnType<typeof calcBeehiveKilnPlan>;
  fuelLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KilnMetric label={t("pottery.kiln.beehive.firings")} value={plan.firings} />
        <KilnMetric label={t("pottery.kiln.fireable_items")} value={plan.fireableItems} />
        <KilnMetric label={fuelLabel} value={plan.fuel} />
        <KilnMetric label={t("pottery.kiln.total_time")} value={t("pottery.kiln.hours", { hours: formatHours(plan.durationHours) })} />
      </div>
      <div className="grid gap-2 rounded-[1.25rem] border border-border/30 bg-background/35 p-4 sm:grid-cols-2">
        <Breakdown label={t("pottery.kiln.dry_grass")} value={0} />
        <Breakdown label={t("pottery.kiln.sticks")} value={0} />
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {plan.classes.map((item) => (
          <ClassEstimate
            key={item.beehiveClass}
            label={t(`pottery.kiln.beehive_class.${item.beehiveClass}`)}
            value={t("pottery.kiln.beehive.class_value", {
              quantity: item.quantity,
              capacity: item.capacity,
              firings: item.firings,
            })}
          />
        ))}
      </div>
      <Alert className="border-primary/25 bg-primary/10">
        <AlertTitle>{t("pottery.kiln.beehive.guidance_title")}</AlertTitle>
        <AlertDescription>{t("pottery.kiln.beehive.guidance_body")}</AlertDescription>
      </Alert>
    </div>
  );
}

function KilnMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-border/30 bg-background/45 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none tabular-nums">{value}</p>
    </div>
  );
}

function ClassEstimate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border/25 bg-background/35 px-3 py-2.5">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">{value}</p>
    </div>
  );
}

function InventoryInput({
  label,
  description,
  value,
  onChange,
  deltas,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  deltas: number[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <NumberInput value={value} min={0} max={9999} onChange={onChange} className="w-28" aria-label={label} />
      </div>
      <NudgeRow value={value} onChange={onChange} min={0} deltas={deltas} />
    </div>
  );
}

function SummaryCard({
  planCount,
  totalItems,
  invAny,
  invFire,
  feasibility,
}: {
  planCount: number;
  totalItems: number;
  invAny: number;
  invFire: number;
  feasibility: ReturnType<typeof calcFeasibility>;
}) {
  const hasFireNeed = feasibility.totalFire > 0;
  const { t } = useTranslation();
  const statusText = planCount === 0
    ? t("pottery.summary.no_items")
    : feasibility.feasible
      ? t("pottery.summary.feasible")
      : t("pottery.summary.insufficient");

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[1.9rem] bg-card/92 surface-panel",
        planCount === 0 ? "border-border/35" : feasibility.feasible ? "border-success/30" : "border-destructive/25",
      )}
    >
      <CardContent className={cn("p-5", planCount === 0 ? "bg-background/20" : feasibility.feasible ? "bg-success/5" : "bg-destructive/10")}>
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", feasibility.feasible ? "text-success" : planCount === 0 ? "text-muted-foreground" : "text-destructive")}>
          {statusText}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Metric label={t("pottery.summary.any_needed")} value={feasibility.totalAny} danger={feasibility.shortfallAny > 0} />
          {hasFireNeed ? <Metric label={t("pottery.summary.fire_needed")} value={feasibility.totalFire} danger={feasibility.shortfallFire > 0} /> : null}
        </div>
      </CardContent>
      <CardContent className="flex flex-col gap-3 border-t border-border/30 bg-background/24 p-5 text-sm">
        {planCount === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("pottery.summary.empty")}</p>
        ) : (
          <>
            <Breakdown label={t("pottery.summary.total_items")} value={totalItems} />
            <Breakdown label={t("pottery.summary.any_have_need")} value={`${invAny} / ${feasibility.totalAny}`} danger={feasibility.shortfallAny > 0} />
            {hasFireNeed ? <Breakdown label={t("pottery.summary.fire_have_need")} value={`${invFire} / ${feasibility.totalFire}`} danger={feasibility.shortfallFire > 0} /> : null}
            {feasibility.shortfallAny > 0 ? (
              <Alert className="border-destructive/25 bg-destructive/10">
                <AlertTitle>{t("pottery.summary.any_shortfall_title")}</AlertTitle>
                <AlertDescription>{t("pottery.summary.short_by_clay", { amount: feasibility.shortfallAny })}</AlertDescription>
              </Alert>
            ) : null}
            {feasibility.shortfallFire > 0 ? (
              <Alert className="border-destructive/25 bg-destructive/10">
                <AlertTitle>{t("pottery.summary.fire_shortfall_title")}</AlertTitle>
                <AlertDescription>{t("pottery.summary.short_by_fire_clay", { amount: feasibility.shortfallFire })}</AlertDescription>
              </Alert>
            ) : null}
            {feasibility.feasible ? (
              <Alert className="border-success/25 bg-success/10">
                <AlertTitle>{t("pottery.summary.ready_title")}</AlertTitle>
                <AlertDescription>
                  {t("pottery.summary.leftover", { any: feasibility.leftoverAny, fire: feasibility.leftoverFire })}
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-[1.8rem] font-semibold leading-none tabular-nums", danger && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

function Breakdown({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold tabular-nums", danger ? "text-destructive" : "text-foreground")}>{value}</span>
    </div>
  );
}
