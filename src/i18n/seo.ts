import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getLocalePath } from "./routing";
import type { Locale } from "./types";

export const SITE_URL = "https://vs-calculator.tcousin.com";
const SITE_NAME = "Vintage Story Alloy Calculator";

interface SeoContent {
  description: string;
  keywords: string;
  localeCode: string;
  schemaDescription: string;
  featureList: string[];
  title: string;
}

const SEO_CONTENT: Record<Locale, SeoContent> = {
  en: {
    title: "Vintage Story Alloy Calculator — Nugget Optimizer & Ingot Ratios",
    description:
      "Free web-based alloy calculator for Vintage Story. Get exact nugget counts and ingot ratios for bronze, bismuth bronze, black bronze, zinc and more.",
    keywords:
      "Vintage Story alloy calculator, VS alloy calculator, bronze calculator, bismuth bronze, black bronze, ingot ratio, nugget optimizer, metalworking, smithing, Vintage Story tools",
    localeCode: "en_US",
    schemaDescription:
      "Calculate exact alloy recipes for Vintage Story. Optimize nugget counts, maximize ingot yield, and find economical metal ratios for bronze, bismuth bronze, black bronze, zinc, and more.",
    featureList: [
      "Alloy recipe optimizer",
      "Nugget count calculator",
      "Ingot yield maximizer",
      "Economical metal ratio mode",
      "All Vintage Story alloys supported",
    ],
  },
  fr: {
    title: "Calculateur d'Alliages Vintage Story — Optimiseur de Pepites",
    description:
      "Calculateur d'alliages gratuit pour Vintage Story. Trouvez les pepites exactes et les ratios de lingots pour le bronze, le bronze au bismuth, le bronze noir, le zinc et plus.",
    keywords:
      "calculateur alliage Vintage Story, calculateur bronze Vintage Story, ratios lingots, pepites, bronze au bismuth, bronze noir, forge Vintage Story",
    localeCode: "fr_FR",
    schemaDescription:
      "Calculez les recettes d'alliages exactes pour Vintage Story. Optimisez les quantites de pepites, maximisez le rendement en lingots et trouvez les ratios les plus economes.",
    featureList: [
      "Optimiseur de recettes d'alliages",
      "Calculateur de pepites",
      "Maximisation du rendement en lingots",
      "Mode economique pour metaux rares",
      "Tous les alliages Vintage Story",
    ],
  },
  de: {
    title: "Vintage Story Legierungsrechner — Nugget Optimierer",
    description:
      "Kostenloser Legierungsrechner fur Vintage Story. Berechne exakte Nugget-Mengen und Barrenverhaltnisse fur Bronze, Wismutbronze, Schwarzbronze, Zink und mehr.",
    keywords:
      "Vintage Story Legierungsrechner, Bronze Rechner, Nugget Optimierer, Barrenverhaltnis, Wismutbronze, Schwarzbronze, Vintage Story Werkzeuge",
    localeCode: "de_DE",
    schemaDescription:
      "Berechne exakte Legierungsrezepte fur Vintage Story. Optimiere Nugget-Mengen, maximiere den Barren-Ertrag und finde sparsame Metallverhaltnisse.",
    featureList: [
      "Legierungsrezept-Optimierer",
      "Nugget-Rechner",
      "Barren-Ertrag maximieren",
      "Sparsamer Modus fur seltene Metalle",
      "Alle Vintage Story Legierungen",
    ],
  },
  es: {
    title: "Calculadora de Aleaciones Vintage Story — Optimizador de Pepitas",
    description:
      "Calculadora gratuita de aleaciones para Vintage Story. Obtiene cantidades exactas de pepitas y proporciones de lingotes para bronce, bronce de bismuto, bronce negro, zinc y mas.",
    keywords:
      "calculadora aleaciones Vintage Story, calculadora bronce, optimizador de pepitas, proporcion lingotes, bronce de bismuto, bronce negro, herramientas Vintage Story",
    localeCode: "es_ES",
    schemaDescription:
      "Calcula recetas exactas de aleaciones para Vintage Story. Optimiza cantidades de pepitas, maximiza el rendimiento de lingotes y encuentra proporciones economicas.",
    featureList: [
      "Optimizador de recetas de aleaciones",
      "Calculadora de pepitas",
      "Maximizacion de lingotes",
      "Modo economico para metales raros",
      "Todas las aleaciones de Vintage Story",
    ],
  },
  ru: {
    title: "Калькулятор сплавов Vintage Story — Оптимизатор самородков",
    description:
      "Бесплатный калькулятор сплавов для Vintage Story. Рассчитайте точное количество самородков и пропорции слитков для бронзы, висмутовой бронзы, чёрной бронзы и других сплавов.",
    keywords:
      "калькулятор сплавов Vintage Story, бронза, висмутовая бронза, чёрная бронза, самородки, слитки, кузнечное дело Vintage Story",
    localeCode: "ru_RU",
    schemaDescription:
      "Рассчитайте точные рецепты сплавов для Vintage Story. Оптимизируйте количество самородков, максимизируйте выход слитков и найдите экономичные пропорции металлов.",
    featureList: [
      "Оптимизатор рецептов сплавов",
      "Калькулятор самородков",
      "Максимизация выхода слитков",
      "Экономичный режим для редких металлов",
      "Все сплавы Vintage Story",
    ],
  },
  zh: {
    title: "Vintage Story 合金计算器 — 矿块数量优化器",
    description:
      "免费的 Vintage Story 合金计算器。精确计算青铜、铋青铜、黑青铜等合金所需的矿块数量和锭比例。",
    keywords:
      "Vintage Story 合金计算器, 青铜计算器, 矿块优化, 锭比例, 铋青铜, 黑青铜, Vintage Story 工具",
    localeCode: "zh_CN",
    schemaDescription:
      "精确计算 Vintage Story 的合金配方。优化矿块数量、最大化锭产量，并找到最经济的金属比例。",
    featureList: [
      "合金配方优化器",
      "矿块数量计算器",
      "最大化锭产量",
      "稀有金属经济模式",
      "支持所有 Vintage Story 合金",
    ],
  },
  ja: {
    title: "Vintage Story 合金計算機 — ナゲット数量最適化",
    description:
      "Vintage Story 用の無料合金計算機。青銅、ビスマス青銅、黒青銅などのナゲット数量とインゴット比率を正確に計算します。",
    keywords:
      "Vintage Story 合金計算機, 青銅計算機, ナゲット最適化, インゴット比率, ビスマス青銅, 黒青銅, Vintage Story ツール",
    localeCode: "ja_JP",
    schemaDescription:
      "Vintage Story の合金レシピを正確に計算します。ナゲット数量を最適化し、インゴット産出量を最大化し、経済的な金属比率を見つけます。",
    featureList: [
      "合金レシピ最適化",
      "ナゲット数量計算機",
      "インゴット産出量最大化",
      "希少金属の経済モード",
      "Vintage Story の全合金に対応",
    ],
  },
  ko: {
    title: "Vintage Story 합금 계산기 — 너겟 수량 최적화",
    description:
      "Vintage Story용 무료 합금 계산기. 청동, 비스무트 청동, 흑청동 등의 너겟 수량과 주괴 비율을 정확하게 계산하세요.",
    keywords:
      "Vintage Story 합금 계산기, 청동 계산기, 너겟 최적화, 주괴 비율, 비스무트 청동, 흑청동, Vintage Story 도구",
    localeCode: "ko_KR",
    schemaDescription:
      "Vintage Story의 합금 레시피를 정확하게 계산하세요. 너겟 수량을 최적화하고, 주괴 생산량을 극대화하며, 경제적인 금속 비율을 찾아보세요.",
    featureList: [
      "합금 레시피 최적화",
      "너겟 수량 계산기",
      "주괴 생산량 최대화",
      "희귀 금속 절약 모드",
      "Vintage Story의 모든 합금 지원",
    ],
  },
  pl: {
    title: "Kalkulator Stopów Vintage Story — Optymalizator Samorodków",
    description:
      "Darmowy kalkulator stopów dla Vintage Story. Oblicz dokładną ilość samorodków i proporcje sztab dla brązu, brązu bizmutowego, czarnego brązu i innych stopów.",
    keywords:
      "kalkulator stopów Vintage Story, kalkulator brązu, optymalizator samorodków, proporcje sztab, brąz bizmutowy, czarny brąz, narzędzia Vintage Story",
    localeCode: "pl_PL",
    schemaDescription:
      "Obliczaj dokładne przepisy na stopy dla Vintage Story. Optymalizuj ilość samorodków, maksymalizuj wydajność sztab i znajdź ekonomiczne proporcje metali.",
    featureList: [
      "Optymalizator przepisów na stopy",
      "Kalkulator samorodków",
      "Maksymalizacja wydajności sztab",
      "Ekonomiczny tryb dla rzadkich metali",
      "Wszystkie stopy Vintage Story",
    ],
  },
  pt: {
    title: "Calculadora de Ligas Vintage Story — Otimizador de Pepitas",
    description:
      "Calculadora gratuita de ligas para Vintage Story. Calcule a quantidade exata de pepitas e proporções de lingotes para bronze, bronze de bismuto, bronze negro e mais.",
    keywords:
      "calculadora de ligas Vintage Story, calculadora de bronze, otimizador de pepitas, proporção de lingotes, bronze de bismuto, bronze negro, ferramentas Vintage Story",
    localeCode: "pt_BR",
    schemaDescription:
      "Calcule receitas exatas de ligas para Vintage Story. Otimize a quantidade de pepitas, maximize o rendimento de lingotes e encontre proporções econômicas de metais.",
    featureList: [
      "Otimizador de receitas de ligas",
      "Calculadora de pepitas",
      "Maximização de lingotes",
      "Modo econômico para metais raros",
      "Todas as ligas de Vintage Story",
    ],
  },
};

