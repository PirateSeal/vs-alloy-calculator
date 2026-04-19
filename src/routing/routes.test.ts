import { describe, expect, it } from "vitest";
import {
  getAppDomainFromPath,
  getAppNavTargetFromPath,
  getCanonicalAppPath,
  getLocalizedOverviewPath,
  getLocalizedReferencePath,
  getReferenceTabFromHash,
} from "./routes";

describe("shared app routes", () => {
  it("resolves shared pages, feature routes, and legacy aliases", () => {
    expect(getAppNavTargetFromPath("/")).toBe("overview");
    expect(getAppNavTargetFromPath("/fr/reference/")).toBe("reference");
    expect(getAppNavTargetFromPath("/metallurgy/")).toBe("calculator");
    expect(getAppNavTargetFromPath("/metallurgy/planner/")).toBe("planner");
    expect(getAppNavTargetFromPath("/leather/")).toBe("leather");
    expect(getAppNavTargetFromPath("/about/")).toBe("overview");
    expect(getAppNavTargetFromPath("/metallurgy/reference/")).toBe("reference");
  });

  it("canonicalizes legacy overview and reference routes", () => {
    expect(getCanonicalAppPath("/about/")).toBe("/");
    expect(getCanonicalAppPath("/metallurgy/about/")).toBe("/");
    expect(getCanonicalAppPath("/metallurgy/reference/")).toBe("/reference/");
  });

  it("keeps locale-prefixed shared navigation on the current locale", () => {
    expect(getLocalizedOverviewPath("/fr/metallurgy/planner/")).toBe("/fr/");
    expect(getLocalizedReferencePath("/fr/leather/")).toBe("/fr/reference/");
  });

  it("uses the shared reference hash to restore the active domain", () => {
    expect(getReferenceTabFromHash("#metallurgy")).toBe("metallurgy");
    expect(getReferenceTabFromHash("#leather")).toBe("leather");
    expect(getAppDomainFromPath("/reference/", "#leather")).toBe("leather");
    expect(getAppDomainFromPath("/reference/", "#metallurgy")).toBe("metallurgy");
  });
});
