import { useEffect, useRef } from "react";
import { DEFAULT_LOCALE, applySeoToDocument, getLocaleFromPath } from "@/i18n";
import {
  buildPotteryCalculatorSearch,
  buildPotteryPlannerSearch,
} from "@/features/pottery/routing/appStateRouting";
import { usePotteryStore } from "@/features/pottery/store/usePotteryStore";

function buildUrl(pathname: string, search: string, hash: string) {
  return search ? `${pathname}?${search}${hash}` : `${pathname}${hash}`;
}

export function usePotteryUrlSync() {
  const { activeView, calculatorState, plannerState, hydrateFromLocation } = usePotteryStore();
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

    const search =
      activeView === "pottery-calculator"
        ? buildPotteryCalculatorSearch(calculatorState)
        : buildPotteryPlannerSearch(plannerState);
    const nextUrl = buildUrl(window.location.pathname, search, window.location.hash);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      history.replaceState(null, "", nextUrl);
    }
  }, [activeView, calculatorState, plannerState]);
}
