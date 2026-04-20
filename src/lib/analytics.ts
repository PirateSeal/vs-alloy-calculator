import { getAppDomainFromPath, getAppNavTargetFromPath, getCanonicalAppPath, getReferenceTabFromHash } from "@/routing/routes";
import type { AppNavTarget, ReferenceTab } from "@/types/app";

type EventData = Record<string, unknown>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: EventData) => void };
  }
}

let _locale = "en";

function getRouteContext(): EventData {
  if (typeof window === "undefined") {
    return { locale: _locale };
  }

  const routeTarget = getAppNavTargetFromPath(window.location.pathname);
  const routeDomain = getAppDomainFromPath(window.location.pathname, window.location.hash);
  const context: EventData = {
    locale: _locale,
    route_target: routeTarget,
    route_domain: routeDomain,
    route_path: getCanonicalAppPath(window.location.pathname),
  };

  if (routeTarget === "reference") {
    context.reference_tab = getReferenceTabFromHash(window.location.hash, routeDomain);
  }

  return context;
}

export function setAnalyticsLocale(locale: string) {
  _locale = locale;
}

export function track(name: string, data?: EventData) {
  if (typeof window === "undefined") return;
  window.umami?.track(name, { ...getRouteContext(), ...data });
}

export function trackAppNavigation(
  target: AppNavTarget,
  data?: EventData,
) {
  track("app-navigation", { target, ...data });
}

export function trackReferenceTabChange(tab: ReferenceTab, data?: EventData) {
  track("reference-tab-changed", { tab, ...data });
}

export function trackPlannerInputChange(field: string, data?: EventData) {
  track("planner-input-changed", { field, ...data });
}

export function trackPlannerPlanToggle(data?: EventData) {
  track("planner-plan-toggled", data);
}

export function trackPlannerOpenInCalculator(data?: EventData) {
  track("planner-open-in-calculator", data);
}

export function trackLeatherInputChange(field: string, data?: EventData) {
  track("leather-input-changed", { field, ...data });
}
