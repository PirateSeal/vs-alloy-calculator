import { useMemo } from "react";
import {
  calculateLeatherPlan,
  calculatePeltPlan,
} from "@/features/leatherwork/lib/leather";
import type {
  LeatherState,
  LeatherworkCalculation,
} from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";

export function useLeatherCalculation(state: LeatherState): LeatherworkCalculation {
  const { t } = useTranslation();
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
        t,
        hideCount,
        size,
        animalVariant,
        bearVariant,
      });
    }

    return calculateLeatherPlan({
      t,
      hideCount,
      mode,
      size,
      solvent,
      targetLeather: mode === "leather" ? targetLeather : null,
      animalVariant,
      bearVariant,
    });
  }, [animalVariant, bearVariant, hideCount, mode, size, solvent, t, targetLeather, workflow]);
}
