import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getLocalePath } from "./routing";
import type { Locale } from "./types";
import enCopy from "./en.json";
import frCopy from "./fr.json";
import deCopy from "./de.json";
import esCopy from "./es.json";
import ruCopy from "./ru.json";
import zhCopy from "./zh.json";
import jaCopy from "./ja.json";
import koCopy from "./ko.json";
import plCopy from "./pl.json";
import ptCopy from "./pt.json";
import { METALLURGY_VIEW_PATHS } from "../features/metallurgy/routing/routes";
import { POTTERY_VIEW_PATHS } from "../features/pottery/routing/routes";
import { getCanonicalAppPath, LEATHER_ROUTE_PATH, OVERVIEW_ROUTE_PATH, REFERENCE_ROUTE_PATH } from "../routing/routes";

export const SITE_URL = "https://vs-calculator.tcousin.com";
const SITE_NAME = "Vintage Story Alloy Calculator";
const SITE_IMAGE_URL = new URL("/Grid_Copper_anvil.png", `${SITE_URL}/`).toString();
const SEO_COPY: Record<Locale, Record<string, string>> = {
  en: enCopy as Record<string, string>,
  fr: frCopy as Record<string, string>,
  de: deCopy as Record<string, string>,
  es: esCopy as Record<string, string>,
  ru: ruCopy as Record<string, string>,
  zh: zhCopy as Record<string, string>,
  ja: jaCopy as Record<string, string>,
  ko: koCopy as Record<string, string>,
  pl: plCopy as Record<string, string>,
  pt: ptCopy as Record<string, string>,
};

function seoT(locale: Locale, key: string): string {
  return SEO_COPY[locale][key] ?? SEO_COPY.en[key] ?? key;
}
const GENERAL_TOOL_KEYWORDS = [
  "Vintage Story tool",
  "Vintage Story tools",
  "Vintage Story calculator",
  "Vintage Story calculators",
  "Vintage Story crafting calculator",
  "Vintage Story production planner",
  "VS calculator",
  "VS tools",
];
const ALLOY_ROUTE_KEYWORDS =
  "Vintage Story alloy calculator, Vintage Story metallurgy calculator, Vintage Story bronze calculator, Vintage Story bismuth bronze calculator, Vintage Story black bronze calculator, Vintage Story crucible calculator, Vintage Story ingot calculator, Vintage Story nugget calculator";
const LEATHER_ROUTE_TITLE = "Vintage Story Leather Calculator";
const LEATHER_ROUTE_DESCRIPTION =
  "Calculate raw hides, soaking liquid, tannin logs, water, barrels, lime, borax, and pelt curing steps for the full Vintage Story leatherworking pipeline.";
const LEATHER_ROUTE_KEYWORDS =
  "Vintage Story leather calculator, Vintage Story leather planner, Vintage Story hide calculator, Vintage Story tanning calculator, Vintage Story pelt calculator, Vintage Story leatherworking tool, hide tanning planner, tannin calculator";
const LEATHER_FEATURE_LIST = [
  "Vintage Story leather calculator",
  "Vintage Story leatherworking planner",
  "Hide-to-leather material planning",
  "Barrel and tannin workflow breakdown",
  "Lime and powdered borax shopping list",
];
const POTTERY_CALCULATOR_ROUTE_KEYWORDS =
  "Vintage Story pottery calculator, Vintage Story clay calculator, Vintage Story clay forming calculator, Vintage Story clay cost calculator, clay oven fire clay calculator, pottery molds calculator, shingles clay calculator";
const POTTERY_PLANNER_ROUTE_KEYWORDS =
  "Vintage Story pottery planner, clay inventory planner, clay forming shopping list, fire clay calculator, pottery mold planner, Vintage Story pottery batches";
const POTTERY_FEATURE_LIST = [
  "Vintage Story pottery calculator",
  "Vintage Story pottery clay calculator",
  "Clay forming item and mold planner",
  "General clay and fire clay inventory checks",
  "Pottery recipe and firing reference",
];
const POTTERY_CALCULATOR_FAQ_ITEMS: SeoFaqItem[] = [
  {
    question: "How much clay do pottery items need in Vintage Story?",
    answer:
      "The calculator uses the clay forming costs for each supported item and mold, including 1 clay for bowls, 3 for ingot molds, 4 for a shingles batch, and 69 fire clay for a clay oven.",
  },
  {
    question: "Does the clay oven require fire clay?",
    answer:
      "Yes. The clay oven is treated as fire-clay-only, while general pottery items can use common clay types or surplus fire clay if you choose to spend it that way.",
  },
  {
    question: "Do pottery recipes need firing after clay forming?",
    answer:
      "Most pottery items and molds need kiln firing after clay forming. The planner keeps the firing requirement visible so the material plan does not stop at raw clay cost.",
  },
];
const POTTERY_PLANNER_FAQ_ITEMS: SeoFaqItem[] = [
  {
    question: "How does the pottery planner handle fire clay?",
    answer:
      "It reserves fire clay for fire-clay-only recipes first, then can count remaining fire clay toward general clay demand so inventory shortfalls are easier to spot.",
  },
  {
    question: "Can I plan molds and pottery items together?",
    answer:
      "Yes. The planner covers pottery items, storage vessels, shingles, and clay molds together, then totals the complete clay requirement for the selected batch.",
  },
  {
    question: "How are clay shingles calculated?",
    answer:
      "Shingles are planned as the in-game batch output: 4 clay produces 12 shingles, so the planner tracks both the number of batches and the resulting item count.",
  },
];
const OVERVIEW_ROUTE_TITLE = "Vintage Story Calculator";
const OVERVIEW_ROUTE_DESCRIPTION =
  "Use one Vintage Story calculator toolkit for alloy ratios, metallurgy planning, pottery clay forming, leatherworking hides, pelt curing, and reference lookups.";
const OVERVIEW_ROUTE_KEYWORDS = [
  ...GENERAL_TOOL_KEYWORDS,
  "Vintage Story alloy calculator",
  "Vintage Story leather calculator",
  "Vintage Story pottery calculator",
  "Vintage Story metallurgy calculator",
  "Vintage Story clay calculator",
  "Vintage Story hide calculator",
].join(", ");
const OVERVIEW_FEATURE_LIST = [
  "Vintage Story tool",
  "Vintage Story calculator",
  "Vintage Story alloy calculator",
  "Vintage Story leather calculator",
  "Vintage Story pottery calculator",
  "Metallurgy calculator and planner",
  "Pottery clay forming calculator and planner",
  "Leatherworking and pelt-curing calculator",
  "Shared metallurgy, pottery, and leatherwork reference",
  "Vintage Story production planning toolkit",
];
const OVERVIEW_FAQ_ITEMS: SeoFaqItem[] = [
  {
    question: "What can this Vintage Story toolset help me plan?",
    answer:
      "It covers metallurgy, pottery, and leatherwork: alloy ratios, crucible batches, clay forming costs, hide tanning, pelt curing, tanning liquid, barrel usage, and material shopping lists.",
  },
  {
    question: "Does the reference cover both metallurgy and leatherwork now?",
    answer:
      "Yes. The shared reference page groups metallurgy, pottery, and leatherwork information in one place so you can switch between alloy data, clay forming recipes, and hide-processing rules without leaving the reference surface.",
  },
  {
    question: "Can I still deep-link directly to the metallurgy tools?",
    answer:
      "Yes. Calculator and planner URLs remain shareable under the /metallurgy/ and /pottery/ paths, while leatherwork remains under /leather/.",
  },
];
const REFERENCE_ROUTE_TITLE = "Vintage Story Reference";
const REFERENCE_ROUTE_DESCRIPTION =
  "Vintage Story reference data for metallurgy, pottery, and leatherwork: alloy ranges, clay recipes, hide workflow rules, solvents, and tannin.";
