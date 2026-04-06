import { getSeoContent } from "./seo";
import type { Locale } from "./types";

function setMetaByName(name: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (element) {
    element.setAttribute("content", content);
  }
}

function setMetaByProperty(property: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (element) {
    element.setAttribute("content", content);
  }
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
  const seo = getSeoContent(locale);

  document.documentElement.lang = locale;
  document.title = seo.title;

  setMetaByName("description", seo.description);
  setMetaByName("keywords", seo.keywords);
  setMetaByProperty("og:url", seo.canonicalUrl);
  setMetaByProperty("og:title", seo.title);
  setMetaByProperty("og:description", seo.description);
  setMetaByProperty("og:locale", seo.localeCode);
  setMetaByProperty("twitter:url", seo.canonicalUrl);
  setMetaByProperty("twitter:title", seo.title);
  setMetaByProperty("twitter:description", seo.description);

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
