import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { createEmptyCrucible } from "./features/metallurgy/lib/alloyLogic";
import { createDefaultPlannerState } from "./features/metallurgy/routing/appStateRouting";
import { useMetallurgyStore } from "./features/metallurgy/store/useMetallurgyStore";

function resetMetallurgyStore() {
  useMetallurgyStore.setState({
    activeView: "calculator",
    calculatorCrucible: createEmptyCrucible(),
    selectedRecipeId: null,
    plannerState: createDefaultPlannerState(),
  });
}

describe("App metallurgy integration", () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, "", "/");
    resetMetallurgyStore();
  });

  it("loads planner deep links and preserves locale-prefixed navigation", async () => {
    history.replaceState(null, "", "/fr/planner/?recipe=tin-bronze&target=4&inv_copper=80&inv_tin=20");
    useMetallurgyStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Planificateur de métallurgie/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Référence/i })[0]);

    expect(window.location.pathname).toBe("/fr/reference/");
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("restores calculator view and query-backed state on popstate", async () => {
    history.replaceState(null, "", "/?s0=copper:90&s1=tin:10&r=tin-bronze");
    useMetallurgyStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: /Tin Bronze/i })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Planner" })[0]);
    expect(window.location.pathname).toBe("/planner/");

    await act(async () => {
      history.pushState(null, "", "/?s0=copper:90&s1=tin:10&r=tin-bronze");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(window.location.pathname).toBe("/");
    expect(await screen.findByText(/Crucible Inputs/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Tin Bronze/i })).toBeInTheDocument();
  });
});
