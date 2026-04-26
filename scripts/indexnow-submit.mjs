// @ts-check
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SITE_HOST = process.env.SITE_HOST ?? 'vs-calculator.tcousin.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const PREV_TAG = process.env.PREV_TAG ?? '';
const CURRENT_TAG = process.env.CURRENT_TAG ?? 'HEAD';
const DRY_RUN = process.env.DRY_RUN === '1';

if (!INDEXNOW_KEY) {
  console.error('INDEXNOW_KEY env var required');
  process.exit(1);
}

const sitemapXml = readFileSync('dist/sitemap.xml', 'utf8');
const allUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
console.log(`Sitemap: ${allUrls.length} URLs`);

let urlsToSubmit;

if (!PREV_TAG) {
  console.log('No PREV_TAG - first run, submitting all URLs');
  urlsToSubmit = allUrls;
} else {
  let changedFiles;
  try {
    changedFiles = execFileSync('git', ['diff', '--name-only', PREV_TAG, CURRENT_TAG], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    console.error('git diff failed:', /** @type {Error} */ (error).message);
    process.exit(1);
  }

  console.log(`${changedFiles.length} files changed`);
  urlsToSubmit = computeUrls(changedFiles, allUrls);
}

if (!urlsToSubmit || urlsToSubmit.length === 0) {
  console.log('No user-facing changes - skipping IndexNow');
  process.exit(0);
}

console.log(`Submitting ${urlsToSubmit.length} URL(s) to IndexNow:`);
urlsToSubmit.forEach((url) => console.log(`  ${url}`));

if (DRY_RUN) {
  console.log('[DRY_RUN] Skipping POST');
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urlsToSubmit,
  }),
});

if (res.ok) {
  console.log(`IndexNow: ${res.status}`);
} else {
  const text = await res.text().catch(() => '');
  console.error(`IndexNow error: ${res.status} ${text}`);
  process.exit(1);
}

/**
 * @param {string[]} changedFiles
 * @param {string[]} allUrls
 * @returns {string[]}
 */
function computeUrls(changedFiles, allUrls) {
  const METALLURGY = new Set(['/metallurgy/', '/metallurgy/planner/', '/reference/']);
  const POTTERY = new Set(['/pottery/', '/pottery/planner/', '/reference/']);
  const LEATHER = new Set(['/leather/', '/reference/']);
  const ALL = new Set(allUrls.map(getRouteFromUrl));

  /** @type {Set<string>} */
  const routes = new Set();
  /** @type {Set<string>} */
  const locales = new Set();
  const allLocales = new Set(allUrls.map(getLocaleFromUrl));

  /** @param {Set<string>} routeSet */
  function addRoutes(routeSet) {
    routeSet.forEach((route) => routes.add(route));
  }

  function addAllLocales() {
    allLocales.forEach((locale) => locales.add(locale));
  }

  for (const file of changedFiles) {
    const localeJsonMatch = file.match(/^src\/i18n\/([a-z]{2})\.json$/);

    if (isTestFile(file)) {
      continue;
    }

    if (file.startsWith('src/routing/') || /^src\/features\/[^/]+\/routing\//.test(file)) {
      addRoutes(ALL);
      addAllLocales();
    } else if (file.startsWith('src/features/metallurgy/')) {
      addRoutes(METALLURGY);
      addAllLocales();
    } else if (file.startsWith('src/features/pottery/')) {
      addRoutes(POTTERY);
      addAllLocales();
    } else if (file.startsWith('src/features/leatherwork/')) {
      addRoutes(LEATHER);
      addAllLocales();
    } else if (localeJsonMatch) {
      addRoutes(ALL);
      locales.add(localeJsonMatch[1]);
    } else if (/^src\/i18n\/(?:seo|head|sitemap|routing)\.ts$/.test(file)) {
      addRoutes(ALL);
      addAllLocales();
    } else if (
      file.startsWith('src/components/') ||
      file === 'src/App.tsx' ||
      file === 'index.html' ||
      file === 'package.json' ||
      file === 'vite.config.ts'
    ) {
      addRoutes(ALL);
      addAllLocales();
    }
    // terraform/**, docs/**, *.md, .github/**, scripts/**, *.test.* -> no impact
  }

  if (routes.size === 0) {
    return [];
  }

  return allUrls.filter((url) => {
    const locale = getLocaleFromUrl(url);
    const route = getRouteFromUrl(url);
    return routes.has(route) && locales.has(locale);
  });
}

/**
 * @param {string} url
 * @returns {string}
 */
function getPathnameFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url.replace(`https://${SITE_HOST}`, '');
  }
}

/**
 * @param {string} url
 * @returns {string}
 */
function getLocaleFromUrl(url) {
  const path = getPathnameFromUrl(url);
  const localeMatch = path.match(/^\/([a-z]{2})\//);
  return localeMatch ? localeMatch[1] : 'en';
}

/**
 * @param {string} url
 * @returns {string}
 */
function getRouteFromUrl(url) {
  const path = getPathnameFromUrl(url);
  const localeMatch = path.match(/^\/([a-z]{2})\//);
  const rawRoute = localeMatch ? path.slice(localeMatch[0].length - 1) : path;
  return rawRoute.endsWith('/') ? rawRoute : `${rawRoute}/`;
}

/**
 * @param {string} file
 * @returns {boolean}
 */
function isTestFile(file) {
  return /(?:^|[/.])(?:test|spec)\.[jt]sx?$/.test(file) || /\.(?:test|spec)\.[jt]sx?$/.test(file);
}
