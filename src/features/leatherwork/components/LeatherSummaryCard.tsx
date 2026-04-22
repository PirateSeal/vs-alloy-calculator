import { ArrowRight, FlaskConical, Package, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  BearVariant,
  HideProfile,
  LeatherWorkflow,
  LeatherworkCalculation,
} from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";

interface LeatherSummaryCardProps {
  calculation: LeatherworkCalculation;
  inputProfile: HideProfile;
  selectionLabel: string;
  workflow: LeatherWorkflow;
  bearVariant: BearVariant | null;
}

export function LeatherSummaryCard({
  calculation,
  inputProfile,
  selectionLabel,
  workflow,
  bearVariant,
}: LeatherSummaryCardProps) {
  const { t } = useTranslation();
  const isLeatherWorkflow = calculation.workflow === "leather";
  const resultAssetPath = isLeatherWorkflow
    ? calculation.hideProfile.leatherAssetPath
    : calculation.curedPeltAssetPath;
  const resultText = isLeatherWorkflow
    ? t("leather.summary.result_leather", {
        hides: calculation.rawHideCount,
        leather: calculation.actualLeather,
      })
    : t(`leather.summary.result_pelt.${calculation.curedPeltCount === 1 ? "one" : "other"}`, {
        hides: calculation.rawHideCount,
        pelts: calculation.curedPeltCount,
      });
  const subtitle = isLeatherWorkflow
    ? calculation.hideProfile.rawHideSubtitle
    : bearVariant
      ? t("leather.notes.bear_pelt")
      : t("leather.notes.pelt_simple");
  const showTargetNote =
    isLeatherWorkflow &&
    calculation.mode === "leather" &&
    calculation.targetLeather !== calculation.actualLeather;
  const bottleneckText = isLeatherWorkflow
    ? bearVariant
      ? t("leather.summary.bottleneck_bear")
      : t("leather.summary.bottleneck_leather")
    : bearVariant
      ? t("leather.summary.bottleneck_bear_pelt")
      : t("leather.summary.bottleneck_pelt");

  return (
    <Card className="h-full overflow-hidden border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
      <CardHeader className="pb-4">
        <CardTitle>
          {workflow === "leather" ? t("leather.summary.title") : t("leather.summary.pelt_title")}
        </CardTitle>
        <CardDescription>
          {workflow === "leather"
            ? t("leather.summary.description")
            : t("leather.summary.pelt_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="rounded-[1.75rem] bg-background/70 p-4 ring-1 ring-inset ring-border/20">
          <div className="grid gap-4 lg:grid-cols-[auto_auto_auto_minmax(0,1fr)] lg:items-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-card/90 ring-1 ring-inset ring-border/20">
              <img src={inputProfile.rawAssetPath} alt="" aria-hidden="true" className="size-12 object-contain image-outline rounded" />
            </div>
            <div className="hidden justify-center lg:flex">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex size-16 items-center justify-center rounded-3xl bg-card/90 ring-1 ring-inset ring-border/20">
              <img src={resultAssetPath} alt="" aria-hidden="true" className="size-12 object-contain image-outline rounded" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {selectionLabel}
              </p>
              <p className="mt-1 text-2xl font-semibold leading-tight text-foreground tabular-nums">{resultText}</p>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              {showTargetNote ? (
                <p className="mt-2 text-sm text-primary tabular-nums">
                  {t("leather.summary.target", { target: calculation.targetLeather })}
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
                    <img src={metric.assetPath} alt="" aria-hidden="true" className="size-8 object-contain image-outline rounded" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">{metric.value}</p>
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
            <p className="mt-2 text-sm text-muted-foreground">{bottleneckText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
