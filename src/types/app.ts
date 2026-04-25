import type { MetallurgyView } from "@/features/metallurgy/types/planner";
import type { PotteryView } from "@/features/pottery/types/pottery";

export type AppDomain = "metallurgy" | "leather" | "pottery";
export type ReferenceTab = AppDomain;
export type SharedAppTarget = "overview" | "reference";
export type AppNavTarget = SharedAppTarget | MetallurgyView | "leather" | PotteryView;
