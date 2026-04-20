import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ALLOY_RECIPES } from "@/features/metallurgy/data/alloys";
import { I18nProvider } from "@/i18n/provider";
import { AlloyReferenceTable } from "./AlloyReferenceTable";

describe("AlloyReferenceTable", () => {
  beforeEach(() => {
    history.replaceState(null, "", "/reference/#metallurgy");
    localStorage.clear();
  });

  it("filters recipes from the reference search input", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <AlloyReferenceTable recipes={ALLOY_RECIPES.slice(0, 3)} />
      </I18nProvider>,
    );

    expect(screen.getByText("Tin Bronze")).toBeInTheDocument();
    expect(screen.getByText("Bismuth Bronze")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "black");

    expect(screen.getByText("Black Bronze")).toBeInTheDocument();
    expect(screen.queryByText("Tin Bronze")).not.toBeInTheDocument();
  });
});
