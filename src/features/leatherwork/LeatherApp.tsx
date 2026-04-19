import { useMemo } from "react";
import { ArrowRight, FlaskConical, Info, Package, Waves } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateLeatherPlan,
  calculatePeltPlan,
  getSelectedHideProfile,
} from "@/features/leatherwork/lib/leather";
import { HidePicker } from "@/features/leatherwork/components/HidePicker";
import { Pipeline } from "@/features/leatherwork/components/Pipeline";
import { ShoppingList } from "@/features/leatherwork/components/ShoppingList";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";
import { useLeatherUrlSync } from "@/features/leatherwork/store/useLeatherUrlSync";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherState,
  Solvent,
} from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";
 

const BEAR_SIZE_MAP: Record<BearVariant, HideSize> = {
  sun: "large",
  panda: "large",
  black: "huge",
  brown: "huge",
  polar: "huge",
};

function buildNextState(state: LeatherState, update: Partial<LeatherState>): LeatherState {
  const nextState = { ...state, ...update };

  if (nextState.workflow === "pelt") {
    nextState.mode = "hides";
  }

  if (nextState.bearVariant) {
    nextState.size = BEAR_SIZE_MAP[nextState.bearVariant];
    nextState.animalVariant = "generic";
    return nextState;
  }

  if (nextState.size !== "small") {
    nextState.animalVariant = "generic";
  }

  return nextState;
}

function getSelectionLabel(
  t: ReturnType<typeof useTranslation>["t"],
  size: HideSize,
  animalVariant: AnimalVariant,
  bearVariant: BearVariant | null,
) {
  if (bearVariant) {
    return t(`leather.bear.${bearVariant}`);
  }

  if (size === "small" && animalVariant !== "generic") {
    return t(`leather.animal.${animalVariant}`);
  }

  return t(`leather.hide_size.${size}`);
}

