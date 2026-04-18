import { describe, expect, it } from "vitest";
import { createEmptyCrucible } from "@/lib/alloyLogic";
import {
  buildCalculatorSearch,
  buildPlannerSearch,
  createDefaultPlannerState,
  getMetallurgyViewFromPath,
  getPathnameForMetallurgyView,
  parseCalculatorStateFromSearch,
  parsePlannerStateFromSearch,
} from "./appStateRouting";

describe("appStateRouting", () => {
  it("parses the planner route from localized and root paths", () => {
    expect(getMetallurgyViewFromPath("/planner/")).toBe("planner");
    expect(getMetallurgyViewFromPath("/fr/planner/")).toBe("planner");
    expect(getMetallurgyViewFromPath("/de/reference/")).toBe("reference");
    expect(getMetallurgyViewFromPath("/")).toBe("calculator");
  });

  it("builds localized planner paths without losing the active locale", () => {
    expect(getPathnameForMetallurgyView("/fr/", "planner")).toBe("/fr/planner/");
    expect(getPathnameForMetallurgyView("/de/planner/", "calculator")).toBe("/de/");
  });

  it("round-trips calculator search state", () => {
    const crucible = createEmptyCrucible();
    crucible.slots[0] = { id: 0, metalId: "copper", nuggets: 90 };
    crucible.slots[1] = { id: 1, metalId: "tin", nuggets: 10 };

    const search = buildCalculatorSearch(crucible, { id: "tin-bronze", components: [] });
    const parsed = parseCalculatorStateFromSearch(`?${search}`);

    expect(parsed.recipe?.id).toBe("tin-bronze");
    expect(parsed.crucible.slots[0].metalId).toBe("copper");
    expect(parsed.crucible.slots[1].nuggets).toBe(10);
  });

  it("round-trips planner search state independently from calculator state", () => {
    const plannerState = {
      ...createDefaultPlannerState(),
      scarcityMode: "preserve-copper" as const,
      recipeId: "bismuth-bronze",
      targetIngots: 12,
      inventory: {
        copper: 400,
        tin: 0,
        zinc: 140,
        bismuth: 90,
        gold: 0,
        silver: 0,
        lead: 0,
        nickel: 0,
      },
    };

    const search = buildPlannerSearch(plannerState);
    const parsed = parsePlannerStateFromSearch(`?${search}`);

    expect(parsed.scarcityMode).toBe("preserve-copper");
    expect(parsed.recipeId).toBe("bismuth-bronze");
    expect(parsed.targetIngots).toBe(12);
    expect(parsed.inventory.zinc).toBe(140);
    expect(parsed.inventory.copper).toBe(400);
  });
});
