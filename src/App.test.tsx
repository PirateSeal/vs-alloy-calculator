import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { createEmptyCrucible } from "./features/metallurgy/lib/alloyLogic";
import { createDefaultPlannerState } from "./features/metallurgy/routing/appStateRouting";
import { useMetallurgyStore } from "./features/metallurgy/store/useMetallurgyStore";
import { createDefaultLeatherState } from "./features/leatherwork/routing/appStateRouting";
import { useLeatherStore } from "./features/leatherwork/store/useLeatherStore";
import { createDefaultPotteryCalculatorState, createDefaultPotteryPlannerState } from "./features/pottery/routing/appStateRouting";
import { usePotteryStore } from "./features/pottery/store/usePotteryStore";

function resetMetallurgyStore() {
  useMetallurgyStore.setState({
    activeView: "calculator",
    calculatorCrucible: createEmptyCrucible(),
    selectedRecipeId: null,
    plannerState: createDefaultPlannerState(),
  });
}

function resetLeatherStore() {
  useLeatherStore.setState(createDefaultLeatherState());
}

function resetPotteryStore() {
  usePotteryStore.setState({
    activeView: "pottery-calculator",
    calculatorState: createDefaultPotteryCalculatorState(),
    plannerState: createDefaultPotteryPlannerState(),
  });
}

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, "", "/");
    resetMetallurgyStore();
    resetLeatherStore();
    resetPotteryStore();
  });

  it("loads planner deep links and preserves locale-prefixed navigation", async () => {
    history.replaceState(null, "", "/fr/metallurgy/planner/?recipe=tin-bronze&target=4&inv_copper=80&inv_tin=20");
    useMetallurgyStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Planificateur de métallurgie/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Référence/i })[0]);

    expect(window.location.pathname).toBe("/fr/reference/");
    expect(window.location.hash).toBe("#metallurgy");
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("restores calculator view and query-backed state on popstate", async () => {
    history.replaceState(null, "", "/metallurgy/?s0=copper:90&s1=tin:10&r=tin-bronze");
    useMetallurgyStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: /Tin Bronze/i })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Planner" })[0]);
    expect(window.location.pathname).toBe("/metallurgy/planner/");

    await act(async () => {
      history.pushState(null, "", "/metallurgy/?s0=copper:90&s1=tin:10&r=tin-bronze");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(window.location.pathname).toBe("/metallurgy/");
    expect(await screen.findByText(/Crucible Inputs/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Tin Bronze/i })).toBeInTheDocument();
  });

  it("loads leather deep links and can switch back to metallurgy on localized routes", async () => {
    history.replaceState(null, "", "/fr/leather/?mode=leather&size=large&target=8&solvent=borax");
    useLeatherStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/Planificateur de travail du cuir/i)).toBeInTheDocument();
    expect(screen.getByText(/3 peaux -> 9 cuir/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Calculateur/i })[0]);

    expect(window.location.pathname).toBe("/fr/metallurgy/");
    expect(screen.queryByText(/Planificateur de travail du cuir/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Calculateur/i })[0]).toHaveAttribute("aria-current", "page");
  });

  it("loads pottery deep links and opens the pottery reference tab", async () => {
    history.replaceState(null, "", "/pottery/?item=clay-oven&qty=2");
    usePotteryStore.getState().hydrateFromLocation(window.location.pathname, window.location.search);

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: /Clay Calculator/i })).toBeInTheDocument();
    expect(screen.getByText(/clay for 2 x Clay Oven/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Reference" })[0]);

    expect(window.location.pathname).toBe("/reference/");
    expect(window.location.hash).toBe("#pottery");
    expect(await screen.findByRole("heading", { name: /Pottery Reference/i })).toBeInTheDocument();
  });

  it("renders the about landing page at the root url", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Metallurgy, pottery, leatherwork, and reference in one place/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Crucible Inputs/i)).not.toBeInTheDocument();
  });
});
