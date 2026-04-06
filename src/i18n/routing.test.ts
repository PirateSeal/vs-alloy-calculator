import { describe, expect, it } from "vitest";
import {
  buildLocalizedUrl,
  getLocaleFromPath,
  getLocalePath,
  resolveLocale,
  stripLocalePrefix,
} from "./routing";

describe("i18n routing", () => {
  it("detects locale prefixes from the pathname", () => {
    expect(getLocaleFromPath("/fr/")).toBe("fr");
    expect(getLocaleFromPath("/de/reference/")).toBe("de");
    expect(getLocaleFromPath("/")).toBeNull();
  });

  it("builds locale-specific paths with English at the root", () => {
    expect(getLocalePath("en", "/fr/")).toBe("/");
    expect(getLocalePath("fr", "/")).toBe("/fr/");
    expect(getLocalePath("es", "/de/tools/")).toBe("/es/tools/");
  });

  it("strips locale prefixes while preserving the remaining app path", () => {
    expect(stripLocalePrefix("/fr/")).toBe("/");
    expect(stripLocalePrefix("/de/reference/")).toBe("/reference/");
    expect(stripLocalePrefix("/reference/")).toBe("/reference/");
  });

  it("preserves query and hash when building localized URLs", () => {
    expect(
      buildLocalizedUrl("fr", {
        pathname: "/",
        search: "?s0=copper:64&r=tin-bronze",
        hash: "#share",
      }),
    ).toBe("/fr/?s0=copper:64&r=tin-bronze#share");
  });

  it("resolves locale with route, then saved choice, then browser language", () => {
    expect(resolveLocale("/es/", "fr", "de-DE")).toBe("es");
    expect(resolveLocale("/", "fr", "de-DE")).toBe("fr");
    expect(resolveLocale("/", null, "de-DE")).toBe("de");
    expect(resolveLocale("/", null, "it-IT")).toBe("en");
  });
});
