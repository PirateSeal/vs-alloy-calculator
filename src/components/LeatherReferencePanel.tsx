import { FlaskConical, Package, Waves } from "lucide-react";
import {
  BEAR_DATA,
  DILUTED_BORAX_BATCH_COST,
  DILUTED_BORAX_BATCH_LITERS,
  HIDE_DATA,
  TANNIN_BATCH_LITERS,
  getMaterialAssetPath,
} from "@/features/leatherwork/lib/leather";
import {
  BEAR_OPTIONS,
  HIDE_SIZE_OPTIONS,
} from "@/features/leatherwork/data/hideOptions";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeatherReferencePanel() {
  const { t } = useTranslation();

  return (
    <div className="animate-surface-in space-y-4">
      <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-2 bg-background/25">
          <CardTitle className="text-2xl font-semibold tracking-tight">{t("reference.leather.title")}</CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {t("reference.leather.description")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/30 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Waves className="h-4 w-4 text-primary" />
              {t("reference.leather.tanning.title")}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("reference.leather.tanning.body")}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/30 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="h-4 w-4 text-primary" />
              {t("reference.leather.pelts.title")}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("reference.leather.pelts.body")}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/30 bg-background/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FlaskConical className="h-4 w-4 text-primary" />
              {t("reference.leather.solvent.title")}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("reference.leather.solvent.body", {
                liters: DILUTED_BORAX_BATCH_LITERS,
                cost: DILUTED_BORAX_BATCH_COST,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {t("reference.leather.hide_profiles.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {HIDE_SIZE_OPTIONS.map((option) => {
            const data = HIDE_DATA[option.size];
            return (
              <div
                key={option.size}
                className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                    <img src={option.assetPath} alt="" aria-hidden="true" className="size-9 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`leather.hide_size.${option.size}`)}</p>
                    <p className="text-xs text-muted-foreground">{t("reference.leather.hide_profiles.subtitle")}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>{t("reference.leather.hide_profiles.liters", { liters: data.litersPerHide })}</p>
                  <p>{t("reference.leather.hide_profiles.yield", { leather: data.leatherYield })}</p>
                  <p>{t("reference.leather.hide_profiles.barrel", { hides: data.maxPerBarrel })}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              {t("reference.leather.tannin_chain.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                  <img src={getMaterialAssetPath("weak-tannin")} alt="" aria-hidden="true" className="size-7 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("reference.leather.tannin_chain.weak_title")}</p>
                  <p className="text-xs text-muted-foreground">{t("reference.leather.tannin_chain.weak_subtitle")}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("reference.leather.tannin_chain.weak_body", { liters: TANNIN_BATCH_LITERS })}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                  <img src={getMaterialAssetPath("strong-tannin")} alt="" aria-hidden="true" className="size-7 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("reference.leather.tannin_chain.strong_title")}</p>
                  <p className="text-xs text-muted-foreground">{t("reference.leather.tannin_chain.strong_subtitle")}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("reference.leather.tannin_chain.strong_body")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              {t("reference.leather.workflow_timing.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
              <p className="font-semibold text-foreground">{t("reference.leather.workflow_timing.soak_title")}</p>
              <p className="mt-2 leading-6">{t("reference.leather.workflow_timing.soak_body")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
              <p className="font-semibold text-foreground">{t("reference.leather.workflow_timing.prepare_title")}</p>
              <p className="mt-2 leading-6">{t("reference.leather.workflow_timing.prepare_body")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
              <p className="font-semibold text-foreground">{t("reference.leather.workflow_timing.finish_title")}</p>
              <p className="mt-2 leading-6">{t("reference.leather.workflow_timing.finish_body")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {t("reference.leather.bears.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {BEAR_OPTIONS.map((option) => {
            const data = BEAR_DATA[option.variant];
            return (
              <div key={option.variant} className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                    <img src={option.assetPath} alt="" aria-hidden="true" className="size-7 object-contain" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{t(`leather.bear.${option.variant}`)}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>{t("reference.leather.bears.raw_size", { size: t(`leather.hide_size.${data.rawSize}`) })}</p>
                  <p>{t("reference.leather.bears.scrape_result", { hides: data.scrapedHugeHides })}</p>
                  <p>{t("reference.leather.bears.pelt_fat", { fat: data.peltFatCost })}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {t("reference.leather.pelt_reference.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
            <p className="text-sm font-semibold text-foreground">{t("reference.leather.pelt_reference.generic_title")}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("reference.leather.pelt_reference.generic_body")}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/30 bg-background/45 p-4">
            <p className="text-sm font-semibold text-foreground">{t("reference.leather.pelt_reference.bear_title")}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("reference.leather.pelt_reference.bear_body")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
