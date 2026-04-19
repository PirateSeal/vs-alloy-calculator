import { useCallback, useEffect, useRef } from "react";
import type { AppDomain } from "@/types/app";
import { DEFAULT_LOCALE, applySeoToDocument, getLocaleFromPath } from "@/i18n";
import { track } from "@/lib/analytics";
import {
  buildCalculatorSearchFromState,
  buildPlannerSearch,
  getPathnameForMetallurgyView,
} from "@/features/metallurgy/routing/appStateRouting";
import { useMetallurgyUrlState } from "@/features/metallurgy/store/useMetallurgyUrlState";
import type { MetallurgyView } from "@/features/metallurgy/types/planner";


const ACTIVE_DOMAIN: AppDomain = "metallurgy";

function buildUrl(pathname: string, search: string, hash: string) {
  return search ? `${pathname}?${search}${hash}` : `${pathname}${hash}`;
}

export function useMetallurgyUrlSync() {
  const {
    activeView,
    calculatorCrucible,
    selectedRecipeId,
    plannerState,
    setActiveView,
    hydrateFromLocation,
  } = useMetallurgyUrlState();
  const skipNextReplaceRef = useRef(false);

  useEffect(() => {
    hydrateFromLocation(window.location.pathname, window.location.search);
  }, [hydrateFromLocation]);

  useEffect(() => {
    const handlePopState = () => {
      skipNextReplaceRef.current = true;
      hydrateFromLocation(window.location.pathname, window.location.search);
      applySeoToDocument(getLocaleFromPath(window.location.pathname) ?? DEFAULT_LOCALE);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrateFromLocation]);

  useEffect(() => {
    if (skipNextReplaceRef.current) {
      skipNextReplaceRef.current = false;
      return;
    }

    let search = "";
    if (activeView === "calculator") {
      search = buildCalculatorSearchFromState(calculatorCrucible, selectedRecipeId);
    } else if (activeView === "planner") {
      search = buildPlannerSearch(plannerState);
    }

    const nextUrl = buildUrl(window.location.pathname, search, window.location.hash);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      history.replaceState(null, "", nextUrl);
    }
  }, [activeView, calculatorCrucible, plannerState, selectedRecipeId]);

  const navigateToView = useCallback(
    (view: MetallurgyView) => {
      setActiveView(view);
      const nextPathname = getPathnameForMetallurgyView(window.location.pathname, view);
      const search =
        view === "calculator"
          ? buildCalculatorSearchFromState(calculatorCrucible, selectedRecipeId)
          : view === "planner"
            ? buildPlannerSearch(plannerState)
            : "";

      const nextUrl = buildUrl(nextPathname, search, window.location.hash);
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextUrl !== currentUrl) {
        history.pushState(null, "", nextUrl);
      }

      applySeoToDocument(getLocaleFromPath(nextPathname) ?? DEFAULT_LOCALE);
      track("tab-switched", { tab: view, domain: ACTIVE_DOMAIN });
    },
    [calculatorCrucible, plannerState, selectedRecipeId, setActiveView],
  );

  return { navigateToView };
}
