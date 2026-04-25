import { describe, expect, it } from "vitest";
import {
  buildPotteryCalculatorSearch,
  buildPotteryPlannerSearch,
  getPathnameForPotteryView,
  getPotteryViewFromPath,
  parsePotteryCalculatorStateFromSearch,
  parsePotteryPlannerStateFromSearch,
} from "@/features/pottery/routing/appStateRouting";

describe("pottery app state routing", () => {
  it("resolves pottery views from localized paths", () => {
    expect(getPotteryViewFromPath("/pottery/")).toBe("pottery-calculator");
    expect(getPotteryViewFromPath("/fr/pottery/planner/")).toBe("pottery-planner");
    expect(getPathnameForPotteryView("/fr/pottery/", "pottery-planner")).toBe("/fr/pottery/planner/");
  });

  it("parses and builds calculator state", () => {
    expect(parsePotteryCalculatorStateFromSearch("?item=bowl&qty=4")).toEqual({
      recipeId: "bowl",
      quantity: 4,
    });
    expect(buildPotteryCalculatorSearch({ recipeId: "bowl", quantity: 4 })).toBe("item=bowl&qty=4");
  });

  it("parses and builds planner state with duplicate entries merged", () => {
    expect(parsePotteryPlannerStateFromSearch("?plan=crock:2,crock:3,clay-oven:1&inv-any=20&inv-fire=69")).toEqual({
      plan: [
        { recipeId: "crock", quantity: 5 },
        { recipeId: "clay-oven", quantity: 1 },
      ],
      invAny: 20,
      invFire: 69,
      kilnMode: "pit",
      fuelType: "firewood",
    });

    expect(buildPotteryPlannerSearch({
      plan: [
        { recipeId: "crock", quantity: 5 },
        { recipeId: "clay-oven", quantity: 1 },
      ],
      invAny: 20,
      invFire: 69,
      kilnMode: "pit",
      fuelType: "firewood",
    })).toBe("plan=crock%3A5%2Cclay-oven%3A1&inv-any=20&inv-fire=69");
  });

  it("parses and builds kiln planner mode and fuel state", () => {
    expect(parsePotteryPlannerStateFromSearch("?kiln=beehive&fuel=charcoal")).toMatchObject({
      kilnMode: "beehive",
      fuelType: "charcoal",
    });

    expect(parsePotteryPlannerStateFromSearch("?kiln=bad&fuel=bad")).toMatchObject({
      kilnMode: "pit",
      fuelType: "firewood",
    });

    expect(buildPotteryPlannerSearch({
      plan: [],
      invAny: 0,
      invFire: 0,
      kilnMode: "beehive",
      fuelType: "black-coal",
    })).toBe("kiln=beehive&fuel=black-coal");
  });
});
