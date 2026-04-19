import { METALLURGY_APP_ROUTES, METALLURGY_VIEW_PATHS } from "../features/metallurgy/routing/routes";
import { getLocaleFromPath, normalizeAppPath, stripLocalePrefix } from "../i18n/routing";
import type { AppDomain, AppNavTarget, ReferenceTab } from "../types/app";

export const OVERVIEW_ROUTE_PATH = "/";
export const REFERENCE_ROUTE_PATH = "/reference/";
export const LEATHER_ROUTE_PATH = "/leather/";
export const LEGACY_OVERVIEW_ROUTE_PATHS = ["/about/", "/metallurgy/about/"] as const;
export const LEGACY_REFERENCE_ROUTE_PATHS = ["/metallurgy/reference/"] as const;

export const APP_STATIC_ROUTES = [
  OVERVIEW_ROUTE_PATH,
  REFERENCE_ROUTE_PATH,
  ...METALLURGY_APP_ROUTES,
  LEATHER_ROUTE_PATH,
] as const;

function normalizePath(pathname: string): string {
  return normalizeAppPath(stripLocalePrefix(pathname || OVERVIEW_ROUTE_PATH));
}

function isLegacyOverviewPath(pathname: string): boolean {
  return LEGACY_OVERVIEW_ROUTE_PATHS.includes(pathname as (typeof LEGACY_OVERVIEW_ROUTE_PATHS)[number]);
}

function isLegacyReferencePath(pathname: string): boolean {
  return LEGACY_REFERENCE_ROUTE_PATHS.includes(pathname as (typeof LEGACY_REFERENCE_ROUTE_PATHS)[number]);
}

export function getCanonicalAppPath(pathname: string): string {
  const normalized = normalizePath(pathname);

  if (normalized === LEATHER_ROUTE_PATH) {
    return LEATHER_ROUTE_PATH;
  }

  if (normalized === METALLURGY_VIEW_PATHS.calculator) {
    return METALLURGY_VIEW_PATHS.calculator;
  }

  if (normalized === METALLURGY_VIEW_PATHS.planner) {
    return METALLURGY_VIEW_PATHS.planner;
  }

  if (normalized === REFERENCE_ROUTE_PATH || isLegacyReferencePath(normalized)) {
    return REFERENCE_ROUTE_PATH;
  }

  if (normalized === OVERVIEW_ROUTE_PATH || isLegacyOverviewPath(normalized)) {
    return OVERVIEW_ROUTE_PATH;
  }

  return OVERVIEW_ROUTE_PATH;
}

export function getAppNavTargetFromPath(pathname: string): AppNavTarget {
  const canonicalPath = getCanonicalAppPath(pathname);

  if (canonicalPath === LEATHER_ROUTE_PATH) {
    return "leather";
  }

  if (canonicalPath === METALLURGY_VIEW_PATHS.calculator) {
    return "calculator";
  }

  if (canonicalPath === METALLURGY_VIEW_PATHS.planner) {
    return "planner";
  }

  if (canonicalPath === REFERENCE_ROUTE_PATH) {
    return "reference";
  }

  return "overview";
}

export function getReferenceTabFromHash(hash: string, fallback: ReferenceTab = "metallurgy"): ReferenceTab {
  if (hash === "#leather") {
    return "leather";
  }

  if (hash === "#metallurgy") {
    return "metallurgy";
  }

  return fallback;
}

export function getAppDomainFromPath(
  pathname: string,
  hash = "",
  fallback: AppDomain = "metallurgy",
): AppDomain {
  const target = getAppNavTargetFromPath(pathname);

  if (target === "leather") {
    return "leather";
  }

  if (target === "calculator" || target === "planner") {
    return "metallurgy";
  }

  if (target === "reference") {
    return getReferenceTabFromHash(hash, fallback);
  }

  return fallback;
}

export function getLocalizedAppPath(currentPathname: string, nextPath: string): string {
  const locale = getLocaleFromPath(currentPathname);

  if (!locale) {
    return nextPath;
  }

  return nextPath === OVERVIEW_ROUTE_PATH ? `/${locale}/` : `/${locale}${nextPath}`;
}

export function getLocalizedOverviewPath(currentPathname: string): string {
  return getLocalizedAppPath(currentPathname, OVERVIEW_ROUTE_PATH);
}

export function getLocalizedReferencePath(currentPathname: string): string {
  return getLocalizedAppPath(currentPathname, REFERENCE_ROUTE_PATH);
}

export function getLocalizedLeatherPath(currentPathname: string): string {
  return getLocalizedAppPath(currentPathname, LEATHER_ROUTE_PATH);
}

export function getLocalizedMetallurgyPath(
  currentPathname: string,
  viewPath: string = METALLURGY_VIEW_PATHS.calculator,
): string {
  return getLocalizedAppPath(currentPathname, viewPath);
}
