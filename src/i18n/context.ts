import { createContext } from "react";
import type { MetalId } from "@/features/metallurgy/types/alloys";
import type { Locale } from "./types";

export interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  getMetalLabel: (metalId: MetalId) => string;
  getMetalShortLabel: (metalId: MetalId) => string;
  getRecipeName: (recipeId: string) => string;
  getRecipeNotes: (recipeId: string) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