const REFERENCE_FEATURE_LIST = [
  "Alloy recipe and smelting reference",
  "Pottery clay forming recipe reference",
  "Leatherwork hide, solvent, and tannin reference",
  "Shared reference tabs for metallurgy, pottery, and leatherwork",
];

export interface SeoFaqItem {
  question: string;
  answer: string;
}

interface SeoContent {
  title: string;
  description: string;
  keywords: string;
  localeCode: string;
  schemaDescription: string;
  featureList: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  supportedAlloysHeading: string;
  supportedAlloysBody: string;
  supportedAlloyIds: string[];
  howItWorksHeading: string;
  howItWorksBody: string;
  planningHeading: string;
  planningBody: string;
  faqHeading: string;
  faqItems: SeoFaqItem[];
}

const COMMON_SUPPORTED_ALLOYS = [
  "tin-bronze",
  "bismuth-bronze",
  "black-bronze",
  "brass",
  "molybdochalkos",
  "lead-solder",
  "silver-solder",
  "cupronickel",
  "electrum",
] as const;

const PLANNER_ROUTE_TITLES: Record<Locale, string> = {
  en: "Metallurgy Planner",
  fr: "Planificateur de metallurgie",
  de: "Metallurgie-Planer",
  es: "Planificador de metalurgia",
  ru: "Planirovshchik metallurgii",
  zh: "Yejin guihuaqi",
  ja: "Yakin puranna",
  ko: "Yageum peullaeneo",
  pl: "Planer metalurgii",
  pt: "Planejador de metalurgia",
};

const PLANNER_ROUTE_DESCRIPTION_SUFFIXES: Record<Locale, string> = {
  en: "Includes inventory-driven metallurgy planning, multi-run crucible execution, and scarce-metal decision support.",
  fr: "Inclut la planification metallurgique basee sur l'inventaire, l'execution de plusieurs coulees de creuset et l'aide a la decision pour les metaux rares.",
  de: "Enthaelt inventarbasierte Metallurgie-Planung, mehrere Tiegel-Durchgaenge und Entscheidungshilfen fuer seltene Metalle.",
  es: "Incluye planificacion metalurgica basada en inventario, ejecucion de varias tandas de crisol y ayuda para decidir sobre metales escasos.",
  ru: "Vklyuchaet planirovanie metallurgii po zapasam, neskolko zagruzok tiglya i podskazki po ekonomii redkikh metallov.",
  zh: "Baohan jiyu kucun de yejin guihua, duoci ganguo piping zhixing he xique jinshu juece zhichi.",
  ja: "Zaiko benesu no yakin keikaku, fukusu no rutsubo batchi jikko, kisho kinzoku no handan shien o fukumimasu.",
  ko: "Jaego giban yageum gyehoeg, yeoreo beonui dogani jageob, huigwi geumsok uisa gyeoljeong jiwoneul pohamhapnida.",
  pl: "Zawiera planowanie metalurgii na podstawie ekwipunku, wiele wsadow tygla i pomoc przy decyzjach dotyczacych rzadkich metali.",
  pt: "Inclui planejamento metalurgico guiado por inventario, varias cargas de cadinho e apoio a decisoes sobre metais raros.",
};

