import { describe, expect, it } from 'vitest';
import {
  stripLocalePrefix,
  getLocalePath,
  resolveLocale,
  isLocale,
} from './routing';

describe('routing edge cases', () => {
  it('returns "/" when stripping a pathless input', () => {
    expect(stripLocalePrefix('')).toBe('/');
  });

  it('preserves non-locale-prefixed paths verbatim', () => {
    expect(stripLocalePrefix('/about/')).toBe('/about/');
  });

  it('appends trailing slash when missing in normalization', () => {
    expect(getLocalePath('en', '/about')).toBe('/about/');
    expect(getLocalePath('fr', '/about')).toBe('/fr/about/');
  });

  it('collapses repeated leading slashes', () => {
    expect(getLocalePath('en', '//double//slash')).toBe('/double/slash/');
  });

  it('isLocale rejects unknown values', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('xx')).toBe(false);
  });

  it('resolveLocale ignores empty / undefined browser locale', () => {
    expect(resolveLocale('/', null, null)).toBe('en');
    expect(resolveLocale('/', null, '')).toBe('en');
  });
});
