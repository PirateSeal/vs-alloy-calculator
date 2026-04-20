import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ALLOY_RECIPES } from "@/features/metallurgy/data/alloys";
import { createDefaultPlannerState } from "@/features/metallurgy/routing/appStateRouting";
import { I18nProvider } from "@/i18n/provider";
import { PlannerView } from "./PlannerView";

describe("PlannerView", () => {
  it("renders craftable recipes and expands a recipe plan", async () => {
    const user = userEvent.setup();
    const initialState = {
      ...createDefaultPlannerState(),
      inventory: {
        copper: 180,
        tin: 20,
        zinc: 0,
        bismuth: 0,
        gold: 0,
        silver: 0,
        lead: 0,
        nickel: 0,
      },
    };

    function PlannerHarness() {
      const [state, setState] = useState(initialState);
      return (
        <PlannerView
          recipes={ALLOY_RECIPES}
          state={state}
          onStateChange={setState}
        />
      );
    }

    render(
      <I18nProvider>
        <PlannerHarness />
      </I18nProvider>,
    );

    expect(screen.getByText("Tin Bronze")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /open recipe plan/i })[0]);

    expect(screen.getByRole("spinbutton", { name: /requested ingot count/i })).toBeInTheDocument();
    expect(screen.getByText(/Open in calculator/i)).toBeInTheDocument();
  });
});
