import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSeoContent, useTranslation } from "@/i18n";

export function SeoLandingContent() {
  const { locale, t, getRecipeName } = useTranslation();
  const seo = getSeoContent(locale);

  return (
    <section className="animate-surface-in animate-delay-1 space-y-4" aria-labelledby="seo-hero-title">
      <div className="overflow-hidden rounded-[2rem] border border-border/30 bg-card/90 shadow-sm ring-1 ring-inset ring-border/20">
        <div className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(133,180,255,0.12),transparent_38%)]" />
          <div className="relative space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
              {seo.heroEyebrow}
            </p>
            <div className="space-y-3">
              <h1 id="seo-hero-title" className="max-w-4xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.8rem]">
                {seo.heroTitle}
              </h1>
              <p className="max-w-4xl text-base leading-7 text-muted-foreground sm:text-[1.05rem]">
                {seo.heroDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {seo.supportedAlloyIds.map((recipeId) => (
                <Badge
                  key={recipeId}
                  variant="secondary"
                  className="rounded-full border border-border/45 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {getRecipeName(recipeId)}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <a
                href="https://wiki.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.wiki")}
              </a>
              <a
                href="https://www.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.vs_website")}
              </a>
              <a
                href="https://github.com/PirateSeal/vs-alloy-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("header.nav.github")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="stagger-surface-children grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{seo.supportedAlloysHeading}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{seo.supportedAlloysBody}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{seo.howItWorksHeading}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{seo.howItWorksBody}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{seo.planningHeading}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{seo.planningBody}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
        <CardHeader className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{seo.faqHeading}</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {seo.faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-border/35 bg-background/45 px-4 py-3"
            >
              <summary className="cursor-pointer list-none pr-6 text-sm font-semibold leading-6 text-foreground marker:content-none">
                {item.question}
              </summary>
              <p className="pt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