const SEO_CONTENT: Record<Locale, SeoContent> = {
  en: {
    title: "Vintage Story Alloy Calculator | Bronze & Alloy Ratios",
    description:
      "Plan Vintage Story crucible mixes with exact nugget counts, ingot yield, and alloy ratios for bronze, bismuth bronze, black bronze, and more.",
    keywords:
      "Vintage Story alloy calculator, bronze ratio calculator, bismuth bronze calculator, black bronze calculator, Vintage Story ingot calculator, nugget calculator, crucible planner",
    localeCode: "en_US",
    schemaDescription:
      "Plan valid Vintage Story alloy mixes with exact nugget counts, ingot yield, and crucible-friendly ratios for bronze, bismuth bronze, black bronze, brass, solder, and more.",
    featureList: [
      "Vintage Story alloy ratio calculator",
      "Exact nugget and ingot planning",
      "Crucible mix validation",
      "Bronze, bismuth bronze, black bronze, brass, solder, electrum, and more",
    ],
    heroEyebrow: "Crucible planning for Vintage Story",
    heroTitle: "Vintage Story Alloy Calculator",
    heroDescription:
      "Calculate valid alloy ratios, exact nugget counts, and ingot yield before you smelt. This calculator helps you plan bronze, bismuth bronze, black bronze, brass, solder, electrum, and other Vintage Story alloys without spreadsheet guesswork.",
    supportedAlloysHeading: "Supported alloys",
    supportedAlloysBody:
      "The calculator covers the full in-game alloy set and keeps the most searched recipes visible: bronze, bismuth bronze, black bronze, brass, electrum, cupronickel, solder, and more.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "How it works",
    howItWorksBody:
      "Enter metals into the four crucible slots, adjust nugget amounts, and the tool checks whether the composition matches a valid alloy. It also shows exact unit totals, smelting thresholds, and suggested fixes for near-miss mixes.",
    planningHeading: "Why use it",
    planningBody:
      "Vintage Story alloying is easy to miscalculate when you are juggling partial ingots, rare metals, and ratio ranges. This page is designed for quick crucible planning, yield optimization, and sanity checks before you commit resources.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "How do I calculate a valid alloy mix in Vintage Story?",
        answer:
          "Choose the metals you want in the crucible, enter nugget counts, and compare the resulting percentages with the valid ranges. This calculator does that instantly and highlights whether the mix is exact, close, or invalid.",
      },
      {
        question: "Which alloys does this Vintage Story calculator support?",
        answer:
          "It supports the full alloy list used by the in-game crucible, including tin bronze, bismuth bronze, black bronze, brass, molybdochalkos, lead solder, silver solder, cupronickel, and electrum.",
      },
    ],
  },
  fr: {
    title: "Calculateur d'alliages Vintage Story | ratios bronze et lingots",
    description:
      "Planifiez vos alliages Vintage Story : pépites exactes, rendement en lingots et ratios valides pour le bronze, bismuth bronze, bronze noir et plus.",
    keywords:
      "calculateur alliage Vintage Story, calculateur bronze, bronze au bismuth, bronze noir, calculateur lingots, calculateur pépites, planificateur creuset",
    localeCode: "fr_FR",
    schemaDescription:
      "Planifiez des alliages valides pour Vintage Story avec le nombre exact de pépites, le rendement en lingots et des ratios adaptés au creuset.",
    featureList: [
      "Calculateur de ratios d'alliages Vintage Story",
      "Calcul précis des pépites et des lingots",
      "Validation des mélanges de creuset",
      "Bronze, bronze au bismuth, bronze noir, laiton, soudures et plus",
    ],
    heroEyebrow: "Planification de creuset pour Vintage Story",
    heroTitle: "Calculateur d'alliages Vintage Story",
    heroDescription:
      "Calculez les ratios valides, le nombre exact de pépites et le rendement en lingots avant la fusion. Cet outil aide à préparer le bronze, le bronze au bismuth, le bronze noir, le laiton, les soudures, l'électrum et d'autres alliages de Vintage Story.",
    supportedAlloysHeading: "Alliages pris en charge",
    supportedAlloysBody:
      "Le calculateur couvre tous les alliages du jeu et met en avant les recettes les plus recherchées : bronze, bronze au bismuth, bronze noir, laiton, électrum, cupronickel et soudures.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "Comment ça marche",
    howItWorksBody:
      "Ajoutez les métaux dans les quatre emplacements du creuset, ajustez le nombre de pépites, puis l'outil vérifie immédiatement si la composition correspond à un alliage valide. Il affiche aussi les unités totales, les seuils de fusion et les corrections possibles.",
    planningHeading: "Pourquoi l'utiliser",
    planningBody:
      "Les alliages de Vintage Story deviennent vite pénibles à calculer avec des lingots partiels, des métaux rares et des plages de ratios. Cette page sert à planifier vite, optimiser le rendement et éviter de gaspiller des ressources.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Comment calculer un alliage valide dans Vintage Story ?",
        answer:
          "Choisissez les métaux du creuset, entrez le nombre de pépites et comparez les pourcentages obtenus avec les plages valides. Le calculateur le fait automatiquement et indique si le mélange est exact, proche ou invalide.",
      },
      {
        question: "Quels alliages sont pris en charge ?",
        answer:
          "Le calculateur prend en charge toute la liste des alliages du creuset du jeu, y compris le bronze, le bronze au bismuth, le bronze noir, le laiton, le molybdochalkos, les soudures, le cupronickel et l'électrum.",
      },
    ],
  },
  de: {
    title: "Vintage Story Legierungsrechner | Bronze- und Barrenverhältnisse",
    description:
      "Plane Vintage Story Tiegelmischungen mit exakten Nugget-Mengen, Barren-Ausbeute und gültigen Verhältnissen für Bronze, Wismutbronze und mehr.",
    keywords:
      "Vintage Story Legierungsrechner, Bronze Rechner, Wismutbronze, Schwarzbronze, Barren Rechner, Nugget Rechner, Tiegel Planung",
    localeCode: "de_DE",
    schemaDescription:
      "Plane gültige Vintage Story Legierungen mit exakten Nugget-Mengen, Barren-Ausbeute und tiegeltauglichen Metallverhältnissen.",
    featureList: [
      "Legierungsrechner für Vintage Story",
      "Exakte Planung von Nuggets und Barren",
      "Validierung von Tiegelmischungen",
      "Bronze, Wismutbronze, Schwarzbronze, Messing, Lote und mehr",
    ],
    heroEyebrow: "Tiegelplanung für Vintage Story",
    heroTitle: "Vintage Story Legierungsrechner",
    heroDescription:
      "Berechne gültige Verhältnisse, exakte Nugget-Mengen und die Barren-Ausbeute vor dem Schmelzen. Das Tool hilft bei Bronze, Wismutbronze, Schwarzbronze, Messing, Lot, Elektrum und weiteren Vintage-Story-Legierungen.",
    supportedAlloysHeading: "Unterstützte Legierungen",
    supportedAlloysBody:
      "Der Rechner deckt alle Legierungen im Spiel ab und hebt die am häufigsten gesuchten Rezepte hervor: Bronze, Wismutbronze, Schwarzbronze, Messing, Elektrum, Cupronickel und Lote.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "So funktioniert es",
    howItWorksBody:
      "Trage Metalle in die vier Tiegelslots ein, passe die Nugget-Mengen an und das Tool prüft sofort, ob die Mischung eine gültige Legierung ergibt. Außerdem zeigt es Einheiten, Schmelzschwellen und Korrekturvorschläge an.",
    planningHeading: "Warum es nützlich ist",
    planningBody:
      "Vintage Story Legierungen sind schnell fehleranfällig, wenn Teilbarren, seltene Metalle und Prozentbereiche zusammenkommen. Diese Seite hilft beim schnellen Planen, Optimieren und Gegenprüfen vor dem Einschmelzen.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Wie berechne ich eine gültige Legierung in Vintage Story?",
        answer:
          "Wähle die Metalle für den Tiegel, gib die Nugget-Mengen ein und vergleiche die resultierenden Prozentsätze mit den gültigen Bereichen. Dieser Rechner macht das sofort und zeigt an, ob die Mischung exakt, nah dran oder ungültig ist.",
      },
      {
        question: "Welche Legierungen unterstützt der Rechner?",
        answer:
          "Unterstützt werden alle Legierungen aus dem Spieltiegel, darunter Bronze, Wismutbronze, Schwarzbronze, Messing, Molybdochalkos, Blei- und Silberlot, Cupronickel und Elektrum.",
      },
    ],
  },
  es: {
    title: "Calculadora de aleaciones Vintage Story | ratios bronce",
    description:
      "Planifica mezclas de crisol Vintage Story con pepitas exactas, rendimiento de lingotes y proporciones válidas para bronce, bismuto, bronce negro y más.",
    keywords:
      "calculadora aleaciones Vintage Story, calculadora bronce, bronce de bismuto, bronce negro, calculadora lingotes, calculadora pepitas, planificador de crisol",
    localeCode: "es_ES",
    schemaDescription:
      "Planifica aleaciones válidas de Vintage Story con cantidades exactas de pepitas, rendimiento de lingotes y proporciones adecuadas para el crisol.",
    featureList: [
      "Calculadora de ratios de aleaciones para Vintage Story",
      "Planificación exacta de pepitas y lingotes",
      "Validación de mezclas de crisol",
      "Bronce, bronce de bismuto, bronce negro, latón, soldaduras y más",
    ],
    heroEyebrow: "Planificación de crisol para Vintage Story",
    heroTitle: "Calculadora de aleaciones Vintage Story",
    heroDescription:
      "Calcula proporciones válidas, cantidades exactas de pepitas y rendimiento de lingotes antes de fundir. Esta herramienta te ayuda con bronce, bronce de bismuto, bronce negro, latón, soldaduras, electro y otras aleaciones de Vintage Story.",
    supportedAlloysHeading: "Aleaciones compatibles",
    supportedAlloysBody:
      "La calculadora cubre toda la lista de aleaciones del juego y destaca las recetas más buscadas: bronce, bronce de bismuto, bronce negro, latón, electrum, cuproníquel y soldaduras.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "Cómo funciona",
    howItWorksBody:
      "Introduce metales en las cuatro ranuras del crisol, ajusta las pepitas y la herramienta comprueba al instante si la composición coincide con una aleación válida. También muestra unidades totales, umbrales de fundición y sugerencias de ajuste.",
    planningHeading: "Por qué usarla",
    planningBody:
      "Las aleaciones de Vintage Story son fáciles de calcular mal cuando mezclas lingotes parciales, metales raros y rangos de porcentajes. Esta página sirve para planificar rápido, optimizar rendimiento y evitar desperdicios.",
    faqHeading: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Cómo calculo una aleación válida en Vintage Story?",
        answer:
          "Elige los metales del crisol, introduce la cantidad de pepitas y compara los porcentajes resultantes con los rangos válidos. La calculadora lo hace automáticamente y marca si la mezcla es exacta, cercana o inválida.",
      },
      {
        question: "¿Qué aleaciones admite esta calculadora?",
        answer:
          "Admite toda la lista de aleaciones del crisol del juego, incluyendo bronce, bronce de bismuto, bronce negro, latón, molibdocalcos, soldadura de plomo, soldadura de plata, cuproníquel y electrum.",
      },
    ],
  },
  ru: {
    title: "Калькулятор сплавов Vintage Story | бронза, пропорции и слитки",
    description:
      "Планируйте смеси тигля Vintage Story: самородки, выход слитков и пропорции для бронзы, висмутовой бронзы, чёрной бронзы и других сплавов.",
    keywords:
      "калькулятор сплавов Vintage Story, бронза, висмутовая бронза, чёрная бронза, калькулятор слитков, самородки, тигель",
    localeCode: "ru_RU",
    schemaDescription:
      "Планируйте правильные сплавы для Vintage Story с точным количеством самородков, выходом слитков и удобными пропорциями для тигля.",
    featureList: [
      "Калькулятор пропорций сплавов Vintage Story",
      "Точное планирование самородков и слитков",
      "Проверка смеси в тигле",
      "Бронза, висмутовая бронза, чёрная бронза, латунь, припои и другое",
    ],
    heroEyebrow: "Планирование тигля для Vintage Story",
    heroTitle: "Калькулятор сплавов Vintage Story",
    heroDescription:
      "Рассчитывайте правильные пропорции, точное количество самородков и выход слитков до плавки. Инструмент помогает готовить бронзу, висмутовую бронзу, чёрную бронзу, латунь, припои, электрум и другие сплавы Vintage Story.",
    supportedAlloysHeading: "Поддерживаемые сплавы",
    supportedAlloysBody:
      "Калькулятор охватывает весь список игровых сплавов и выделяет самые востребованные рецепты: бронзу, висмутовую бронзу, чёрную бронзу, латунь, электрум, купроникель и припои.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "Как это работает",
    howItWorksBody:
      "Добавьте металлы в четыре слота тигля, настройте количество самородков, и инструмент сразу проверит, соответствует ли смесь правильному сплаву. Он также показывает общее количество единиц, пороги плавки и подсказки по исправлению.",
    planningHeading: "Зачем использовать",
    planningBody:
      "В Vintage Story легко ошибиться в расчётах, когда вы работаете с неполными слитками, редкими металлами и диапазонами процентов. Эта страница нужна для быстрой проверки, планирования и экономии ресурсов.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Как рассчитать правильный сплав в Vintage Story?",
        answer:
          "Выберите металлы для тигля, введите количество самородков и сравните получившиеся проценты с допустимыми диапазонами. Калькулятор делает это автоматически и показывает, точная смесь получилась, близкая или неверная.",
      },
      {
        question: "Какие сплавы поддерживает калькулятор?",
        answer:
          "Поддерживается весь список сплавов из игрового тигля: бронза, висмутовая бронза, чёрная бронза, латунь, молибдохалкос, свинцовый и серебряный припой, купроникель и электрум.",
      },
    ],
  },
  zh: {
    title: "Vintage Story 合金计算器 | 青铜比例、矿块数量与锭产量",
    description:
      "为 Vintage Story 规划坩埚配方，精确计算矿块数量、锭产量，以及青铜、铋青铜、黑青铜等合金的有效比例。",
    keywords:
      "Vintage Story 合金计算器, 青铜比例, 铋青铜, 黑青铜, 锭计算器, 矿块计算器, 坩埚规划",
    localeCode: "zh_CN",
    schemaDescription:
      "为 Vintage Story 规划有效合金配方，提供精确的矿块数量、锭产量和适合坩埚的金属比例。",
    featureList: [
      "Vintage Story 合金比例计算器",
      "精确规划矿块数量和锭产量",
      "验证坩埚混合配方",
      "支持青铜、铋青铜、黑青铜、黄铜、焊料等",
    ],
    heroEyebrow: "Vintage Story 坩埚规划",
    heroTitle: "Vintage Story 合金计算器",
    heroDescription:
      "在熔炼前计算有效比例、精确矿块数量和锭产量。这个工具可以帮助你规划青铜、铋青铜、黑青铜、黄铜、焊料、金银铜和其他 Vintage Story 合金。",
    supportedAlloysHeading: "支持的合金",
    supportedAlloysBody:
      "计算器覆盖游戏中的全部合金，并突出最常搜索的配方：青铜、铋青铜、黑青铜、黄铜、金银铜、白铜以及各种焊料。",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "工作原理",
    howItWorksBody:
      "把金属加入四个坩埚槽位并调整矿块数量，工具会立即检查当前配方是否属于有效合金。同时显示总单位数、熔炼阈值，以及接近正确配方时的修正建议。",
    planningHeading: "为什么要用它",
    planningBody:
      "在 Vintage Story 里，一旦涉及部分锭、稀有金属和比例区间，手算就很容易出错。这个页面适合快速规划坩埚、优化产量，并在投入资源前做最后核对。",
    faqHeading: "常见问题",
    faqItems: [
      {
        question: "如何计算 Vintage Story 的有效合金配方？",
        answer:
          "选择要放入坩埚的金属，输入矿块数量，然后把结果百分比与有效范围进行比较。这个计算器会自动完成这些步骤，并标记当前混合是精确、接近还是无效。",
      },
      {
        question: "这个计算器支持哪些合金？",
        answer:
          "它支持游戏坩埚中的全部合金，包括青铜、铋青铜、黑青铜、黄铜、钼黄铜、铅焊料、银焊料、白铜和金银铜。",
      },
    ],
  },
  ja: {
    title: "Vintage Story 合金計算機 | 青銅比率、ナゲット数、インゴット歩留まり",
    description:
      "Vintage Story のるつぼ配合を計画し、青銅、ビスマス青銅、黒青銅などの有効な比率、正確なナゲット数、インゴット歩留まりを計算します。",
    keywords:
      "Vintage Story 合金計算機, 青銅 比率, ビスマス青銅, 黒青銅, インゴット計算, ナゲット計算, るつぼ",
    localeCode: "ja_JP",
    schemaDescription:
      "Vintage Story の有効な合金配合を計画し、正確なナゲット数、インゴット歩留まり、るつぼ向けの比率を確認できます。",
    featureList: [
      "Vintage Story 合金比率計算",
      "ナゲット数とインゴット歩留まりの正確な計画",
      "るつぼ配合の検証",
      "青銅、ビスマス青銅、黒青銅、真鍮、はんだなどに対応",
    ],
    heroEyebrow: "Vintage Story のるつぼ計画",
    heroTitle: "Vintage Story 合金計算機",
    heroDescription:
      "精錬前に有効な比率、正確なナゲット数、インゴット歩留まりを確認できます。青銅、ビスマス青銅、黒青銅、真鍮、はんだ、エレクトラムなどの配合計画に役立ちます。",
    supportedAlloysHeading: "対応合金",
    supportedAlloysBody:
      "この計算機はゲーム内の全合金に対応し、青銅、ビスマス青銅、黒青銅、真鍮、エレクトラム、キュプロニッケル、各種はんだなどの主要レシピを確認できます。",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "使い方",
    howItWorksBody:
      "4つのるつぼスロットに金属を入れ、ナゲット数を調整すると、その場で有効な合金かどうかを判定します。合計ユニット、溶解ライン、近い配合の修正案も表示されます。",
    planningHeading: "使う理由",
    planningBody:
      "Vintage Story の合金は、端数インゴットや希少金属、比率範囲が絡むと手計算しづらくなります。このページは、精錬前の確認、歩留まり最適化、資源節約に向いています。",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Vintage Story で有効な合金をどう計算しますか？",
        answer:
          "るつぼに入れる金属を選び、ナゲット数を入力して、得られた割合を有効範囲と比較します。この計算機が自動で判定し、正確・近い・無効のどれかを示します。",
      },
      {
        question: "この計算機はどの合金に対応していますか？",
        answer:
          "ゲーム内るつぼで使う全合金に対応しており、青銅、ビスマス青銅、黒青銅、真鍮、モリブドカルコス、鉛はんだ、銀はんだ、キュプロニッケル、エレクトラムを含みます。",
      },
    ],
  },
  ko: {
    title: "Vintage Story 합금 계산기 | 청동 비율, 너겟 수량, 주괴 수율",
    description:
      "Vintage Story 도가니 배합을 계획하고 청동, 비스무트 청동, 흑청동 등의 유효 비율, 정확한 너겟 수량, 주괴 수율을 계산하세요.",
    keywords:
      "Vintage Story 합금 계산기, 청동 비율, 비스무트 청동, 흑청동, 주괴 계산기, 너겟 계산기, 도가니 계획",
    localeCode: "ko_KR",
    schemaDescription:
      "Vintage Story의 유효한 합금 배합을 계획하고 정확한 너겟 수량, 주괴 수율, 도가니용 금속 비율을 확인할 수 있습니다.",
    featureList: [
      "Vintage Story 합금 비율 계산기",
      "정확한 너겟 수량 및 주괴 수율 계획",
      "도가니 배합 검증",
      "청동, 비스무트 청동, 흑청동, 황동, 땜납 등 지원",
    ],
    heroEyebrow: "Vintage Story 도가니 계획",
    heroTitle: "Vintage Story 합금 계산기",
    heroDescription:
      "제련 전에 유효 비율, 정확한 너겟 수량, 주괴 수율을 계산하세요. 이 도구는 청동, 비스무트 청동, 흑청동, 황동, 땜납, 일렉트럼 등 다양한 Vintage Story 합금 계획에 도움이 됩니다.",
    supportedAlloysHeading: "지원 합금",
    supportedAlloysBody:
      "이 계산기는 게임 내 모든 합금을 다루며, 청동, 비스무트 청동, 흑청동, 황동, 일렉트럼, 큐프로니켈, 각종 땜납처럼 많이 찾는 조합을 빠르게 확인할 수 있습니다.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "작동 방식",
    howItWorksBody:
      "금속을 네 개의 도가니 슬롯에 넣고 너겟 수량을 조정하면 현재 조합이 유효한 합금인지 바로 판정합니다. 총 단위 수, 제련 기준, 거의 맞는 조합을 위한 수정 제안도 함께 표시됩니다.",
    planningHeading: "왜 유용한가",
    planningBody:
      "Vintage Story 합금은 부분 주괴, 희귀 금속, 비율 범위가 섞이면 손계산이 금방 복잡해집니다. 이 페이지는 빠른 배합 확인, 수율 최적화, 자원 낭비 방지에 맞춰져 있습니다.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Vintage Story에서 유효한 합금을 어떻게 계산하나요?",
        answer:
          "도가니에 넣을 금속을 고르고 너겟 수량을 입력한 뒤, 결과 비율을 유효 범위와 비교하면 됩니다. 이 계산기가 그 과정을 자동으로 처리하고 정확함, 근접함, 무효 여부를 표시합니다.",
      },
      {
        question: "이 계산기는 어떤 합금을 지원하나요?",
        answer:
          "게임 내 도가니에서 만드는 전체 합금을 지원하며, 청동, 비스무트 청동, 흑청동, 황동, 몰리브도칼코스, 납땜 합금, 은땜 합금, 큐프로니켈, 일렉트럼이 포함됩니다.",
      },
    ],
  },
  pl: {
    title: "Kalkulator stopów Vintage Story | proporcje brązu",
    description:
      "Planuj mieszanki tygla Vintage Story z dokładną liczbą samorodków, wydajnością sztabek i proporcjami dla brązu, brązu bizmutowego i innych stopów.",
    keywords:
      "kalkulator stopów Vintage Story, brąz, brąz bizmutowy, czarny brąz, kalkulator sztabek, samorodki, tygiel",
    localeCode: "pl_PL",
    schemaDescription:
      "Planuj poprawne stopy w Vintage Story z dokładną liczbą samorodków, wydajnością sztabek i proporcjami odpowiednimi do tygla.",
    featureList: [
      "Kalkulator proporcji stopów Vintage Story",
      "Dokładne planowanie samorodków i sztabek",
      "Walidacja mieszanek tygla",
      "Brąz, brąz bizmutowy, czarny brąz, mosiądz, luty i więcej",
    ],
    heroEyebrow: "Planowanie tygla do Vintage Story",
    heroTitle: "Kalkulator stopów Vintage Story",
    heroDescription:
      "Oblicz poprawne proporcje, dokładną liczbę samorodków i wydajność sztabek przed przetopieniem. Narzędzie pomaga planować brąz, brąz bizmutowy, czarny brąz, mosiądz, luty, elektrum i inne stopy z Vintage Story.",
    supportedAlloysHeading: "Obsługiwane stopy",
    supportedAlloysBody:
      "Kalkulator obejmuje pełną listę stopów z gry i podkreśla najczęściej wyszukiwane receptury: brąz, brąz bizmutowy, czarny brąz, mosiądz, elektrum, cupronikiel i luty.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "Jak to działa",
    howItWorksBody:
      "Dodaj metale do czterech slotów tygla, ustaw liczbę samorodków, a narzędzie od razu sprawdzi, czy mieszanka odpowiada poprawnemu stopowi. Pokazuje też sumę jednostek, próg przetopienia i sugestie poprawek.",
    planningHeading: "Dlaczego warto",
    planningBody:
      "W Vintage Story łatwo pomylić proporcje, gdy łączysz częściowe sztabki, rzadkie metale i zakresy procentowe. Ta strona pomaga szybko planować, optymalizować wydajność i oszczędzać surowce.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Jak obliczyć poprawny stop w Vintage Story?",
        answer:
          "Wybierz metale do tygla, wpisz liczbę samorodków i porównaj uzyskane procenty z poprawnymi zakresami. Kalkulator robi to automatycznie i pokazuje, czy mieszanka jest dokładna, bliska czy niepoprawna.",
      },
      {
        question: "Jakie stopy obsługuje ten kalkulator?",
        answer:
          "Obsługuje pełną listę stopów z tygla w grze, w tym brąz, brąz bizmutowy, czarny brąz, mosiądz, molibdochalkos, lut ołowiowy, lut srebrny, cupronikiel i elektrum.",
      },
    ],
  },
  pt: {
    title: "Calculadora de ligas Vintage Story | proporções bronze",
    description:
      "Planeje misturas de cadinho Vintage Story com quantidade exata de pepitas, rendimento de lingotes e proporções válidas para bronze, bismuto e mais.",
    keywords:
      "calculadora de ligas Vintage Story, bronze, bronze de bismuto, bronze negro, calculadora de lingotes, pepitas, cadinho",
    localeCode: "pt_BR",
    schemaDescription:
      "Planeje ligas válidas de Vintage Story com quantidade exata de pepitas, rendimento de lingotes e proporções adequadas para o cadinho.",
    featureList: [
      "Calculadora de proporções de ligas para Vintage Story",
      "Planejamento exato de pepitas e lingotes",
      "Validação de misturas de cadinho",
      "Bronze, bronze de bismuto, bronze negro, latão, soldas e mais",
    ],
    heroEyebrow: "Planejamento de cadinho para Vintage Story",
    heroTitle: "Calculadora de ligas Vintage Story",
    heroDescription:
      "Calcule proporções válidas, quantidade exata de pepitas e rendimento de lingotes antes da fundição. A ferramenta ajuda a planejar bronze, bronze de bismuto, bronze negro, latão, soldas, electrum e outras ligas de Vintage Story.",
    supportedAlloysHeading: "Ligas suportadas",
    supportedAlloysBody:
      "A calculadora cobre toda a lista de ligas do jogo e destaca as receitas mais procuradas: bronze, bronze de bismuto, bronze negro, latão, electrum, cuproníquel e soldas.",
    supportedAlloyIds: [...COMMON_SUPPORTED_ALLOYS],
    howItWorksHeading: "Como funciona",
    howItWorksBody:
      "Adicione metais aos quatro slots do cadinho, ajuste a quantidade de pepitas e a ferramenta verifica imediatamente se a composição corresponde a uma liga válida. Ela também mostra unidades totais, limites de fundição e sugestões de ajuste.",
    planningHeading: "Por que usar",
    planningBody:
      "Em Vintage Story, é fácil errar cálculos quando você mistura lingotes parciais, metais raros e faixas percentuais. Esta página serve para planejar rápido, otimizar rendimento e evitar desperdício de recursos.",
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Como calcular uma liga válida em Vintage Story?",
        answer:
          "Escolha os metais do cadinho, informe a quantidade de pepitas e compare os percentuais obtidos com as faixas válidas. A calculadora faz isso automaticamente e mostra se a mistura está exata, próxima ou inválida.",
      },
      {
        question: "Quais ligas esta calculadora suporta?",
        answer:
          "Ela suporta toda a lista de ligas do cadinho do jogo, incluindo bronze, bronze de bismuto, bronze negro, latão, molybdochalkos, solda de chumbo, solda de prata, cuproníquel e electrum.",
      },
    ],
  },
};

