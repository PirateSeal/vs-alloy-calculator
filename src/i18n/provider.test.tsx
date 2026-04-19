import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nProvider } from './provider';
import { useTranslation } from './index';

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
  });

  it('defaults to English when nothing else hints at a locale', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('en');
    expect(result.current.t('common.and')).toBe('and');
  });

  it('reads saved locale from localStorage', () => {
    localStorage.setItem('locale', 'fr');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('fr');
  });

  it('ignores invalid saved locale value', () => {
    localStorage.setItem('locale', 'xx');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('uses route locale prefix over storage and browser', () => {
    localStorage.setItem('locale', 'fr');
    history.replaceState(null, '', '/de/');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('de');
  });

  it('persists locale to localStorage when changed', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    act(() => result.current.setLocale('es'));
    expect(result.current.locale).toBe('es');
    expect(localStorage.getItem('locale')).toBe('es');
  });

  it('substitutes vars in translation string', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('crucible.slot.label', { n: 3 })).toBe('Slot 3');
  });

  it('falls back to English when key missing in active locale', () => {
    localStorage.setItem('locale', 'fr');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('common.and')).toBeTruthy();
  });

  it('returns the key itself when missing in all locales', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('does.not.exist.anywhere')).toBe('does.not.exist.anywhere');
  });

  it('exposes metal and recipe label helpers', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.getMetalLabel('copper')).toBe('Copper');
    expect(result.current.getMetalShortLabel('copper')).toBe('Cu');
    expect(result.current.getRecipeName('tin-bronze')).toBe('Tin Bronze');
    expect(result.current.getRecipeNotes('tin-bronze')).toBeTruthy();
  });

  it('updates URL pathname when switching locale away from default', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    act(() => result.current.setLocale('fr'));
    expect(window.location.pathname.startsWith('/fr')).toBe(true);
  });

  it('updates locale when popstate changes the locale prefix', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      history.pushState(null, '', '/fr/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.locale).toBe('fr');
  });

  it('throws when useTranslation called outside provider', () => {
    expect(() => renderHook(() => useTranslation())).toThrow(
      /useTranslation must be used within I18nProvider/,
    );
  });
});
