import { APP_STATIC_ROUTES } from "../routing/routes";
import { SUPPORTED_LOCALES } from "./routing";
import { getAlternateLinks, getCanonicalUrlForPath } from "./seo";

interface SitemapOptions {
  lastmod?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateSitemapXml(options: SitemapOptions = {}): string {
  const urls = APP_STATIC_ROUTES.flatMap((route) =>
    SUPPORTED_LOCALES.map((locale) => {
      const loc = getCanonicalUrlForPath(locale, route);
      const alternateMarkup = getAlternateLinks(route)
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hrefLang)}" href="${escapeXml(alternate.href)}" />`,
        )
        .join("\n");
      const lastmodMarkup = options.lastmod ? [`    <lastmod>${escapeXml(options.lastmod)}</lastmod>`] : [];

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        ...lastmodMarkup,
        alternateMarkup,
        "  </url>",
      ].join("\n");
    }),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
