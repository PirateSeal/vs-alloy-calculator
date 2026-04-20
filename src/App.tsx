import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { I18nProvider } from "./i18n";
import { MetallurgyApp } from "./features/metallurgy";
import { ALLOY_RECIPES } from "@/features/metallurgy/data/alloys";
import { buildCalculatorSearchFromState, buildPlannerSearch, METALLURGY_VIEW_PATHS } from "@/features/metallurgy/routing/appStateRouting";
import { useMetallurgyStore } from "@/features/metallurgy/store/useMetallurgyStore";
import { buildLeatherSearch } from "@/features/leatherwork/routing/appStateRouting";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";
import { AppShellLayout } from "@/components/AppShellLayout";
import { OverviewPage } from "@/components/OverviewPage";
import { SharedReferencePage } from "@/components/SharedReferencePage";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LOCALE, applySeoToDocument, getLocaleFromPath } from "@/i18n";
import { trackAppNavigation } from "@/lib/analytics";
import {
  getAppDomainFromPath,
  getAppNavTargetFromPath,
  getLocalizedLeatherPath,
  getLocalizedMetallurgyPath,
  getLocalizedOverviewPath,
  getLocalizedReferencePath,
  getReferenceTabFromHash,
} from "@/routing/routes";
import type { AppDomain, AppNavTarget, ReferenceTab } from "@/types/app";

const LeatherApp = lazy(() =>
  import("./features/leatherwork").then((module) => ({ default: module.LeatherApp })),
);

function buildUrl(pathname: string, search: string, hash: string) {
  return search ? `${pathname}?${search}${hash}` : `${pathname}${hash}`;
}

