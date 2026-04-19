import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAnalyticsLocale, track } from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    window.umami = { track: vi.fn() };
  });

  afterEach(() => {
    delete window.umami;
    setAnalyticsLocale('en');
  });

  it('does not throw when umami absent', () => {
    delete window.umami;
    expect(() => track('event')).not.toThrow();
  });

  it('forwards event with default locale', () => {
    track('click', { id: 'btn' });
    expect(window.umami!.track).toHaveBeenCalledWith('click', { locale: 'en', id: 'btn' });
  });

  it('uses updated locale after setAnalyticsLocale', () => {
    setAnalyticsLocale('fr');
    track('view');
    expect(window.umami!.track).toHaveBeenCalledWith('view', { locale: 'fr' });
  });

  it('caller-provided locale overrides default', () => {
    track('view', { locale: 'de' });
    expect(window.umami!.track).toHaveBeenCalledWith('view', { locale: 'de' });
  });
});