export function getCanonicalUrl(locale: Locale): string {
  return new URL(getLocalePath(locale), `${SITE_URL}/`).toString();
}

function isAboutPath(pathname: string): boolean {
  return getCanonicalAppPath(pathname) === OVERVIEW_ROUTE_PATH;
}

function isReferencePath(pathname: string): boolean {
  return getCanonicalAppPath(pathname) === REFERENCE_ROUTE_PATH;
}

function isPotteryCalculatorPath(pathname: string): boolean {
  return getCanonicalAppPath(pathname) === POTTERY_VIEW_PATHS["pottery-calculator"];
}

function isPotteryPlannerPath(pathname: string): boolean {
  return getCanonicalAppPath(pathname) === POTTERY_VIEW_PATHS["pottery-planner"];
}

function isPotteryPath(pathname: string): boolean {
  return isPotteryCalculatorPath(pathname) || isPotteryPlannerPath(pathname);
}

function getPageTitle(locale: Locale, title: string, pathname: string): string {
  if (pathname === LEATHER_ROUTE_PATH) {
    return `${LEATHER_ROUTE_TITLE} | Hide, Tannin & Pelt Planner`;
  }

  if (isPotteryCalculatorPath(pathname)) {
    if (locale === "en") {
      return "Vintage Story Pottery Calculator | Clay Forming Costs";
    }
    return `${seoT(locale, "pottery.calculator.title")} | Vintage Story ${seoT(locale, "header.domain.pottery")}`;
  }

  if (isPotteryPlannerPath(pathname)) {
    if (locale === "en") {
      return "Vintage Story Pottery Planner | Clay Inventory Planning";
    }
    return `${seoT(locale, "pottery.planner.title")} | Vintage Story ${seoT(locale, "header.domain.pottery")}`;
  }

  if (isAboutPath(pathname)) {
    return `${OVERVIEW_ROUTE_TITLE} | Alloy, Leather & Pottery Tools`;
  }

  if (isReferencePath(pathname)) {
    return `${REFERENCE_ROUTE_TITLE} | Metallurgy, Pottery & Leatherwork`;
  }

  if (pathname === METALLURGY_VIEW_PATHS.planner) {
    if (locale === "en") {
      return "Vintage Story Metallurgy Planner | Alloy Planning";
    }
    return `Vintage Story ${PLANNER_ROUTE_TITLES[locale]}`;
  }

  return title;
}

