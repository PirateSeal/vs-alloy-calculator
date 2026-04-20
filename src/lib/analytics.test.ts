import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  setAnalyticsLocale,
  track,
  trackAppNavigation,
  trackLeatherInputChange,
  trackPlannerInputChange,
  trackPlannerOpenInCalculator,
  trackPlannerPlanToggle,
  trackReferenceTabChange,
} from "./analytics";

describe("analytics", () => {
  beforeEach(() => {
    window.umami = { track: vi.fn() };
    history.replaceState(null, "", "/");
  });

  afterEach(() => {
    delete window.umami;
    setAnalyticsLocale("en");
    history.replaceState(null, "", "/");
  });

  it("does not throw when umami absent", () => {
    delete window.umami;
    expect(() => track("event")).not.toThrow();
  });

  it("forwards event with default locale and route context", () => {
    track("click", { id: "btn" });
    expect(window.umami!.track).toHaveBeenCalledWith("click", {
      locale: "en",
      route_target: "overview",
      route_domain: "metallurgy",
      route_path: "/",
      id: "btn",
    });
  });

  it("uses updated locale after setAnalyticsLocale", () => {
    setAnalyticsLocale("fr");
    track("view");
    expect(window.umami!.track).toHaveBeenCalledWith("view", {
      locale: "fr",
      route_target: "overview",
      route_domain: "metallurgy",
      route_path: "/",
    });
  });

  it("caller-provided locale overrides default", () => {
    track("view", { locale: "de" });
    expect(window.umami!.track).toHaveBeenCalledWith("view", {
      locale: "de",
      route_target: "overview",
      route_domain: "metallurgy",
      route_path: "/",
    });
  });

  it("adds reference tab context on shared reference routes", () => {
    setAnalyticsLocale("fr");
    history.replaceState(null, "", "/fr/reference/#leather");
    track("view");
    expect(window.umami!.track).toHaveBeenCalledWith("view", {
      locale: "fr",
      route_target: "reference",
      route_domain: "leather",
      route_path: "/reference/",
      reference_tab: "leather",
    });
  });

  it("tracks app navigation through the helper", () => {
    trackAppNavigation("leather", { previous_target: "overview" });
    expect(window.umami!.track).toHaveBeenCalledWith("app-navigation", {
      locale: "en",
      route_target: "overview",
      route_domain: "metallurgy",
      route_path: "/",
      target: "leather",
      previous_target: "overview",
    });
  });

  it("tracks reference tab changes through the helper", () => {
    history.replaceState(null, "", "/reference/#metallurgy");
    trackReferenceTabChange("leather", { source: "tabs" });
    expect(window.umami!.track).toHaveBeenCalledWith("reference-tab-changed", {
      locale: "en",
      route_target: "reference",
      route_domain: "metallurgy",
      route_path: "/reference/",
      reference_tab: "metallurgy",
      tab: "leather",
      source: "tabs",
    });
  });

  it("tracks planner events through the helpers", () => {
    history.replaceState(null, "", "/metallurgy/planner/");
    trackPlannerInputChange("scarcity_mode", { mode: "economical" });
    trackPlannerPlanToggle({ recipe: "bronze", action: "open" });
    trackPlannerOpenInCalculator({ recipe: "bronze", run: 2 });

    expect(window.umami!.track).toHaveBeenNthCalledWith(1, "planner-input-changed", {
      locale: "en",
      route_target: "planner",
      route_domain: "metallurgy",
      route_path: "/metallurgy/planner/",
      field: "scarcity_mode",
      mode: "economical",
    });
    expect(window.umami!.track).toHaveBeenNthCalledWith(2, "planner-plan-toggled", {
      locale: "en",
      route_target: "planner",
      route_domain: "metallurgy",
      route_path: "/metallurgy/planner/",
      recipe: "bronze",
      action: "open",
    });
    expect(window.umami!.track).toHaveBeenNthCalledWith(3, "planner-open-in-calculator", {
      locale: "en",
      route_target: "planner",
      route_domain: "metallurgy",
      route_path: "/metallurgy/planner/",
      recipe: "bronze",
      run: 2,
    });
  });

  it("tracks leather events through the helper", () => {
    history.replaceState(null, "", "/leather/");
    trackLeatherInputChange("workflow", { value: "pelt" });
    expect(window.umami!.track).toHaveBeenCalledWith("leather-input-changed", {
      locale: "en",
      route_target: "leather",
      route_domain: "leather",
      route_path: "/leather/",
      field: "workflow",
      value: "pelt",
    });
  });
});
