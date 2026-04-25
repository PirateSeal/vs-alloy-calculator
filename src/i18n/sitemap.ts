import { APP_STATIC_ROUTES } from "../routing/routes";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./routing";
import { getAlternateLinks, getCanonicalUrlForPath } from "./seo";
import type { Locale } from "./types";

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

function getRoutePriority(route: string, locale: Locale): string {
  if (route === "/") {
    return locale === DEFAULT_LOCALE ? "1.0" : "0.9";
  }

  if (route === "/metallurgy/" || route === "/leather/" || route === "/pottery/") {
    return locale === DEFAULT_LOCALE ? "0.95" : "0.85";
  }

  if (route.endsWith("/planner/")) {
    return locale === DEFAULT_LOCALE ? "0.9" : "0.8";
  }

  return locale === DEFAULT_LOCALE ? "0.8" : "0.7";
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
        "    <changefreq>weekly</changefreq>",
        `    <priority>${getRoutePriority(route, locale)}</priority>`,
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