function getPageDescription(locale: Locale, content: SeoContent, pathname: string): string {
  if (pathname === LEATHER_ROUTE_PATH) {
    return LEATHER_ROUTE_DESCRIPTION;
  }

  if (isPotteryCalculatorPath(pathname)) {
    if (locale === "en") {
      return "Calculate exact clay costs for Vintage Story pottery items, molds, shingles, clay ovens, and firing requirements.";
    }
    return `Vintage Story: ${seoT(locale, "pottery.calculator.description")}`;
  }

  if (isPotteryPlannerPath(pathname)) {
    if (locale === "en") {
      return "Build a Vintage Story clay forming shopping list, check general and fire clay inventory, and plan pottery batches with shortfalls and leftovers.";
    }
    return `Vintage Story: ${seoT(locale, "pottery.planner.description")}`;
  }

  if (isAboutPath(pathname)) {
    return OVERVIEW_ROUTE_DESCRIPTION;
  }

  if (isReferencePath(pathname)) {
    return REFERENCE_ROUTE_DESCRIPTION;
  }

  if (pathname === METALLURGY_VIEW_PATHS.planner) {
    return PLANNER_ROUTE_DESCRIPTION_SUFFIXES[locale];
  }

  return content.description;
}

function getPageKeywords(content: SeoContent, pathname: string): string {
  if (pathname === LEATHER_ROUTE_PATH) {
    return LEATHER_ROUTE_KEYWORDS;
  }

  if (isPotteryCalculatorPath(pathname)) {
    return POTTERY_CALCULATOR_ROUTE_KEYWORDS;
  }

  if (isPotteryPlannerPath(pathname)) {
    return POTTERY_PLANNER_ROUTE_KEYWORDS;
  }

  if (isAboutPath(pathname)) {
    return OVERVIEW_ROUTE_KEYWORDS;
  }

  if (isReferencePath(pathname)) {
    return [
      ...GENERAL_TOOL_KEYWORDS,
      "Vintage Story reference",
      "Vintage Story alloy reference",
      "Vintage Story leather reference",
      "Vintage Story pottery reference",
      "Vintage Story recipes",
    ].join(", ");
  }

  if (pathname === METALLURGY_VIEW_PATHS.calculator || pathname === METALLURGY_VIEW_PATHS.planner) {
    return [...GENERAL_TOOL_KEYWORDS, ALLOY_ROUTE_KEYWORDS].join(", ");
  }

  return content.keywords;
}

