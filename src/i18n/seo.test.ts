import { describe, expect, it } from "vitest";
import { getCanonicalUrl, getSeoContent, localizeHtmlDocument } from "./seo";

const BASE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta name="description" content="English description" />
  <meta name="keywords" content="english, keywords" />
  <meta property="og:url" content="https://vs-calculator.tcousin.com/" />
  <meta property="og:title" content="English title" />
  <meta property="og:description" content="English description" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="Vintage Story Alloy Calculator" />
  <meta property="og:image" content="https://vs-calculator.tcousin.com/Grid_Copper_anvil.png" />
  <meta property="twitter:url" content="https://vs-calculator.tcousin.com/" />
  <meta property="twitter:title" content="English title" />
  <meta property="twitter:description" content="English description" />
  <meta property="twitter:image" content="https://vs-calculator.tcousin.com/Grid_Copper_anvil.png" />
  <title>English title</title>
  <link rel="canonical" href="https://vs-calculator.tcousin.com/" />
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json" data-seo-schema="true">{}</script>
</head>
<body></body>
</html>`;

describe("localized SEO documents", () => {
  it("builds localized canonical URLs", () => {
    expect(getCanonicalUrl("en")).toBe("https://vs-calculator.tcousin.com/");
    expect(getCanonicalUrl("fr")).toBe("https://vs-calculator.tcousin.com/fr/");
  });

  it("rewrites HTML metadata for a localized route", () => {
    const localized = localizeHtmlDocument(
      BASE_HTML.replace("<body></body>", '<body><div id="root"></div></body>'),
      "fr",
    );

    expect(localized).toContain('<html lang="fr">');
    expect(localized).toContain('https://vs-calculator.tcousin.com/fr/');
    expect(localized).toContain('hreflang="de"');
    expect(localized).toContain("Alloy, Leather &amp; Pottery Tools");
    expect(localized).toContain("Vintage Story tool collection");
    expect(localized).toContain("Vintage Story leather calculator");
    expect(localized).toContain('"inLanguage": "fr"');
    expect(localized).toContain('"@type": "FAQPage"');
    expect(localized).toContain("https://vs-calculator.tcousin.com/Grid_Copper_anvil.png");
  });

  it("returns locale-aware schema and social metadata", () => {
    const seo = getSeoContent("en");
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.socialImageUrl).toBe("https://vs-calculator.tcousin.com/Grid_Copper_anvil.png");
    expect(seo.title).toContain("Vintage Story Calculator");
    expect(seo.keywords).toContain("Vintage Story tool");
    expect(seo.keywords).toContain("Vintage Story alloy calculator");
    expect(seo.keywords).toContain("Vintage Story leather calculator");
    expect(seo.keywords).toContain("Vintage Story pottery calculator");
    expect(schema).toHaveLength(2);
    expect(schema[0]["@type"]).toBe("WebApplication");
    expect(schema[0].alternateName).toContain("Vintage Story calculator");
    expect(schema[1]["@type"]).toBe("FAQPage");
  });

  it("creates route-aware metadata for the shared overview page and aliases", () => {
    const seo = getSeoContent("en", "/about/");
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.canonicalUrl).toBe("https://vs-calculator.tcousin.com/");
    expect(seo.title).toContain("Alloy, Leather & Pottery Tools");
    expect(seo.alternates.find((alternate) => alternate.hrefLang === "fr")?.href).toBe(
      "https://vs-calculator.tcousin.com/fr/",
    );
    expect(schema).toHaveLength(2);
    expect(schema[1]["@type"]).toBe("FAQPage");
  });

  it("creates localized planner metadata and canonical URLs", () => {
    const seo = getSeoContent("fr", "/metallurgy/planner/");

    expect(seo.canonicalUrl).toBe("https://vs-calculator.tcousin.com/fr/metallurgy/planner/");
    expect(seo.title).toContain("Planificateur de metallurgie");
    expect(seo.description).toContain("planification metallurgique basee sur l'inventaire");
    expect(seo.description).not.toContain("Includes inventory-driven metallurgy planning");
    expect(seo.alternates.find((alternate) => alternate.hrefLang === "en")?.href).toBe(
      "https://vs-calculator.tcousin.com/metallurgy/planner/",
    );
  });

  it("rewrites route metadata and prerendered content for the pottery calculator", () => {
    const html = BASE_HTML.replace("<body></body>", '<body><div id="root"></div></body>');
    const localized = localizeHtmlDocument(html, "en", "/pottery/");

    expect(localized).toContain("https://vs-calculator.tcousin.com/pottery/");
    expect(localized).toContain("Vintage Story Pottery Calculator");
    expect(localized).toContain("Clay forming recipe coverage");
    expect(localized).toContain("69 fire clay");
    expect(localized).toContain('"@type": "FAQPage"');
    expect(localized).toContain("Vintage Story pottery calculator");
  });

  it("does not prerender English pottery FAQ content on localized pottery pages", () => {
    const html = BASE_HTML.replace("<body></body>", '<body><div id="root"></div></body>');
    const localized = localizeHtmlDocument(html, "fr", "/pottery/planner/");

    expect(localized).toContain("Planificateur de poterie");
    expect(localized).toContain('"inLanguage": "fr"');
    expect(localized).not.toContain('"@type": "FAQPage"');
    expect(localized).not.toContain("How does the pottery planner handle fire clay?");
  });
});
