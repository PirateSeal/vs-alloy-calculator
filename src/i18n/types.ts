export type Locale = "en" | "fr" | "de" | "es" | "ru" | "zh" | "ja" | "ko" | "pl" | "pt";

export interface LocaleOption {
  id: Locale;
  label: string;
  flagSrc: string;
}