function getSchemaAlternateNames(pathname: string): string[] {
  if (isAboutPath(pathname)) {
    return [
      "Vintage Story tool",
      "Vintage Story calculator",
      "Vintage Story alloy calculator",
      "Vintage Story leather calculator",
      "Vintage Story pottery calculator",
    ];
  }

  if (pathname === METALLURGY_VIEW_PATHS.calculator || pathname === METALLURGY_VIEW_PATHS.planner) {
    return [
      "Vintage Story alloy calculator",
      "Vintage Story metallurgy calculator",
      "Vintage Story bronze calculator",
      "Vintage Story crucible calculator",
    ];
  }

  if (pathname === LEATHER_ROUTE_PATH) {
    return [
      "Vintage Story leather calculator",
      "Vintage Story leather planner",
      "Vintage Story hide calculator",
      "Vintage Story tanning calculator",
    ];
  }

  if (isPotteryPath(pathname)) {
    return [
      "Vintage Story pottery calculator",
      "Vintage Story clay calculator",
      "Vintage Story clay forming calculator",
      "Vintage Story pottery planner",
    ];
  }

  return [SITE_NAME];
}

function getRouteFeatureList(content: SeoContent, pathname: string): string[] {
  if (pathname === LEATHER_ROUTE_PATH) {
    return LEATHER_FEATURE_LIST;
  }

  if (isPotteryPath(pathname)) {
    return POTTERY_FEATURE_LIST;
  }

  if (isReferencePath(pathname)) {
    return REFERENCE_FEATURE_LIST;
  }

  if (isAboutPath(pathname)) {
    return OVERVIEW_FEATURE_LIST;
  }

  return content.featureList;
}

