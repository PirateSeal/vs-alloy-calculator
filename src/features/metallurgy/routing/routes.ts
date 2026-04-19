import type { MetallurgyView } from "../types/planner";

export const METALLURGY_VIEW_PATHS: Record<MetallurgyView, string> = {
  calculator: "/metallurgy/",
  planner: "/metallurgy/planner/",
};

export const METALLURGY_APP_ROUTES = [
  METALLURGY_VIEW_PATHS.calculator,
  METALLURGY_VIEW_PATHS.planner,
] as const;
