import { describe, expect, it } from "vitest";
import glossary from "./glossary.json";
import en from "./en.json";
import de from "./de.json";
import es from "./es.json";
import fr from "./fr.json";
import ja from "./ja.json";
import ko from "./ko.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ru from "./ru.json";
import zh from "./zh.json";

type MessageValue = string | Record<string, unknown>;
type LocaleMap = Record<string, MessageValue>;

const locales = {
  en: en as unknown as LocaleMap,
  de: de as unknown as LocaleMap,
  es: es as unknown as LocaleMap,
  fr: fr as unknown as LocaleMap,
  ja: ja as unknown as LocaleMap,
  ko: ko as unknown as LocaleMap,
  pl: pl as unknown as LocaleMap,
  pt: pt as unknown as LocaleMap,
  ru: ru as unknown as LocaleMap,
  zh: zh as unknown as LocaleMap,
} as const;

const nonEnglishLocales = Object.entries(locales).filter(([locale]) => locale !== "en");
const flatLocales = Object.fromEntries(
  Object.entries(locales).map(([locale, messages]) => [locale, expectFlatStringMap(locale, messages)]),
) as Record<keyof typeof locales, Record<string, string>>;

const glossaryBackedKeys = [
  ["leather.inputs.hide_family", "hide_family"],
  ["leather.inputs.hide_type", "hide_type"],
  ["leather.shopping.raw_hides", "raw_hides"],
  ["reference.leather.hide_profiles.title", "hide_sizes"],
  ["leather.solvent.lime", "lime"],
  ["leather.solvent.borax", "powdered_borax"],
] as const;

const disallowedHideTerms: Record<string, RegExp[]> = {
  de: [/\bversteck/i, /\bausblend/i],
  es: [/\bocultar\b/i, /\besconde/i],
  fr: [/\bmasquer\b/i, /\bcacher\b/i, /\bse cache\b/i],
  ja: [/\u975e\u8868\u793a/, /\u96a0\u308c\u308b/, /\u96a0\u3059/],
  ko: [/\uc228\uae30/, /\uc228\ub2e4/],
  pl: [/ukryj/i, /ukryć/i, /ukrywa/i],
  pt: [/\bocultar\b/i, /\besconder\b/i, /\besconde\b/i],
  ru: [/\u0441\u043a\u0440\u044b\u0442/i, /\u0441\u043f\u0440\u044f\u0442/i, /\u043f\u0440\u044f\u0447\u0435\u0442/i],
  zh: [/\u9690\u85cf/],
};

function extractPlaceholders(value: string): string[] {
  return [...value.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();
}

function expectFlatStringMap(locale: string, messages: LocaleMap): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(messages)) {
    expect(typeof value, `${locale}:${key}`).toBe("string");

    if (typeof value === "string") {
      flattened[key] = value;
    }
  }

  return flattened;
}

describe("locale files", () => {
  it("keeps every locale aligned with the English key set", () => {
    const englishMessages = flatLocales.en;
    const englishKeys = Object.keys(englishMessages).sort();

    for (const [locale] of nonEnglishLocales) {
      expect(Object.keys(flatLocales[locale as keyof typeof flatLocales]).sort(), locale).toEqual(englishKeys);
    }
  });

  it("keeps placeholder names aligned with English", () => {
    const englishMessages = flatLocales.en;

    for (const [key, englishValue] of Object.entries(englishMessages)) {
      const englishPlaceholders = extractPlaceholders(englishValue);

      for (const [locale] of nonEnglishLocales) {
        const localizedMessages = flatLocales[locale as keyof typeof flatLocales];
        expect(extractPlaceholders(localizedMessages[key]), `${locale}:${key}`).toEqual(englishPlaceholders);
      }
    }
  });

  it("keeps the translation notice active in every non-English locale", () => {
    for (const [locale] of nonEnglishLocales) {
      const localizedMessages = flatLocales[locale as keyof typeof flatLocales];
      expect(localizedMessages["app.translation_notice"].trim(), locale).not.toBe("");
    }
  });

  it("stores flat string messages only", () => {
    for (const locale of Object.keys(flatLocales)) {
      expect(Object.keys(flatLocales[locale as keyof typeof flatLocales]).length, locale).toBeGreaterThan(0);
    }
  });

  it("does not contain Unicode replacement characters", () => {
    for (const [locale, localizedMessages] of Object.entries(flatLocales)) {

      for (const [key, value] of Object.entries(localizedMessages)) {
        expect(value.includes("\uFFFD"), `${locale}:${key}`).toBe(false);
      }
    }
  });

  it("uses glossary-backed translations for key leather labels", () => {
    for (const [locale] of nonEnglishLocales) {
      const localizedMessages = flatLocales[locale as keyof typeof flatLocales];
      const glossaryTerms = glossary[locale as keyof typeof glossary];

      for (const [key, glossaryKey] of glossaryBackedKeys) {
        expect(localizedMessages[key], `${locale}:${key}`).toBe(glossaryTerms[glossaryKey as keyof typeof glossaryTerms]);
      }
    }
  });

  it("does not use hide-as-verb mistranslations on leather keys", () => {
    for (const [locale, patterns] of Object.entries(disallowedHideTerms)) {
      const messages = flatLocales[locale as keyof typeof flatLocales];
      const leatherEntries = Object.entries(messages).filter(([key]) =>
        key.startsWith("leather.") || key.startsWith("reference.leather."),
      );

      for (const [key, value] of leatherEntries) {
        for (const pattern of patterns) {
          expect(pattern.test(value), `${locale}:${key}:${value}`).toBe(false);
        }
      }
    }
  });
});