function getRouteFaqItems(locale: Locale, content: SeoContent, pathname: string): SeoFaqItem[] {
  if (isPotteryCalculatorPath(pathname)) {
    return locale === "en" ? POTTERY_CALCULATOR_FAQ_ITEMS : [];
  }

  if (isPotteryPlannerPath(pathname)) {
    return locale === "en" ? POTTERY_PLANNER_FAQ_ITEMS : [];
  }

  if (isAboutPath(pathname)) {
    return OVERVIEW_FAQ_ITEMS;
  }

  return content.faqItems;
}

function shouldIncludeFaqSchema(pathname: string): boolean {
  return isAboutPath(pathname) || isPotteryPath(pathname);
}

export function getCanonicalUrlForPath(locale: Locale, pathname: string = "/"): string {
  const canonicalPath = getCanonicalAppPath(pathname);
  return new URL(getLocalePath(locale, canonicalPath), `${SITE_URL}/`).toString();
}

export function getAlternateLinks(pathname: string = "/") {
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      hrefLang: locale,
      href: getCanonicalUrlForPath(locale, pathname),
    })),
    {
      hrefLang: "x-default",
      href: getCanonicalUrlForPath(DEFAULT_LOCALE, pathname),
    },
  ];
}

export function getSeoContent(locale: Locale, pathname: string = "/") {
  const content = SEO_CONTENT[locale];
  const normalizedPath = pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  const description = getPageDescription(locale, content, normalizedPath);
  const title = getPageTitle(locale, content.title, normalizedPath);
  const keywords = getPageKeywords(content, normalizedPath);
  const canonicalUrl = getCanonicalUrlForPath(locale, normalizedPath);
  const featureList = getRouteFeatureList(content, normalizedPath);
  const faqItems = getRouteFaqItems(locale, content, normalizedPath);

  const schema: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      alternateName: getSchemaAlternateNames(normalizedPath),
      url: canonicalUrl,
      description: description,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      inLanguage: locale,
      image: SITE_IMAGE_URL,
      keywords,
      mainEntityOfPage: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: featureList,
    },
  ];

  if (faqItems.length > 0 && shouldIncludeFaqSchema(normalizedPath)) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return {
    ...content,
    title,
    description,
    keywords,
    siteName: SITE_NAME,
    socialImageUrl: SITE_IMAGE_URL,
    canonicalUrl,
    alternates: getAlternateLinks(normalizedPath),
    faqItems,
    schema: JSON.stringify(schema, null, 2),
  };
}

function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFaqList(items: SeoFaqItem[]): string {
  return items
    .map(
      (item) =>
        `        <div class="seo-prerender__faq-item">\n          <h3>${escapeHtml(item.question)}</h3>\n          <p>${escapeHtml(item.answer)}</p>\n        </div>`,
    )
    .join("\n");
}