export function LeatherApp() {
  const { t } = useTranslation();
  const workflow = useLeatherStore((state) => state.workflow);
  const mode = useLeatherStore((state) => state.mode);
  const size = useLeatherStore((state) => state.size);
  const animalVariant = useLeatherStore((state) => state.animalVariant);
  const bearVariant = useLeatherStore((state) => state.bearVariant);
  const hideCount = useLeatherStore((state) => state.hideCount);
  const targetLeather = useLeatherStore((state) => state.targetLeather);
  const solvent = useLeatherStore((state) => state.solvent);
  const setLeatherState = useLeatherStore((state) => state.setState);
  useLeatherUrlSync();

  const calculation = useMemo(() => {
    if (workflow === "pelt") {
      return calculatePeltPlan({
        hideCount,
        size,
        animalVariant,
        bearVariant,
      });
    }

    return calculateLeatherPlan({
      hideCount,
      mode,
      size,
      solvent,
      targetLeather: mode === "leather" ? targetLeather : null,
      animalVariant,
      bearVariant,
    });
  }, [animalVariant, bearVariant, hideCount, mode, size, solvent, targetLeather, workflow]);

  const selectionLabel = getSelectionLabel(t, size, animalVariant, bearVariant);
  const isLeatherWorkflow = calculation.workflow === "leather";

  const updateState = (update: Partial<LeatherState>) => {
    setLeatherState((state) => buildNextState(state, update));
  };

  const inputProfile = getSelectedHideProfile({
    size,
    animalVariant,
    bearVariant,
    rawHideCount: hideCount,
  });

  return (
    <div className="animate-surface-in space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(20rem,0.88fr)_minmax(0,1.12fr)] xl:items-stretch">
        <section className="flex flex-col gap-4">
          <Card className="h-full border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
            <CardHeader className="pb-4">
              <CardTitle>{t("leather.title")}</CardTitle>
              <CardDescription>{t("leather.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">{t("leather.inputs.workflow")}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant={workflow === "leather" ? "default" : "outline"}
                        onClick={() => updateState({ workflow: "leather" })}
                      >
                        {t("leather.workflow.leather")}
                      </Button>
                      <Button
                        type="button"
                        variant={workflow === "pelt" ? "default" : "outline"}
                        onClick={() => updateState({ workflow: "pelt" })}
                      >
                        {t("leather.workflow.pelt")}
                      </Button>
                    </div>
                  </div>

                  {workflow === "leather" ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-foreground">{t("leather.inputs.mode")}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant={mode === "hides" ? "default" : "outline"}
                          onClick={() => updateState({ mode: "hides" })}
                        >
                          {t("leather.mode.hides")}
                        </Button>
                        <Button
                          type="button"
                          variant={mode === "leather" ? "default" : "outline"}
                          onClick={() => updateState({ mode: "leather" })}
                        >
                          {t("leather.mode.leather")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-border/20 bg-background/55">
                      <Info className="h-4 w-4" />
                      <AlertTitle>{t("leather.notes.pelt_mode_title")}</AlertTitle>
                      <AlertDescription>{t("leather.notes.pelt_mode")}</AlertDescription>
                    </Alert>
                  )}

                  <HidePicker
                    workflow={workflow}
                    size={size}
                    animalVariant={animalVariant}
                    bearVariant={bearVariant}
                    onSizeChange={(nextSize: HideSize) => updateState({ size: nextSize, bearVariant: null })}
                    onAnimalChange={(nextAnimal: AnimalVariant) => updateState({ animalVariant: nextAnimal, bearVariant: null })}
                    onBearVariantChange={(nextBear: BearVariant | null) => updateState({ bearVariant: nextBear })}
                  />

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {workflow === "leather" && mode === "leather"
                        ? t("leather.inputs.target_leather")
                        : t("leather.inputs.hide_count")}
                    </p>
                    <NumberInput
                      value={workflow === "leather" && mode === "leather" ? targetLeather : hideCount}
                      onChange={(value) =>
                        workflow === "leather" && mode === "leather"
                          ? updateState({ targetLeather: value })
                          : updateState({ hideCount: value })
                      }
                      min={1}
                      max={999}
                      className="w-full"
                      aria-label={workflow === "leather" && mode === "leather"
                        ? t("leather.inputs.target_leather")
                        : t("leather.inputs.hide_count")}
                    />
                  </div>

                  {workflow === "leather" ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-foreground">{t("leather.inputs.solvent")}</p>
                      <Select value={solvent} onValueChange={(value) => updateState({ solvent: value as Solvent })}>
                        <SelectTrigger aria-label={t("leather.inputs.solvent")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lime">{t("leather.solvent.lime")}</SelectItem>
                          <SelectItem value="borax">{t("leather.solvent.borax")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{t("leather.notes.solvent")}</p>
                    </div>
                  ) : null}

                  <Alert className="border-border/20 bg-background/55">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t("leather.notes.mixing_title")}</AlertTitle>
                    <AlertDescription>
                      {workflow === "leather"
                        ? t("leather.notes.mixing")
                        : t("leather.notes.pelt_storage")}
                      </AlertDescription>
                  </Alert>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <Card className="h-full overflow-hidden border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
            <CardHeader className="pb-4">
              <CardTitle>{workflow === "leather" ? t("leather.summary.title") : t("leather.summary.pelt_title")}</CardTitle>
              <CardDescription>
                {workflow === "leather" ? t("leather.summary.description") : t("leather.summary.pelt_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                  <div className="rounded-[1.75rem] bg-background/70 p-4 ring-1 ring-inset ring-border/20">
                    <div className="grid gap-4 lg:grid-cols-[auto_auto_auto_minmax(0,1fr)] lg:items-center">
                      <div className="flex size-16 items-center justify-center rounded-3xl bg-card/90 ring-1 ring-inset ring-border/20">
                        <img src={inputProfile.rawAssetPath} alt="" aria-hidden="true" className="size-12 object-contain" />
                      </div>
                      <div className="hidden justify-center lg:flex">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex size-16 items-center justify-center rounded-3xl bg-card/90 ring-1 ring-inset ring-border/20">
                        <img
                          src={isLeatherWorkflow ? calculation.hideProfile.leatherAssetPath : calculation.curedPeltAssetPath}
                          alt=""
                          aria-hidden="true"
                          className="size-12 object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {selectionLabel}
                        </p>
                        <p className="mt-1 text-2xl font-semibold leading-tight text-foreground">
                          {isLeatherWorkflow
                            ? `${calculation.rawHideCount} hides -> ${calculation.actualLeather} leather`
                            : `${calculation.rawHideCount} hides -> ${calculation.curedPeltCount} ${calculation.curedPeltCount === 1 ? "pelt" : "pelts"}`}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {isLeatherWorkflow
                            ? calculation.hideProfile.rawHideSubtitle
                            : bearVariant
                              ? t("leather.notes.bear_pelt")
                              : t("leather.notes.pelt_simple")}
                        </p>
                        {isLeatherWorkflow && mode === "leather" && calculation.targetLeather !== calculation.actualLeather ? (
                          <p className="mt-2 text-sm text-primary">
                            {t("leather.summary.target", { target: targetLeather })}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {calculation.summaryMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="rounded-[1.5rem] border border-border/20 bg-background/55 p-4"
                      >
                        <div className="flex items-start gap-3">
                          {metric.assetPath ? (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                              <img src={metric.assetPath} alt="" aria-hidden="true" className="size-8 object-contain" />
                            </div>
                          ) : null}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              {metric.label}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}</p>
                            {metric.hint ? <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-border/20 bg-background/55 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        {t("leather.summary.ready_first")}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {workflow === "leather"
                          ? t("leather.summary.ready_first_leather")
                          : t("leather.summary.ready_first_pelt")}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-border/20 bg-background/55 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        {workflow === "leather" ? (
                        <Waves className="h-4 w-4 text-primary" />
                        ) : (
                          <FlaskConical className="h-4 w-4 text-primary" />
                        )}
                        {t("leather.summary.bottleneck")}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isLeatherWorkflow
                          ? bearVariant
                            ? t("leather.summary.bottleneck_bear")
                            : t("leather.summary.bottleneck_leather")
                          : bearVariant
                            ? t("leather.summary.bottleneck_bear_pelt")
                            : t("leather.summary.bottleneck_pelt")}
                      </p>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {bearVariant ? (
        <section>
          <Alert className="border-border/20 bg-card/70">
            <Info className="h-4 w-4" />
            <AlertTitle>{t("leather.notes.bear_title")}</AlertTitle>
            <AlertDescription>
              {workflow === "leather" ? t("leather.notes.bear_supported_leather") : t("leather.notes.bear_supported_pelt")}
            </AlertDescription>
          </Alert>
        </section>
      ) : null}

      <section>
        <ShoppingList calculation={calculation} />
      </section>

      <section>
        <Pipeline calculation={calculation} />
      </section>
    </div>
  );
}
