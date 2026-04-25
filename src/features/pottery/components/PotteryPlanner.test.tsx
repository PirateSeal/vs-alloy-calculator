import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/provider";
import type { PotteryPlannerState } from "@/features/pottery/types/pottery";
import { PotteryPlanner } from "./PotteryPlanner";

function PlannerHarness() {
  const [state, setState] = useState<PotteryPlannerState>({
    plan: [{ recipeId: "bowl", quantity: 80 }],
    invAny: 120,
    invFire: 0,
    kilnMode: "pit",
    fuelType: "firewood",
  });

  return <PotteryPlanner state={state} onStateChange={setState} />;
}

describe("PotteryPlanner", () => {
  it("switches kiln mode and fuel summaries", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <PlannerHarness />
      </I18nProvider>,
    );

    expect(screen.getByText("Pit kiln cycles")).toBeInTheDocument();
    expect(screen.getByText("400 in-game hours")).toBeInTheDocument();

    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(await screen.findByRole("option", { name: "Charcoal" }));

    expect(screen.getByText("200 in-game hours")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Advanced: Beehive" }));

    expect(screen.getByText("Beehive firings")).toBeInTheDocument();
    expect(screen.getByText("21.8 in-game hours")).toBeInTheDocument();
    expect(screen.getByText("80 / 72, 2 firings")).toBeInTheDocument();
  });
});
