import { describe, expect, it } from "vitest";
import {
  calculateLeatherPlan,
  calculatePeltPlan,
  getPowderedBoraxRequired,
  hidesForLeather,
  hidesForLeatherTarget,
} from "./leather";

const t = (key: string, vars?: Record<string, string | number>) => {
  let value = key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
};

describe("leather calculations", () => {
  it("calculates forward values for small hides", () => {
    const plan = calculateLeatherPlan({
      t,
      hideCount: 8,
      mode: "hides",
      size: "small",
      solvent: "lime",
    });

    expect(plan.actualLeather).toBe(8);
    expect(plan.soakingLiters).toBe(16);
    expect(plan.totalLogs).toBe(6);
    expect(plan.weakTanninWater).toBe(40);
    expect(plan.totalWater).toBe(56);
  });

  it("ceilings hides when targeting leather output", () => {
    expect(hidesForLeather(5, "medium")).toBe(3);

    const plan = calculateLeatherPlan({
      t,
      hideCount: hidesForLeather(5, "medium"),
      mode: "leather",
      size: "medium",
      solvent: "lime",
      targetLeather: 5,
    });

    expect(plan.actualLeather).toBe(6);
    expect(plan.targetLeather).toBe(5);
  });

  it("uses per-step tannin log ceiling rather than a single aggregated ceiling", () => {
    const plan = calculateLeatherPlan({
      t,
      hideCount: 8,
      mode: "hides",
      size: "small",
      solvent: "lime",
    });

    expect(plan.tanninLogsForWeak).toBe(4);
    expect(plan.tanninLogsForStrong).toBe(2);
    expect(plan.totalLogs).toBe(6);
  });

  it("rounds powdered borax to game-sized diluted borax batches", () => {
    expect(getPowderedBoraxRequired(16)).toBe(8);
    expect(getPowderedBoraxRequired(18)).toBe(8);
    expect(getPowderedBoraxRequired(48)).toBe(20);
  });

  it("keeps barrel counts aligned to hide capacity", () => {
    const plan = calculateLeatherPlan({
      t,
      hideCount: 13,
      mode: "hides",
      size: "medium",
      solvent: "lime",
    });

    expect(plan.soakingBarrels).toBe(2);
    expect(plan.preparingBarrels).toBe(2);
    expect(plan.completingBarrels).toBe(2);
  });

  it("supports bear hides that expand into huge leather workflow", () => {
    const plan = calculateLeatherPlan({
      t,
      hideCount: 2,
      mode: "hides",
      size: "large",
      solvent: "lime",
      bearVariant: "sun",
    });

    expect(plan.soakingLiters).toBe(12);
    expect(plan.scrapedHideCount).toBe(4);
    expect(plan.tanningLitersPerStage).toBe(40);
    expect(plan.actualLeather).toBe(20);
    expect(plan.preparingBarrels).toBe(1);
    expect(plan.totalLogs).toBe(12);
  });

  it("ceilings target leather against bear raw-hide yield", () => {
    expect(hidesForLeatherTarget(21, "large", "sun")).toBe(3);
  });

  it("builds a bear pelt plan with split results", () => {
    const plan = calculatePeltPlan({
      t,
      hideCount: 2,
      size: "huge",
      bearVariant: "brown",
    });

    expect(plan.fatRequired).toBe(4);
    expect(plan.curedPeltCount).toBe(2);
    expect(plan.splitGenericPeltCount).toBe(4);
    expect(plan.splitGenericPeltSize).toBe("huge");
    expect(plan.splitHeadCount).toBe(2);
  });
});