function getPotteryPrerenderedSeoBody(locale: Locale, pathname: string, title: string, description: string): string | null {
  if (isPotteryCalculatorPath(pathname)) {
    if (locale === "en") {
      return [
        '    <main class="seo-prerender" data-seo-prerender>',
        `      <h1>${escapeHtml(title)}</h1>`,
        `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
        "      <section>",
        "        <h2>Clay forming recipe coverage</h2>",
        "        <p>Use the calculator to total Vintage Story clay costs for pottery items, storage vessels, shingles, cooking vessels, crucibles, and clay molds before committing inventory.</p>",
        "      </section>",
        "      <section>",
        "        <h2>Fire clay and kiln planning</h2>",
        "        <p>The pottery calculator separates fire-clay-only demand from general clay demand, calls out the 69 fire clay clay oven, and keeps kiln firing requirements visible for formed items.</p>",
        "      </section>",
        "      <section>",
        "        <h2>FAQ</h2>",
        renderFaqList(POTTERY_CALCULATOR_FAQ_ITEMS),
        "      </section>",
        "    </main>",
      ].join("\n");
    }

    return [
      '    <main class="seo-prerender" data-seo-prerender>',
      `      <h1>${escapeHtml(title)}</h1>`,
      `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
      "      <section>",
      `        <h2>${escapeHtml(seoT(locale, "pottery.reference.title"))}</h2>`,
      `        <p>${escapeHtml(seoT(locale, "pottery.reference.description"))}</p>`,
      "      </section>",
      "      <section>",
      `        <h2>${escapeHtml(seoT(locale, "pottery.inventory.title"))}</h2>`,
      `        <p>${escapeHtml(seoT(locale, "pottery.inventory.fire_clay_note"))}</p>`,
      "      </section>",
      "    </main>",
    ].join("\n");
  }

  if (isPotteryPlannerPath(pathname)) {
    if (locale === "en") {
      return [
        '    <main class="seo-prerender" data-seo-prerender>',
        `      <h1>${escapeHtml(title)}</h1>`,
        `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
        "      <section>",
        "        <h2>Clay inventory planning</h2>",
        "        <p>Build a pottery batch from selected recipes, compare the totals against general clay and fire clay on hand, and review remaining inventory or missing clay before crafting.</p>",
        "      </section>",
        "      <section>",
        "        <h2>Batch and mold planning</h2>",
        "        <p>The planner supports pottery items and clay molds together, including shingles as 4 clay for 12 output items, so larger building and tool-prep sessions can be planned from one list.</p>",
        "      </section>",
        "      <section>",
        "        <h2>FAQ</h2>",
        renderFaqList(POTTERY_PLANNER_FAQ_ITEMS),
        "      </section>",
        "    </main>",
      ].join("\n");
    }

    return [
      '    <main class="seo-prerender" data-seo-prerender>',
      `      <h1>${escapeHtml(title)}</h1>`,
      `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
      "      <section>",
      `        <h2>${escapeHtml(seoT(locale, "pottery.inventory.title"))}</h2>`,
      `        <p>${escapeHtml(seoT(locale, "pottery.inventory.description"))}</p>`,
      "      </section>",
      "      <section>",
      `        <h2>${escapeHtml(seoT(locale, "pottery.plan.title"))}</h2>`,
      `        <p>${escapeHtml(seoT(locale, "pottery.planner.description"))}</p>`,
      "      </section>",
      "    </main>",
    ].join("\n");
  }

  return null;
}

function getOverviewPrerenderedSeoBody(): string {
  return [
    '    <main class="seo-prerender" data-seo-prerender>',
    `      <h1>${escapeHtml(`${OVERVIEW_ROUTE_TITLE} | Alloy, Leather & Pottery Tools`)}</h1>`,
    `      <p class="seo-prerender__lead">${escapeHtml(OVERVIEW_ROUTE_DESCRIPTION)}</p>`,
    "      <section>",
    "        <h2>Vintage Story toolset</h2>",
    "        <p>This Vintage Story tool collection combines the Vintage Story alloy calculator, Vintage Story leather calculator, Vintage Story pottery calculator, shared production planners, and reference data in one searchable site.</p>",
    "      </section>",
    "      <section>",
    "        <h2>Available calculators</h2>",
    "        <p>Use the metallurgy calculator for alloy and crucible ratios, the leather calculator for hides, tannin, barrels, and pelts, and the pottery calculator for clay forming costs, molds, shingles, and clay ovens.</p>",
    "      </section>",
    "      <section>",
    "        <h2>FAQ</h2>",
    renderFaqList(OVERVIEW_FAQ_ITEMS),
    "      </section>",
    "    </main>",
  ].join("\n");
}

function getToolPrerenderedSeoBody(pathname: string, title: string, description: string): string | null {
  if (pathname === METALLURGY_VIEW_PATHS.calculator || pathname === METALLURGY_VIEW_PATHS.planner) {
    return [
      '    <main class="seo-prerender" data-seo-prerender>',
      `      <h1>${escapeHtml(title)}</h1>`,
      `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
      "      <section>",
      "        <h2>Vintage Story alloy calculator</h2>",
      "        <p>Calculate Vintage Story alloy ratios for tin bronze, bismuth bronze, black bronze, brass, solder, electrum, cupronickel, and other crucible recipes with exact nuggets and ingot yield.</p>",
      "      </section>",
      "    </main>",
    ].join("\n");
  }

  if (pathname === LEATHER_ROUTE_PATH) {
    return [
      '    <main class="seo-prerender" data-seo-prerender>',
      `      <h1>${escapeHtml(title)}</h1>`,
      `      <p class="seo-prerender__lead">${escapeHtml(description)}</p>`,
      "      <section>",
      "        <h2>Vintage Story leather calculator</h2>",
      "        <p>Calculate hide tanning, pelt curing, tannin, barrel, water, lime, borax, and fat requirements for Vintage Story leatherworking workflows.</p>",
      "      </section>",
      "    </main>",
    ].join("\n");
  }

  return null;
}

export function getPrerenderedSeoBody(locale: Locale, pathname: string = "/"): string {
  const content = SEO_CONTENT[locale];
  const normalizedPath = pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  const title = getPageTitle(locale, content.title, normalizedPath);
  const description = getPageDescription(locale, content, normalizedPath);
  const potteryBody = getPotteryPrerenderedSeoBody(locale, normalizedPath, title, description);
  const toolBody = getToolPrerenderedSeoBody(normalizedPath, title, description);

  if (potteryBody) {
    return potteryBody;
  }

  if (toolBody) {
    return toolBody;
  }

  if (!isAboutPath(normalizedPath)) {
    return [
      '    <main class="seo-prerender" data-seo-prerender>',
      `      <h1>${escapeHtml(title)}</h1>`,
      `      <p>${escapeHtml(description)}</p>`,
      "    </main>",
    ].join("\n");
  }

  return getOverviewPrerenderedSeoBody();
}

export function localizeHtmlDocument(html: string, locale: Locale, pathname: string = "/"): string {
  const seo = getSeoContent(locale, pathname);
  const alternatesMarkup = seo.alternates
    .map(
      (alternate) =>
        `  <link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.href}" />`,
    )
    .join("\n");
  const prerenderedBody = getPrerenderedSeoBody(locale, pathname);

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
    /<meta property="og:site_name" content="[^"]*" \/>/,
    `  <meta property="og:site_name" content="${seo.siteName}" />`,
  );
  localized = replaceTag(
    localized,
    /<meta property="og:image" content="[^"]*" \/>/,
    `  <meta property="og:image" content="${seo.socialImageUrl}" />`,
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
    /<meta property="twitter:image" content="[^"]*" \/>/,
    `  <meta property="twitter:image" content="${seo.socialImageUrl}" />`,
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
  localized = replaceTag(
    localized,
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">\n${prerenderedBody}\n  </div>`,
  );

  return localized;
}
