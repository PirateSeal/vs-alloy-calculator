import { useEffect, useRef } from "react";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";
import { buildLeatherSearch } from "@/features/leatherwork/routing/appStateRouting";

function buildUrl(pathname: string, search: string, hash: string) {
  return search ? `${pathname}?${search}${hash}` : `${pathname}${hash}`;
}

export function useLeatherUrlSync() {
  const workflow = useLeatherStore((state) => state.workflow);
  const mode = useLeatherStore((state) => state.mode);
  const size = useLeatherStore((state) => state.size);
  const animalVariant = useLeatherStore((state) => state.animalVariant);
  const bearVariant = useLeatherStore((state) => state.bearVariant);
  const hideCount = useLeatherStore((state) => state.hideCount);
  const targetLeather = useLeatherStore((state) => state.targetLeather);
  const solvent = useLeatherStore((state) => state.solvent);
  const hydrateFromLocation = useLeatherStore((state) => state.hydrateFromLocation);
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
