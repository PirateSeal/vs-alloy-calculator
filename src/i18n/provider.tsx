import { useEffect, useState, type ReactNode } from "react";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";
import es from "./es.json";
import ru from "./ru.json";
import zh from "./zh.json";
import ja from "./ja.json";
import ko from "./ko.json";
import pl from "./pl.json";
import pt from "./pt.json";
import { I18nContext } from "./context";
import type { Locale } from "./types";
import type { MetalId } from "@/types/alloys";
import { applySeoToDocument } from "./head";
import { buildLocalizedUrl, isLocale, resolveLocale } from "./routing";
import { setAnalyticsLocale } from "@/lib/analytics";

type Translations = Record<string, string>;
const LOCALES: Record<Locale, Translations> = { en, fr, de, es, ru, zh, ja, ko, pl, pt };

function getSavedLocale(): Locale | null {
  const saved = localStorage.getItem("locale");
  return saved && isLocale(saved) ? saved : null;
}

function detectLocale(): Locale {
  return resolveLocale(
    window.location.pathname,
    getSavedLocale(),
    navigator.language,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let str = LOCALES[locale][key] ?? LOCALES.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  };

  const getMetalLabel = (metalId: MetalId) => t(`metal.${metalId}.label`);
  const getMetalShortLabel = (metalId: MetalId) => t(`metal.${metalId}.short`);
  const getRecipeName = (recipeId: string) => t(`alloy.${recipeId}.name`);
  const getRecipeNotes = (recipeId: string) => t(`alloy.${recipeId}.notes`);

  useEffect(() => {
    localStorage.setItem("locale", locale);
    setAnalyticsLocale(locale);
    const nextUrl = buildLocalizedUrl(locale, window.location);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      history.replaceState(null, "", nextUrl);
    }
    applySeoToDocument(locale);
  }, [locale]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        getMetalLabel,
        getMetalShortLabel,
        getRecipeName,
        getRecipeNotes,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
