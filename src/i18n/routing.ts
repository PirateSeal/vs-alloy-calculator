import type { Locale } from "./types";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "ru", "zh", "ja", "ko", "pl", "pt"] as const;
export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

interface LocationLike {
  hash: string;
  pathname: string;
  search: string;
}

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const [, firstSegment = ""] = pathname.split("/");
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) {
    return pathname || "/";
  }

  const stripped = pathname.slice(`/${locale}`.length);
  return stripped.length > 0 ? stripped : "/";
}

export function normalizeAppPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const collapsed = normalized.replace(/\/{2,}/g, "/");

  if (collapsed === "/") {
    return "/";
  }

  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
}

export function getLocalePath(locale: Locale, pathname: string = "/"): string {
  const basePath = normalizeAppPath(stripLocalePrefix(pathname));

  if (locale === DEFAULT_LOCALE) {
    return basePath;
  }

  return basePath === "/" ? `/${locale}/` : `/${locale}${basePath}`;
}

export function buildLocalizedUrl(
  locale: Locale,
  locationLike: LocationLike,
): string {
  const pathname = getLocalePath(locale, locationLike.pathname);
  return `${pathname}${locationLike.search}${locationLike.hash}`;
}

export function resolveLocale(
  pathname: string,
  savedLocale: Locale | null,
  browserLocale: string | null,
): Locale {
  const routeLocale = getLocaleFromPath(pathname);
  if (routeLocale) {
    return routeLocale;
  }

  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserPrefix = browserLocale?.slice(0, 2);
  if (browserPrefix && isLocale(browserPrefix)) {
    return browserPrefix;
  }

  return DEFAULT_LOCALE;
}
