import { ArrowDown, Clock3, PackageOpen } from "lucide-react";
import type { LeatherworkCalculation } from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineProps {
  calculation: LeatherworkCalculation;
}

export function Pipeline({ calculation }: PipelineProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Alert className="border-border/20 bg-card/70">
        <Clock3 className="h-4 w-4" />
        <AlertTitle>{t("leather.pipeline.time_title")}</AlertTitle>
        <AlertDescription>{t("leather.pipeline.time_note")}</AlertDescription>
      </Alert>

      <Card className="border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
        <CardHeader className="pb-4">
          <CardTitle>{t("leather.pipeline.title")}</CardTitle>
          <CardDescription>
            {calculation.workflow === "leather"
              ? t("leather.pipeline.description_leather")
              : t("leather.pipeline.description_pelt")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="stagger-surface-children flex flex-col gap-3">
            {calculation.pipeline.map((step, index) => (
              <div key={step.id} className="flex flex-col gap-3">
                <div className="grid gap-3 rounded-[1.75rem] border border-border/20 bg-background/55 p-4 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary tabular-nums">
                      {index + 1}
                    </div>
                    {step.stageAsset ? (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                        <img src={step.stageAsset} alt="" aria-hidden="true" className="size-10 object-contain image-outline rounded" />
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground"><span className="tabular-nums">{step.duration}</span> · {step.summary}</p>
                    {step.note ? (
                      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-card/75 px-3 py-2.5 ring-1 ring-inset ring-border/20">
                        <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm text-muted-foreground">{step.note}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-2xl bg-card/75 px-3 py-3 ring-1 ring-inset ring-border/20">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t("leather.pipeline.in")}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/90">
                        {step.inputs.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-card/75 px-3 py-3 ring-1 ring-inset ring-border/20">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t("leather.pipeline.out")}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/90">
                        {step.outputs.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {index < calculation.pipeline.length - 1 ? (
                  <div className="hidden justify-center lg:flex">
                    <div className="flex h-8 items-center justify-center rounded-full bg-card/80 px-4 text-muted-foreground ring-1 ring-inset ring-border/20">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
