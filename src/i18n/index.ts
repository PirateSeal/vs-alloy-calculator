import { useContext } from "react";
import { I18nContext } from "./context";
import type { Locale, LocaleOption } from "./types";

export { I18nProvider } from "./provider";
export type { Locale, LocaleOption };
export {
  DEFAULT_LOCALE,
  NON_DEFAULT_LOCALES,
  SUPPORTED_LOCALES,
  buildLocalizedUrl,
  getLocaleFromPath,
  getLocalePath,
  normalizeAppPath,
  resolveLocale,
  stripLocalePrefix,
} from "./routing";
export {
  SITE_URL,
  getAlternateLinks,
  getCanonicalUrl,
  getSeoContent,
  localizeHtmlDocument,
} from "./seo";
export { applySeoToDocument } from "./head";

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { id: "en", label: "English",            flagSrc: "/flags/flag-united-states.png" },
  { id: "fr", label: "Français",           flagSrc: "/flags/flag-france.png" },
  { id: "de", label: "Deutsch",            flagSrc: "/flags/flag-germany.png" },
  { id: "es", label: "Español",            flagSrc: "/flags/flag-spain.png" },
  { id: "ru", label: "Русский",            flagSrc: "/flags/flag-russia.png" },
  { id: "zh", label: "中文",               flagSrc: "/flags/flag-china.png" },
  { id: "ja", label: "日本語",             flagSrc: "/flags/flag-japan.png" },
  { id: "ko", label: "한국어",             flagSrc: "/flags/flag-south-korea.png" },
  { id: "pl", label: "Polski",             flagSrc: "/flags/flag-poland.png" },
  { id: "pt", label: "Português (Brasil)", flagSrc: "/flags/flag-brazil.png" },
];
