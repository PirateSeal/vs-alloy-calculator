import { describe, it, expect, beforeEach } from 'vitest';
import { applySeoToDocument } from './head';

function metaContent(name: string): string | null {
  return document.head
    .querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    ?.getAttribute('content') ?? null;
}

function metaPropertyContent(property: string): string | null {
  return document.head
    .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    ?.getAttribute('content') ?? null;
}

describe('applySeoToDocument', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    history.replaceState(null, '', '/');
  });

  it('sets html lang and document title', () => {
    applySeoToDocument('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(document.title).toContain('Vintage Story');
  });

  it('creates description, keywords, og and twitter meta tags', () => {
    applySeoToDocument('en');
    expect(metaContent('description')).toBeTruthy();
    expect(metaContent('keywords')).toBeTruthy();
    expect(metaPropertyContent('og:title')).toBeTruthy();
    expect(metaPropertyContent('og:description')).toBeTruthy();
    expect(metaPropertyContent('og:locale')).toBe('en_US');
    expect(metaPropertyContent('og:image')).toContain('Grid_Copper_anvil');
    expect(metaPropertyContent('twitter:title')).toBeTruthy();
    expect(metaPropertyContent('twitter:image')).toBeTruthy();
  });

  it('creates canonical link', () => {
    applySeoToDocument('en');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://vs-calculator.tcousin.com/');
  });

  it('emits hreflang alternates for every supported locale', () => {
    applySeoToDocument('en');
    const alternates = document.head.querySelectorAll('link[rel="alternate"]');
    expect(alternates.length).toBeGreaterThanOrEqual(10);
    const fr = document.head.querySelector('link[rel="alternate"][hreflang="fr"]');
    expect(fr?.getAttribute('href')).toContain('/fr/');
  });

  it('injects JSON-LD schema script tagged with data-seo-schema', () => {
    applySeoToDocument('en');
    const script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-seo-schema="true"]',
    );
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent!);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('reuses existing tags instead of duplicating on second call', () => {
    applySeoToDocument('en');
    applySeoToDocument('fr');
    const descMetas = document.head.querySelectorAll('meta[name="description"]');
    expect(descMetas).toHaveLength(1);
    const titleScripts = document.head.querySelectorAll(
      'script[type="application/ld+json"][data-seo-schema="true"]',
    );
    expect(titleScripts).toHaveLength(1);
    expect(metaPropertyContent('og:locale')).toBe('fr_FR');
  });

  it('reflects pathname in canonical url', () => {
    history.replaceState(null, '', '/about/');
    applySeoToDocument('en');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://vs-calculator.tcousin.com/');
  });

  it('applies pottery planner metadata from the current pathname', () => {
    history.replaceState(null, '', '/pottery/planner/');
    applySeoToDocument('en');

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const schema = JSON.parse(
      document.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-seo-schema="true"]',
      )!.textContent!,
    ) as Array<Record<string, unknown>>;

    expect(document.title).toContain('Pottery Planner');
    expect(metaContent('description')).toContain('shortfalls and leftovers');
    expect(metaContent('keywords')).toContain('clay inventory planner');
    expect(canonical?.getAttribute('href')).toBe('https://vs-calculator.tcousin.com/pottery/planner/');
    expect(schema[1]['@type']).toBe('FAQPage');
  });
});
