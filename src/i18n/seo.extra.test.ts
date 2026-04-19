import { describe, expect, it } from 'vitest';
import { getSeoContent, getAlternateLinks } from './seo';

describe('SEO route variants', () => {
  it('appends Alloy Reference suffix for /reference/', () => {
    const seo = getSeoContent('en', '/reference/');
    expect(seo.title).toContain('Alloy Reference');
    expect(seo.description).toContain('searchable alloy reference');
  });

  it('normalizes pathname missing trailing slash', () => {
    const seo = getSeoContent('en', '/reference');
    expect(seo.canonicalUrl).toContain('/reference/');
  });

  it('emits x-default in alternate links', () => {
    const alternates = getAlternateLinks('/');
    expect(alternates.find((a) => a.hrefLang === 'x-default')).toBeDefined();
  });
});
