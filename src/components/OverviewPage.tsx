import { Amphora, BookOpen, Calculator, Hammer, Package } from "lucide-react";
import { useTranslation } from "@/i18n";
import type { AppNavTarget } from "@/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@/lib/analytics";

interface OverviewPageProps {
  onNavigate: (target: AppNavTarget) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const { t, getRecipeName } = useTranslation();
  const seo = t("overview.hero.description");
  const featuredAlloys = ["tin-bronze", "bismuth-bronze", "black-bronze", "electrum"];

  return (
    <section className="animate-surface-in space-y-4" aria-labelledby="overview-title">
      <div className="overflow-hidden rounded-[2rem] border border-border/30 bg-card/90 shadow-sm ring-1 ring-inset ring-border/20">
        <div className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(133,180,255,0.12),transparent_38%)]" />
          <div className="relative space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
              {t("overview.hero.eyebrow")}
            </p>
            <div className="space-y-3">
              <h1 id="overview-title" className="max-w-4xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.8rem]">
                {t("overview.hero.title")}
              </h1>
              <p className="max-w-4xl text-base leading-7 text-muted-foreground sm:text-[1.05rem]">
                {seo}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredAlloys.map((recipeId) => (
                <Badge
                  key={recipeId}
                  variant="secondary"
                  className="rounded-full border border-border/45 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {getRecipeName(recipeId)}
                </Badge>
              ))}
              <Badge
                variant="secondary"
                className="rounded-full border border-border/45 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {t("header.domain.leather")}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full border border-border/45 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {t("header.domain.pottery")}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => onNavigate("calculator")} className="gap-2 rounded-full">
                <Calculator data-icon="inline-start" />
                {t("overview.actions.metallurgy")}
              </Button>
              <Button type="button" variant="outline" onClick={() => onNavigate("leather")} className="gap-2 rounded-full">
                <Hammer data-icon="inline-start" />
                {t("overview.actions.leather")}
              </Button>
              <Button type="button" variant="outline" onClick={() => onNavigate("pottery-calculator")} className="gap-2 rounded-full">
                <Amphora data-icon="inline-start" />
                {t("header.domain.pottery")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onNavigate("reference")} className="gap-2 rounded-full">
                <BookOpen data-icon="inline-start" />
                {t("overview.actions.reference")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <a
                href="https://wiki.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("external-link", { destination: "wiki", source: "overview" })}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.wiki")}
              </a>
              <a
                href="https://www.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("external-link", { destination: "vintage-story", source: "overview" })}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.vs_website")}
              </a>
              <a
                href="https://github.com/PirateSeal/vs-alloy-calculator"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("external-link", { destination: "github", source: "overview" })}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.github")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{t("overview.metallurgy.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">{t("overview.metallurgy.body")}</p>
            <Button type="button" variant="outline" onClick={() => onNavigate("planner")} className="rounded-full">
              {t("planner.title")}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{t("overview.leather.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">{t("overview.leather.body")}</p>
            <Button type="button" variant="outline" onClick={() => onNavigate("leather")} className="rounded-full">
              {t("leather.title")}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{t("overview.reference.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">{t("overview.reference.body")}</p>
            <Button type="button" variant="outline" onClick={() => onNavigate("reference")} className="rounded-full">
              {t("header.nav.reference")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{t("overview.workflow.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/35 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calculator className="h-4 w-4 text-primary" />
                {t("overview.workflow.metallurgy_title")}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("overview.workflow.metallurgy_body")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/35 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Package className="h-4 w-4 text-primary" />
                {t("overview.workflow.leather_title")}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("overview.workflow.leather_body")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{t("overview.faq.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["q1", "q2", "q3"].map((key) => (
              <details
                key={key}
                className="group rounded-2xl border border-border/35 bg-background/45 px-4 py-3"
              >
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold leading-6 text-foreground marker:content-none">
                  {t(`overview.faq.${key}.question`)}
                </summary>
                <p className="pt-2 text-sm leading-6 text-muted-foreground">
                  {t(`overview.faq.${key}.answer`)}
                </p>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
