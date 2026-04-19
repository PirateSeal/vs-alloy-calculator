import type { MetallurgyView } from "@/features/metallurgy/types/planner";

export type AppDomain = "metallurgy" | "leather";
export type ReferenceTab = AppDomain;
export type SharedAppTarget = "overview" | "reference";
export type AppNavTarget = SharedAppTarget | MetallurgyView | "leather";