export function getCanonicalUrl(locale: Locale): string {
  return new URL(getLocalePath(locale), `${SITE_URL}/`).toString();
}

export function getAlternateLinks() {
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      hrefLang: locale,
      href: getCanonicalUrl(locale),
    })),
    {
      hrefLang: "x-default",
      href: getCanonicalUrl(DEFAULT_LOCALE),
    },
  ];
}

export function getSeoContent(locale: Locale) {
  const content = SEO_CONTENT[locale];

  return {
    ...content,
    canonicalUrl: getCanonicalUrl(locale),
    alternates: getAlternateLinks(),
    schema: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: getCanonicalUrl(locale),
        description: content.schemaDescription,
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: content.featureList,
      },
      null,
      2,
    ),
  };
}

function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

export function localizeHtmlDocument(html: string, locale: Locale): string {
  const seo = getSeoContent(locale);
  const alternatesMarkup = seo.alternates
    .map(
      (alternate) =>
        `  <link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.href}" />`,
    )
    .join("\n");

  let localized = html;
  localized = replaceTag(
    localized,
    /<html lang="[^"]+">/,
    `<html lang="${locale}">`,
  );
  localized = replaceTag(
    localized,
    /<meta name="description"[\s\S]*?content="[^"]*" \/>/,
    `  <meta name="description" content="${seo.description}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta name="keywords"[\s\S]*?content="[^"]*" \/>/,
    `  <meta name="keywords" content="${seo.keywords}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="og:url" content="[^"]*" \/>/,
    `  <meta property="og:url" content="${seo.canonicalUrl}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="og:title" content="[^"]*" \/>/,
    `  <meta property="og:title" content="${seo.title}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="og:description"[\s\S]*?content="[^"]*" \/>/,
    `  <meta property="og:description" content="${seo.description}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="og:locale" content="[^"]*" \/>/,
    `  <meta property="og:locale" content="${seo.localeCode}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="twitter:url" content="[^"]*" \/>/,
    `  <meta property="twitter:url" content="${seo.canonicalUrl}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="twitter:title" content="[^"]*" \/>/,
    `  <meta property="twitter:title" content="${seo.title}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="twitter:description"[\s\S]*?content="[^"]*" \/>/,
    `  <meta property="twitter:description" content="${seo.description}" />`,
  );
  localized = replaceTag(
    localized,
    /<title>[\s\S]*?<\/title>/,
    `  <title>${seo.title}</title>`,
  );
  localized = replaceTag(
    localized,
    /<link rel="canonical" href="[^"]*" \/>[\s\S]*?(?=\s*<!-- JSON-LD Structured Data -->)/,
    `  <link rel="canonical" href="${seo.canonicalUrl}" />\n${alternatesMarkup}\n`,
  );
  localized = replaceTag(
    localized,
    /<script type="application\/ld\+json" data-seo-schema="true">[\s\S]*?<\/script>/,
    `  <script type="application/ld+json" data-seo-schema="true">\n${seo.schema}\n  </script>`,
  );

  return localized;
}
