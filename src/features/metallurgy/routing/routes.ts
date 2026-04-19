import type { MetallurgyView } from "../types/planner";

export const METALLURGY_VIEW_PATHS: Record<MetallurgyView, string> = {
  calculator: "/",
  planner: "/planner/",
  reference: "/reference/",
  about: "/about/",
};

export const METALLURGY_APP_ROUTES = [
  METALLURGY_VIEW_PATHS.calculator,
  METALLURGY_VIEW_PATHS.planner,
  METALLURGY_VIEW_PATHS.reference,
  METALLURGY_VIEW_PATHS.about,
] as const;
