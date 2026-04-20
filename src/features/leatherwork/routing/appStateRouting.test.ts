import { describe, expect, it } from "vitest";
import {
  buildLeatherSearch,
  getLeatherPathname,
  isLeatherPath,
  parseLeatherStateFromSearch,
} from "./appStateRouting";

describe("leather routing state", () => {
  it("parses localized query state", () => {
    const state = parseLeatherStateFromSearch("?mode=leather&size=large&target=8&solvent=borax");

    expect(state.mode).toBe("leather");
    expect(state.size).toBe("large");
    expect(state.targetLeather).toBe(8);
    expect(state.solvent).toBe("borax");
  });

  it("serializes non-default values without dropping the active mode", () => {
    const search = buildLeatherSearch({
      workflow: "leather",
      mode: "leather",
      size: "small",
      animalVariant: "generic",
      bearVariant: null,
      hideCount: 1,
      targetLeather: 8,
      solvent: "borax",
    });

    expect(search).toContain("mode=leather");
    expect(search).toContain("target=8");
    expect(search).toContain("solvent=borax");
  });

  it("clamps invalid values back to defaults", () => {
    const state = parseLeatherStateFromSearch("?mode=oops&size=giant&animal=fox&count=0&target=-5&solvent=sap");

    expect(state.mode).toBe("hides");
    expect(state.size).toBe("small");
    expect(state.animalVariant).toBe("fox");
    expect(state.hideCount).toBe(1);
    expect(state.targetLeather).toBe(1);
    expect(state.solvent).toBe("lime");
  });

  it("parses pelt and bear query state", () => {
    const state = parseLeatherStateFromSearch("?workflow=pelt&bear=brown&count=2");

    expect(state.workflow).toBe("pelt");
    expect(state.mode).toBe("hides");
    expect(state.bearVariant).toBe("brown");
    expect(state.size).toBe("huge");
    expect(state.hideCount).toBe(2);
  });

  it("matches locale-aware leather paths", () => {
    expect(isLeatherPath("/leather/")).toBe(true);
    expect(isLeatherPath("/fr/leather")).toBe(true);
    expect(isLeatherPath("/fr/metallurgy/")).toBe(false);
  });

  it("builds locale-aware leather pathnames", () => {
    expect(getLeatherPathname("/leather/")).toBe("/leather/");
    expect(getLeatherPathname("/fr/reference/")).toBe("/fr/leather/");
  });
});
