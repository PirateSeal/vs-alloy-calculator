import { describe, expect, it } from 'vitest';
import { getSeoContent, getAlternateLinks } from './seo';

describe('SEO route variants', () => {
  it('uses shared reference metadata for legacy metallurgy reference aliases', () => {
    const seo = getSeoContent('en', '/metallurgy/reference/');
    expect(seo.title).toContain('Vintage Story Reference');
    expect(seo.description).toContain('shared metallurgy and leatherwork reference');
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
    expect(seo.title).toContain('Leather Planner');
    expect(seo.description).toContain('leatherworking pipeline');
  });
});
