import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyCrucible } from "@/features/metallurgy/lib/alloyLogic";
import { createDefaultPlannerState } from "@/features/metallurgy/routing/appStateRouting";
import { useMetallurgyStore } from "./useMetallurgyStore";

describe("useMetallurgyStore", () => {
  beforeEach(() => {
    useMetallurgyStore.setState({
      activeView: "calculator",
      calculatorCrucible: createEmptyCrucible(),
      selectedRecipeId: null,
      plannerState: createDefaultPlannerState(),
    });
  });

  it("hydrates calculator state from localized URLs", () => {
    useMetallurgyStore.getState().hydrateFromLocation(
      "/fr/metallurgy/",
      "?s0=copper:90&s1=tin:10&r=tin-bronze",
    );

    const state = useMetallurgyStore.getState();
    expect(state.activeView).toBe("calculator");
    expect(state.selectedRecipeId).toBe("tin-bronze");
    expect(state.calculatorCrucible.slots[0].metalId).toBe("copper");
    expect(state.calculatorCrucible.slots[1].nuggets).toBe(10);
  });

  it("hydrates planner state without clearing calculator state", () => {
    useMetallurgyStore.setState({
      calculatorCrucible: {
        slots: [
          { id: 0, metalId: "copper", nuggets: 64 },
          { id: 1, metalId: "tin", nuggets: 8 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      },
      selectedRecipeId: "tin-bronze",
    });

    useMetallurgyStore.getState().hydrateFromLocation(
      "/metallurgy/planner/",
      "?mode=preserve-copper&recipe=bismuth-bronze&target=12&inv_copper=400&inv_zinc=140&inv_bismuth=90",
    );

    const state = useMetallurgyStore.getState();
    expect(state.activeView).toBe("planner");
    expect(state.plannerState.recipeId).toBe("bismuth-bronze");
    expect(state.plannerState.targetIngots).toBe(12);
    expect(state.plannerState.inventory.copper).toBe(400);
    expect(state.calculatorCrucible.slots[0].metalId).toBe("copper");
    expect(state.selectedRecipeId).toBe("tin-bronze");
  });

  it("preserves planner state when hydrating calculator URLs", () => {
    const plannerState = {
      ...createDefaultPlannerState(),
      recipeId: "tin-bronze",
      targetIngots: 5,
      inventory: {
        copper: 120,
        tin: 24,
        zinc: 0,
        bismuth: 0,
        gold: 0,
        silver: 0,
        lead: 0,
        nickel: 0,
      },
    };

    useMetallurgyStore.setState({
      calculatorCrucible: {
        slots: [
          { id: 0, metalId: "copper", nuggets: 32 },
          { id: 1, metalId: "tin", nuggets: 8 },
          { id: 2, metalId: null, nuggets: 0 },
          { id: 3, metalId: null, nuggets: 0 },
        ],
      },
      selectedRecipeId: "tin-bronze",
      plannerState,
    });

    useMetallurgyStore.getState().hydrateFromLocation(
      "/de/metallurgy/",
      "?s0=copper:90&s1=tin:10&r=tin-bronze",
    );

    const state = useMetallurgyStore.getState();
    expect(state.activeView).toBe("calculator");
    expect(state.selectedRecipeId).toBe("tin-bronze");
    expect(state.calculatorCrucible.slots[1].nuggets).toBe(10);
    expect(state.plannerState).toEqual(plannerState);
  });
});
