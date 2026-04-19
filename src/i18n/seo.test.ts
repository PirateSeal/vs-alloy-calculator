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
    const localized = localizeHtmlDocument(BASE_HTML, "fr");

    expect(localized).toContain('<html lang="fr">');
    expect(localized).toContain('https://vs-calculator.tcousin.com/fr/');
    expect(localized).toContain('hreflang="de"');
    expect(localized).toContain("Overview, Leatherwork & Reference");
    expect(localized).toContain("Plan metallurgy alloys, leatherworking hides");
    expect(localized).toContain('"inLanguage": "fr"');
    expect(localized).toContain('"@type": "FAQPage"');
    expect(localized).toContain("https://vs-calculator.tcousin.com/Grid_Copper_anvil.png");
  });

  it("returns locale-aware schema and social metadata", () => {
    const seo = getSeoContent("en");
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.socialImageUrl).toBe("https://vs-calculator.tcousin.com/Grid_Copper_anvil.png");
    expect(seo.title).toContain("Vintage Story Alloy Calculator");
    expect(schema).toHaveLength(2);
    expect(schema[0]["@type"]).toBe("WebApplication");
    expect(schema[1]["@type"]).toBe("FAQPage");
  });

  it("creates route-aware metadata for the shared overview page and aliases", () => {
    const seo = getSeoContent("en", "/about/");
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.canonicalUrl).toBe("https://vs-calculator.tcousin.com/");
    expect(seo.title).toContain("Overview");
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
});
