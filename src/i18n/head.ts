import { getSeoContent } from "./seo";
import type { Locale } from "./types";

function ensureMetaByName(name: string): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) {
    return existing;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  document.head.appendChild(meta);
  return meta;
}

function ensureMetaByProperty(property: string): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (existing) {
    return existing;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("property", property);
  document.head.appendChild(meta);
  return meta;
}

function ensureLink(rel: string, selector: string): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (existing) {
    return existing;
  }

  const link = document.createElement("link");
  link.setAttribute("rel", rel);
  document.head.appendChild(link);
  return link;
}

export function applySeoToDocument(locale: Locale) {
  const seo = getSeoContent(locale, window.location.pathname);

  document.documentElement.lang = locale;
  document.title = seo.title;

  ensureMetaByName("description").setAttribute("content", seo.description);
  ensureMetaByName("keywords").setAttribute("content", seo.keywords);
  ensureMetaByProperty("og:url").setAttribute("content", seo.canonicalUrl);
  ensureMetaByProperty("og:title").setAttribute("content", seo.title);
  ensureMetaByProperty("og:description").setAttribute("content", seo.description);
  ensureMetaByProperty("og:locale").setAttribute("content", seo.localeCode);
  ensureMetaByProperty("og:site_name").setAttribute("content", seo.siteName);
  ensureMetaByProperty("og:image").setAttribute("content", seo.socialImageUrl);
  ensureMetaByProperty("twitter:url").setAttribute("content", seo.canonicalUrl);
  ensureMetaByProperty("twitter:title").setAttribute("content", seo.title);
  ensureMetaByProperty("twitter:description").setAttribute("content", seo.description);
  ensureMetaByProperty("twitter:image").setAttribute("content", seo.socialImageUrl);

  const canonical = ensureLink("canonical", 'link[rel="canonical"]');
  canonical.setAttribute("href", seo.canonicalUrl);

  for (const alternate of seo.alternates) {
    const selector = `link[rel="alternate"][hreflang="${alternate.hrefLang}"]`;
    const link = ensureLink("alternate", selector);
    link.setAttribute("hreflang", alternate.hrefLang);
    link.setAttribute("href", alternate.href);
  }

  const scriptSelector = 'script[type="application/ld+json"][data-seo-schema="true"]';
  const existingScript = document.head.querySelector<HTMLScriptElement>(scriptSelector);
  const script = existingScript ?? document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.seoSchema = "true";
  script.textContent = seo.schema;
  if (!existingScript) {
    document.head.appendChild(script);
  }
}
