import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";
import { buildLeatherSearch } from "@/features/leatherwork/routing/appStateRouting";

function buildUrl(pathname: string, search: string, hash: string) {
  return search ? `${pathname}?${search}${hash}` : `${pathname}${hash}`;
}

export function useLeatherUrlSync() {
  const {
    workflow,
    mode,
    size,
    animalVariant,
    bearVariant,
    hideCount,
    targetLeather,
    solvent,
    hydrateFromLocation,
  } = useLeatherStore(
    useShallow((state) => ({
      workflow: state.workflow,
      mode: state.mode,
      size: state.size,
      animalVariant: state.animalVariant,
      bearVariant: state.bearVariant,
      hideCount: state.hideCount,
      targetLeather: state.targetLeather,
      solvent: state.solvent,
      hydrateFromLocation: state.hydrateFromLocation,
    })),
  );
  const skipNextReplaceRef = useRef(false);

  useEffect(() => {
    hydrateFromLocation(window.location.pathname, window.location.search);
  }, [hydrateFromLocation]);

  useEffect(() => {
    const handlePopState = () => {
      skipNextReplaceRef.current = true;
      hydrateFromLocation(window.location.pathname, window.location.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrateFromLocation]);

  useEffect(() => {
    if (skipNextReplaceRef.current) {
      skipNextReplaceRef.current = false;
      return;
    }

    const search = buildLeatherSearch({
      workflow,
      mode,
      size,
      animalVariant,
      bearVariant,
      hideCount,
      targetLeather,
      solvent,
    });
    const nextUrl = buildUrl(window.location.pathname, search, window.location.hash);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      history.replaceState(null, "", nextUrl);
    }
  }, [animalVariant, bearVariant, hideCount, mode, size, solvent, targetLeather, workflow]);
}
