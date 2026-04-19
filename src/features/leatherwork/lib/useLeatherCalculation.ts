import { useMemo } from "react";
import {
  calculateLeatherPlan,
  calculatePeltPlan,
} from "@/features/leatherwork/lib/leather";
import type {
  LeatherState,
  LeatherworkCalculation,
} from "@/features/leatherwork/types/leather";

export function useLeatherCalculation(state: LeatherState): LeatherworkCalculation {
  const {
    workflow,
    mode,
    size,
    animalVariant,
    bearVariant,
    hideCount,
    targetLeather,
    solvent,
  } = state;

  return useMemo(() => {
    if (workflow === "pelt") {
      return calculatePeltPlan({
        hideCount,
        size,
        animalVariant,
        bearVariant,
      });
    }

    return calculateLeatherPlan({
      hideCount,
      mode,
      size,
      solvent,
      targetLeather: mode === "leather" ? targetLeather : null,
      animalVariant,
      bearVariant,
    });
  }, [animalVariant, bearVariant, hideCount, mode, size, solvent, targetLeather, workflow]);
}
