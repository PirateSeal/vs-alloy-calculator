import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultLeatherState } from "@/features/leatherwork/routing/appStateRouting";
import { useLeatherStore } from "./useLeatherStore";

describe("useLeatherStore", () => {
  beforeEach(() => {
    useLeatherStore.setState(createDefaultLeatherState());
  });

  it("hydrates leather state from localized URLs", () => {
    useLeatherStore.getState().hydrateFromLocation(
      "/fr/leather/",
      "?mode=leather&size=large&target=8&solvent=borax",
    );

    const state = useLeatherStore.getState();
    expect(state.mode).toBe("leather");
    expect(state.size).toBe("large");
    expect(state.targetLeather).toBe(8);
    expect(state.solvent).toBe("borax");
    expect(state.animalVariant).toBe("generic");
  });

  it("normalizes non-small animal variants away", () => {
    useLeatherStore.getState().hydrateFromLocation(
      "/leather/",
      "?size=huge&animal=fox&count=4",
    );

    const state = useLeatherStore.getState();
    expect(state.size).toBe("huge");
    expect(state.animalVariant).toBe("generic");
  });

  it("hydrates pelt bear routes and locks mode back to hides", () => {
    useLeatherStore.getState().hydrateFromLocation(
      "/leather/",
      "?workflow=pelt&mode=leather&bear=polar&count=2",
    );

    const state = useLeatherStore.getState();
    expect(state.workflow).toBe("pelt");
    expect(state.mode).toBe("hides");
    expect(state.bearVariant).toBe("polar");
    expect(state.size).toBe("huge");
  });
});
