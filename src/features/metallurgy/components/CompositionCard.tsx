import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METALS } from "../data/alloys";
import { useTranslation } from "@/i18n";
import { getRarityScore } from "../lib/metalRarity";
import type { AlloyMatchDetail, MetalAmount } from "../lib/alloyLogic";

interface CompositionCardProps {
  amounts: MetalAmount[];
  totalNuggets: number;
  totalUnits: number;
  bestMatch: AlloyMatchDetail | null;
}

export function CompositionCard({
  amounts,
  totalNuggets,
  totalUnits,
  bestMatch,
}: CompositionCardProps) {
  const { t, getMetalLabel, getMetalShortLabel, getRecipeName } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showValidSweetSpots, setShowValidSweetSpots] = useState(false);
  const metalMap = useMemo(() => new Map(METALS.map((metal) => [metal.id, metal])), []);
  const totalRarityCost = useMemo(
    () => amounts.reduce((total, amount) => total + amount.nuggets * getRarityScore(amount.metalId), 0),
    [amounts],
  );
  const sweetSpotsExpanded = bestMatch?.isExact ? showValidSweetSpots : true;

  if (totalUnits === 0) {
    return (
      <Card className="surface-panel overflow-hidden rounded-[1.9rem] border border-border/35 bg-card/92">
        <CardHeader className="border-b border-border/30 bg-background/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">{t("composition.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <p className="surface-subtle rounded-[1.4rem] bg-background/30 px-4 py-6 text-center text-sm text-muted-foreground ring-1 ring-inset ring-border/25" data-pretty-text>
            {t("composition.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const contentId = "composition-panel";
  const chartLabel = amounts
    .map((amount) => {
      const metal = metalMap.get(amount.metalId);
      return t("composition.bar_chart_segment", {
        metal: metal ? getMetalLabel(metal.id) : amount.metalId,
        percent: amount.percent.toFixed(1),
      });
    })
    .join(", ");

  return (
    <Card className="surface-panel animate-surface-in animate-delay-3 overflow-hidden rounded-[1.9rem] border border-border/35 bg-card/92">
      <CardHeader className="border-b border-border/30 bg-background/20 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <CardTitle className="text-lg">{t("composition.title")}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("composition.total_amount")}:{" "}
                <span className="font-mono text-foreground tabular-nums">
                  {totalNuggets}
                </span>{" "}
                {t(totalNuggets === 1 ? "common.nugget" : "common.nuggets")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/60 transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-accent/50 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden motion-reduce:active:scale-100"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            aria-label={t("composition.title")}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </CardHeader>

      <CardContent
        id={contentId}
        className={`space-y-4 p-5 ${isExpanded ? "block" : "hidden sm:block"}`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-subtle rounded-[1.4rem] bg-background/30 p-4 ring-1 ring-inset ring-border/25">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("composition.total_amount")}
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              <span className="font-mono tabular-nums">{totalNuggets}</span>{" "}
              {t(totalNuggets === 1 ? "common.nugget" : "common.nuggets")}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono tabular-nums text-foreground">{totalUnits}</span>{" "}
              {t(totalUnits === 1 ? "common.unit" : "common.units")}
            </p>
          </div>

          <div className="surface-subtle rounded-[1.4rem] bg-background/30 p-4 ring-1 ring-inset ring-border/25">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("composition.rarity_cost")}
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-foreground tabular-nums">
              {totalRarityCost.toFixed(1)}
            </p>
            {bestMatch ? (
              <p className="text-sm text-muted-foreground">{getRecipeName(bestMatch.recipe.id)}</p>
            ) : null}
          </div>
        </div>

        <section className="space-y-3" aria-label={t("composition.title")}>
          <div
            className="surface-subtle flex h-5 overflow-hidden rounded-full bg-background/65 ring-1 ring-inset ring-border/30"
            role="img"
            aria-label={t("composition.bar_chart_aria", { segments: chartLabel })}
          >
            {amounts.map((amount, index) => {
              const metal = metalMap.get(amount.metalId);

              if (!metal) return null;

              return (
                <div
                  key={amount.metalId}
                  className={index === 0 ? "" : "border-l-2 border-background/80"}
                  style={{
                    width: `${amount.percent}%`,
                    backgroundColor: metal.color,
                  }}
                  title={t("composition.segment_title", {
                    metal: getMetalLabel(metal.id),
                    percent: amount.percent.toFixed(1),
                  })}
                  aria-hidden="true"
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {amounts.map((amount) => {
              const metal = metalMap.get(amount.metalId);

              return (
                <Badge
                  key={amount.metalId}
                  variant="secondary"
                  className="surface-chip h-8 rounded-full border border-border/45 px-2.5 text-[11px] font-semibold"
                  style={
                    metal
                      ? {
                          backgroundColor: `${metal.color}18`,
                          color: metal.color,
                        }
                      : undefined
                  }
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={metal ? { backgroundColor: metal.color } : undefined}
                    aria-hidden="true"
                  />
                  {metal ? getMetalShortLabel(metal.id) : amount.metalId} {amount.percent.toFixed(1)}%
                </Badge>
              );
            })}
          </div>
        </section>

        {bestMatch ? (
          <section className="space-y-3 border-t border-border/30 pt-4" aria-label={t("composition.sweet_spots", { alloy: getRecipeName(bestMatch.recipe.id) })}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("composition.sweet_spots", { alloy: getRecipeName(bestMatch.recipe.id) })}
              </h3>
              <div className="flex items-center gap-2">
                {bestMatch.isExact && (
                  <Badge variant="secondary" className="surface-chip h-8 rounded-full border border-success/30 bg-success/10 px-2.5 text-[11px] font-semibold text-success">
                    <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    {t("composition.status_valid")}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => setShowValidSweetSpots((current) => !current)}
                  className="surface-chip inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/50 text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-accent/40 hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:active:scale-100"
                  aria-expanded={sweetSpotsExpanded}
                  aria-label={t("composition.sweet_spots", { alloy: getRecipeName(bestMatch.recipe.id) })}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${sweetSpotsExpanded ? "" : "-rotate-90"}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {sweetSpotsExpanded ? (
            <div className="space-y-2">
              {bestMatch.recipe.components.map((component) => {
                const metal = metalMap.get(component.metalId);
                const actualAmount = amounts.find((amount) => amount.metalId === component.metalId);
                const actualPercent = actualAmount?.percent || 0;
                const isValid = actualPercent >= component.minPercent && actualPercent <= component.maxPercent;
                const isTooLow = actualPercent < component.minPercent;

                return (
                  <div
                    key={component.metalId}
                    className="surface-subtle space-y-2 rounded-[1.35rem] bg-background/25 p-3 ring-1 ring-inset ring-border/25"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <img
                          src={metal?.nuggetImage}
                          alt=""
                          className="image-outline h-5 w-5 rounded-md bg-background/70 p-0.5 object-contain"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-sm font-medium">
                          {metal ? getMetalLabel(metal.id) : component.metalId}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {actualPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="relative h-7 overflow-hidden rounded-full bg-background/70 ring-1 ring-inset ring-border/35">
                      <div
                        className="absolute h-full rounded-full bg-success/45 ring-1 ring-inset ring-success/80"
                        style={{
                          left: `${component.minPercent}%`,
                          width: `${component.maxPercent - component.minPercent}%`,
                        }}
                      />
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                        style={{
                          left: `${Math.min(100, Math.max(0, actualPercent))}%`,
                          backgroundColor: isValid ? "#22c55e" : isTooLow ? "#ef4444" : "#f97316",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={
                          isValid
                            ? "inline-flex items-center gap-1 font-medium text-success"
                            : isTooLow
                              ? "inline-flex items-center gap-1 font-medium text-destructive"
                              : "inline-flex items-center gap-1 font-medium text-primary"
                        }
                      >
                        {isValid ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        {!isValid && isTooLow ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        {!isValid && !isTooLow ? <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        {isValid
                          ? t("composition.status_valid")
                          : isTooLow
                            ? `+${(component.minPercent - actualPercent).toFixed(1)}%`
                            : `-${(actualPercent - component.maxPercent).toFixed(1)}%`}
                      </span>
                      <span className="text-muted-foreground">
                        {component.minPercent}-{component.maxPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : null}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
