import type { PotteryView } from "@/features/pottery/types/pottery";

export const POTTERY_VIEW_PATHS: Record<PotteryView, string> = {
  "pottery-calculator": "/pottery/",
  "pottery-planner": "/pottery/planner/",
};

export const POTTERY_APP_ROUTES = [
  POTTERY_VIEW_PATHS["pottery-calculator"],
  POTTERY_VIEW_PATHS["pottery-planner"],
] as const;
