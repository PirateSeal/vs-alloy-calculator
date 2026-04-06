import { describe, expect, it } from "vitest";
import { getCanonicalUrl, localizeHtmlDocument } from "./seo";

const BASE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta name="description" content="English description" />
  <meta name="keywords" content="english, keywords" />
  <meta property="og:url" content="https://vs-calculator.tcousin.com/" />
  <meta property="og:title" content="English title" />
  <meta property="og:description" content="English description" />
  <meta property="og:locale" content="en_US" />
  <meta property="twitter:url" content="https://vs-calculator.tcousin.com/" />
  <meta property="twitter:title" content="English title" />
  <meta property="twitter:description" content="English description" />
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
    expect(localized).toContain('Calculateur d\'Alliages Vintage Story');
    expect(localized).toContain('"inLanguage": "fr"');
  });
});