function App() {
  const [railCollapsed, setRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("shell-rail-collapsed") === "true";
  });
  const [activeTarget, setActiveTarget] = useState<AppNavTarget>(() => {
    if (typeof window === "undefined") return "overview";
    return getAppNavTargetFromPath(window.location.pathname);
  });
  const [activeDomain, setActiveDomain] = useState<AppDomain>(() => {
    if (typeof window === "undefined") return "metallurgy";
    return getAppDomainFromPath(window.location.pathname, window.location.hash);
  });

  useEffect(() => {
    window.localStorage.setItem("shell-rail-collapsed", String(railCollapsed));
  }, [railCollapsed]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTarget(getAppNavTargetFromPath(window.location.pathname));
      setActiveDomain((current) =>
        getAppDomainFromPath(window.location.pathname, window.location.hash, current),
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToOverview = useCallback((domain: AppDomain) => {
    const pathname = getLocalizedOverviewPath(window.location.pathname);
    const nextUrl = buildUrl(pathname, "", "");
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const didChange = nextUrl !== currentUrl || activeTarget !== "overview" || activeDomain !== domain;

    if (nextUrl !== currentUrl) {
      history.pushState(null, "", nextUrl);
    }

    setActiveTarget("overview");
    setActiveDomain(domain);
    applySeoToDocument(getLocaleFromPath(pathname) ?? DEFAULT_LOCALE);
    if (didChange) {
      trackAppNavigation("overview", {
        previous_target: activeTarget,
        previous_domain: activeDomain,
        next_domain: domain,
      });
    }
  }, [activeDomain, activeTarget]);

  const navigateToReference = useCallback((domain: AppDomain) => {
    const pathname = getLocalizedReferencePath(window.location.pathname);
    const hash = domain === "leather" ? "#leather" : "#metallurgy";
    const nextUrl = buildUrl(pathname, "", hash);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const didChange = nextUrl !== currentUrl || activeTarget !== "reference" || activeDomain !== domain;

    if (nextUrl !== currentUrl) {
      history.pushState(null, "", nextUrl);
    }

    setActiveTarget("reference");
    setActiveDomain(domain);
    applySeoToDocument(getLocaleFromPath(pathname) ?? DEFAULT_LOCALE);
    if (didChange) {
      trackAppNavigation("reference", {
        previous_target: activeTarget,
        previous_domain: activeDomain,
        next_domain: domain,
      });
    }
  }, [activeDomain, activeTarget]);

  const navigateToLeather = useCallback(() => {
    const pathname = getLocalizedLeatherPath(window.location.pathname);
    const search = buildLeatherSearch(useLeatherStore.getState());
    const nextUrl = buildUrl(pathname, search, "");
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const didChange = nextUrl !== currentUrl || activeTarget !== "leather" || activeDomain !== "leather";

    if (nextUrl !== currentUrl) {
      history.pushState(null, "", nextUrl);
    }

    setActiveTarget("leather");
    setActiveDomain("leather");
    applySeoToDocument(getLocaleFromPath(pathname) ?? DEFAULT_LOCALE);
    if (didChange) {
      trackAppNavigation("leather", {
        previous_target: activeTarget,
        previous_domain: activeDomain,
        next_domain: "leather",
      });
    }
  }, [activeDomain, activeTarget]);

  const navigateToMetallurgy = useCallback((view: "calculator" | "planner") => {
    const metallurgyState = useMetallurgyStore.getState();
    const pathname = getLocalizedMetallurgyPath(window.location.pathname, METALLURGY_VIEW_PATHS[view]);
    const search =
      view === "calculator"
        ? buildCalculatorSearchFromState(metallurgyState.calculatorCrucible, metallurgyState.selectedRecipeId)
        : buildPlannerSearch(metallurgyState.plannerState);
    const nextUrl = buildUrl(pathname, search, "");
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const didChange = nextUrl !== currentUrl || activeTarget !== view || activeDomain !== "metallurgy";

    if (nextUrl !== currentUrl) {
      history.pushState(null, "", nextUrl);
    }

    metallurgyState.hydrateFromLocation(pathname, search ? `?${search}` : "");
    setActiveTarget(view);
    setActiveDomain("metallurgy");
    applySeoToDocument(getLocaleFromPath(pathname) ?? DEFAULT_LOCALE);
    if (didChange) {
      trackAppNavigation(view, {
        previous_target: activeTarget,
        previous_domain: activeDomain,
        next_domain: "metallurgy",
      });
    }
  }, [activeDomain, activeTarget]);

  const handleSharedNavigation = useCallback(
    (target: AppNavTarget) => {
      if (target === "overview") {
        navigateToOverview(activeDomain);
        return;
      }

      if (target === "reference") {
        navigateToReference(activeDomain);
        return;
      }

      if (target === "leather") {
        navigateToLeather();
        return;
      }

      navigateToMetallurgy(target);
    },
    [activeDomain, navigateToLeather, navigateToMetallurgy, navigateToOverview, navigateToReference],
  );

  const activeReferenceTab = getReferenceTabFromHash(
    typeof window === "undefined" ? "" : window.location.hash,
    activeDomain,
  );
  const shellDomain: AppDomain =
    activeTarget === "leather"
      ? "leather"
      : activeTarget === "calculator" || activeTarget === "planner"
        ? "metallurgy"
        : activeDomain;

  return (
    <I18nProvider>
      <Suspense
        fallback={
          <div className="min-h-dvh bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px] space-y-4">
              <Skeleton className="h-16 w-full rounded-3xl" />
              <Skeleton className="h-[24rem] w-full rounded-3xl" />
            </div>
          </div>
        }
      >
        <AppShellLayout
          activeView={activeTarget}
          activeDomain={shellDomain}
          railCollapsed={railCollapsed}
          onRailCollapsedChange={setRailCollapsed}
          onNavigate={handleSharedNavigation}
        >
          {activeTarget === "overview" ? (
            <OverviewPage onNavigate={handleSharedNavigation} />
          ) : activeTarget === "reference" ? (
            <SharedReferencePage
              recipes={ALLOY_RECIPES}
              activeTab={activeReferenceTab as ReferenceTab}
              onTabChange={(tab) => navigateToReference(tab)}
            />
          ) : activeTarget === "leather" ? (
            <LeatherApp />
          ) : (
            <MetallurgyApp />
          )}
        </AppShellLayout>
      </Suspense>
    </I18nProvider>
  );
}

export default App;
