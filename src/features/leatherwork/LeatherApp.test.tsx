import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultLeatherState } from "@/features/leatherwork/routing/appStateRouting";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";
import { I18nProvider } from "@/i18n/provider";
import { LeatherApp } from "./LeatherApp";

describe("LeatherApp", () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, "", "/leather/");
    useLeatherStore.setState(createDefaultLeatherState());
    useLeatherStore.getState().updateInputs({
      mode: "leather",
      size: "large",
      targetLeather: 8,
      solvent: "borax",
    });
  });

  it("renders the leather summary, shopping list, and pipeline surfaces", async () => {
    render(
      <I18nProvider>
        <LeatherApp />
      </I18nProvider>,
    );

    expect(screen.getByText(/Leatherworking Planner/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Shopping List/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/^Workflow$/)[0]).toBeInTheDocument();
  });
});
