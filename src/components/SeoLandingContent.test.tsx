import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nContext } from "@/i18n/context";
import { SeoLandingContent } from "@/features/metallurgy/components/SeoLandingContent";

describe("SeoLandingContent", () => {
  it("renders a single primary heading and visible FAQ content", () => {
    render(
      <I18nContext.Provider
        value={{
          locale: "en",
          setLocale: vi.fn(),
          t: (key) =>
            ({
              "header.nav.wiki": "Vintage Story Wiki",
              "header.nav.vs_website": "Vintage Story Website",
              "header.nav.github": "View on GitHub",
            })[key] ?? key,
          getMetalLabel: () => "",
          getMetalShortLabel: () => "",
          getRecipeName: (recipeId: string) => recipeId,
          getRecipeNotes: () => "",
        }}
      >
        <SeoLandingContent />
      </I18nContext.Provider>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Vintage Story Alloy Calculator/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /FAQ/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What can this Vintage Story toolset help me plan/i),
    ).toBeInTheDocument();
  });
});
