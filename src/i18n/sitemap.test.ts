import { describe, expect, it } from "vitest";
import { APP_STATIC_ROUTES } from "@/routing/routes";
import { SUPPORTED_LOCALES } from "./routing";
import { getAlternateLinks, getCanonicalUrlForPath } from "./seo";
import { generateSitemapXml } from "./sitemap";

describe("sitemap generation", () => {
  it("emits one canonical URL per static route and locale", () => {
    const sitemap = generateSitemapXml();
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    const localizedRoute = getCanonicalUrlForPath("fr", APP_STATIC_ROUTES.at(-1) ?? "/");

    expect(locs).toHaveLength(APP_STATIC_ROUTES.length * SUPPORTED_LOCALES.length);
    expect(locs).toContain("https://vs-calculator.tcousin.com/");
    expect(locs).toContain(localizedRoute);
    expect(sitemap).not.toContain("<lastmod>");
  });

  it("uses the SEO canonical and alternate link helpers", () => {
    const sitemap = generateSitemapXml();

    for (const route of APP_STATIC_ROUTES) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(sitemap).toContain(`<loc>${getCanonicalUrlForPath(locale, route)}</loc>`);
      }

      for (const alternate of getAlternateLinks(route)) {
        expect(sitemap).toContain(
          `<xhtml:link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.href}" />`,
        );
      }
    }
  });

  it("can include an explicit lastmod date when release metadata is available", () => {
    const sitemap = generateSitemapXml({ lastmod: "2026-04-24" });

    expect(sitemap).toContain("<lastmod>2026-04-24</lastmod>");
  });
});
