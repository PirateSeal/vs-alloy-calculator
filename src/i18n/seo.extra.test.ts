import { describe, expect, it } from 'vitest';
import { getSeoContent, getAlternateLinks } from './seo';

describe('SEO route variants', () => {
  it('uses shared reference metadata for legacy metallurgy reference aliases', () => {
    const seo = getSeoContent('en', '/metallurgy/reference/');
    expect(seo.title).toContain('Vintage Story Reference');
    expect(seo.description).toContain('shared metallurgy, pottery, and leatherwork reference');
  });

  it('normalizes pathname missing trailing slash to the shared reference route', () => {
    const seo = getSeoContent('en', '/reference');
    expect(seo.canonicalUrl).toContain('/reference/');
  });

  it('emits x-default in alternate links', () => {
    const alternates = getAlternateLinks('/');
    expect(alternates.find((a) => a.hrefLang === 'x-default')).toBeDefined();
  });

  it('creates leather metadata and canonical URLs', () => {
    const seo = getSeoContent('en', '/leather/');

    expect(seo.canonicalUrl).toBe('https://vs-calculator.tcousin.com/leather/');
    expect(seo.title).toContain('Leather Calculator');
    expect(seo.description).toContain('leatherworking pipeline');
    expect(seo.keywords).toContain('Vintage Story leather calculator');
  });

  it('creates alloy calculator metadata for Vintage Story calculator searches', () => {
    const seo = getSeoContent('en', '/metallurgy/');
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.title).toContain('Vintage Story Alloy Calculator');
    expect(seo.keywords).toContain('Vintage Story alloy calculator');
    expect(seo.keywords).toContain('Vintage Story calculator');
    expect(schema[0].alternateName).toContain('Vintage Story crucible calculator');
  });

  it('creates pottery calculator metadata, keywords, and FAQ schema', () => {
    const seo = getSeoContent('en', '/pottery/');
    const schema = JSON.parse(seo.schema) as Array<Record<string, unknown>>;

    expect(seo.canonicalUrl).toBe('https://vs-calculator.tcousin.com/pottery/');
    expect(seo.title).toContain('Pottery Calculator');
    expect(seo.description).toContain('exact clay costs');
    expect(seo.keywords).toContain('Vintage Story pottery calculator');
    expect(seo.keywords).toContain('Vintage Story clay forming calculator');
    expect(seo.faqItems[0]?.answer).toContain('69 fire clay');
    expect(schema).toHaveLength(2);
    expect(schema[0].featureList).toContain('Clay forming item and mold planner');
    expect(schema[0].keywords).toContain('Vintage Story pottery calculator');
    expect(schema[1]['@type']).toBe('FAQPage');
  });

  it('creates pottery planner metadata and localized alternates', () => {
    const seo = getSeoContent('en', '/pottery/planner');

    expect(seo.canonicalUrl).toBe('https://vs-calculator.tcousin.com/pottery/planner/');
    expect(seo.title).toContain('Pottery Planner');
    expect(seo.description).toContain('shortfalls and leftovers');
    expect(seo.keywords).toContain('clay inventory planner');
    expect(seo.alternates.find((alternate) => alternate.hrefLang === 'fr')?.href).toBe(
      'https://vs-calculator.tcousin.com/fr/pottery/planner/',
    );
  });
});
