import type { AlloyRecipe, MetalNuggetAmount } from "@/features/metallurgy/types/alloys";
import {
  MAX_CRUCIBLE_SLOTS,
  PERCENTAGE_TOLERANCE,
  NUGGETS_PER_INGOT,
  UNITS_PER_INGOT,
  UNITS_PER_NUGGET,
} from "../constants";
import { countSlotsUsed } from "./crucibleAllocation";

interface VisitValidConfigurationsOptions {
  recipe: AlloyRecipe;
  targetIngots: number;
  visit: (amounts: MetalNuggetAmount[]) => boolean | void;
}

function getNuggetRange(
  minPercent: number,
  maxPercent: number,
  targetUnits: number,
) {
  return {
    minNuggets: Math.ceil(
      (((minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits - 0.000001) /
        UNITS_PER_NUGGET,
    ),
    maxNuggets: Math.floor(
      (((maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits + 0.000001) /
        UNITS_PER_NUGGET,
    ),
  };
}

export function visitValidConfigurations({
  recipe,
  targetIngots,
  visit,
}: VisitValidConfigurationsOptions): boolean {
  const targetUnits = targetIngots * UNITS_PER_INGOT;
  const targetNuggets = targetIngots * NUGGETS_PER_INGOT;
  const components = recipe.components;

  function solve(
    index: number,
    currentNuggets: number,
    currentAmounts: MetalNuggetAmount[],
  ): boolean {
    if (index === components.length) {
      if (
        currentNuggets === targetNuggets &&
        countSlotsUsed(currentAmounts) <= MAX_CRUCIBLE_SLOTS
      ) {
        return visit(currentAmounts) === true;
      }

      return false;
    }

    const component = components[index];
    const { minNuggets, maxNuggets } = getNuggetRange(
      component.minPercent,
      component.maxPercent,
      targetUnits,
    );

    let minRemaining = 0;
    let maxRemaining = 0;
    for (let nextIndex = index + 1; nextIndex < components.length; nextIndex++) {
      const nextComponent = components[nextIndex];
      const nextRange = getNuggetRange(
        nextComponent.minPercent,
        nextComponent.maxPercent,
        targetUnits,
      );
      minRemaining += nextRange.minNuggets;
      maxRemaining += nextRange.maxNuggets;
    }

    const lowerBound = Math.max(
      minNuggets,
      targetNuggets - currentNuggets - maxRemaining,
    );
    const upperBound = Math.min(
      maxNuggets,
      targetNuggets - currentNuggets - minRemaining,
    );

    for (let nuggets = lowerBound; nuggets <= upperBound; nuggets++) {
      const nextAmounts = [
        ...currentAmounts,
        { metalId: component.metalId, nuggets },
      ];

      if (countSlotsUsed(nextAmounts) > MAX_CRUCIBLE_SLOTS) {
        continue;
      }

      if (solve(index + 1, currentNuggets + nuggets, nextAmounts)) {
        return true;
      }
    }

    return false;
  }

  return solve(0, 0, []);
}
