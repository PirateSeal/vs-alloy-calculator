# Changelog

All notable changes to the Vintage Story Alloy Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.11.1] - 2026-04-19

### Changed
- **Tier 1 metallurgy refactor** — Consolidated shared crucible allocation helpers, canonicalized metallurgy amount types, extracted shared solver/constants values, and removed dead alloy helper exports to reduce duplication across the maximize, economical, and planner paths.
- **Leatherwork helper consolidation** — Centralized hide/material asset-path builders and replaced the inline pelt-fat switch with a data-driven size map so the leather UI uses one source of truth.
- **Agent documentation refreshed** — Updated the internal agent codebase and UI status docs to reflect the leatherwork surface, new shared metallurgy modules, and the current tiered refactor roadmap.

### Removed
- **Unused shadcn CLI dependency** — Dropped the unused `shadcn` dev dependency and refreshed the lockfile.
- **Stale Kiro project specs** — Removed obsolete `.kiro/` MCP/settings/spec files that no longer match the current codebase.

## [1.11.0] - 2026-04-19

### Added
- **Leatherwork domain** — Added a full leatherworking planner under `/leather/` with URL-backed Zustand state, tanning and pelt-curing workflows, shopping lists, pipeline timing, bear-hide support, and organized hide/material/tool assets under `public/leather/`.
- **Shared overview and reference pages** — Added an app-level `Overview` landing page at `/` plus a shared `/reference/` page with metallurgy and leatherwork tabs, including a dedicated leather reference surface for hide sizes, tannin rules, solvents, workflow timing, pelts, and bear-specific behavior.
- **Shared app-shell routing helpers** — Added app-level route parsing/canonicalization helpers for overview, reference, metallurgy, leatherwork, localized routes, and legacy alias handling.
- **New shadcn primitives** — Added `collapsible`, `scroll-area`, and `tabs` primitives to support the domain-aware sidebar and shared reference UI.

### Changed
- **App architecture generalized beyond metallurgy** — Promoted the app shell into a true multi-domain surface. `Overview` and `Reference` are now app-owned pages, while metallurgy is reduced to tool views only (`calculator`, `planner`).
- **Public route model reorganized** — Root `/` now serves the shared overview, metallurgy tools live under `/metallurgy/` and `/metallurgy/planner/`, leatherwork remains under `/leather/`, and legacy `/about/`, `/metallurgy/about/`, and `/metallurgy/reference/` now resolve as aliases that canonicalize to the shared routes.
- **Navigation model reworked** — Sidebar domain controls now separate `Metallurgy` and `Leatherwork` from globally pinned `Overview` and `Reference`, with mobile navigation kept in sync and the shell remaining mounted across domain switches for smoother transitions.
- **SEO and static output updated** — Route-aware metadata, canonical URLs, hreflang alternates, JSON-LD output, sitemap generation, and localized static HTML entries now follow the shared app route manifest instead of metallurgy-only route ownership.
- **Leather UI refined** — Reworked the leather planner into a more visual workflow-oriented surface, improved summary cards and shopping lists, cleaned up the leather reference layout, and aligned enter animations and shell transitions with the rest of the app.
- **Project dependency surface updated** — Added the Radix dependencies needed for the new shadcn primitives and refreshed the lockfile accordingly.

### Fixed
- **Locale/history synchronization** — The i18n provider now reacts to `popstate`, so browser back/forward across locale-prefixed URLs keeps the active translations aligned with the pathname.
- **Cross-domain shell remounting** — Switching between metallurgy and leatherwork no longer tears down and rebuilds the whole app chrome, which removes the “full reload” feel during domain changes.
- **Metallurgy route/store synchronization** — Calculator/planner switching and direct planner URLs now hydrate the metallurgy store correctly in both directions after the shared app-shell refactor.
- **Leather reference clarity** — Removed the redundant small-animal mapping card and promoted hide sizing into a full-width primary reference section.

### Tests
- **Cross-domain route coverage expanded** — Added app-level routing tests for shared pages, canonical aliases, reference hash tab selection, and locale-preserving navigation.
- **Feature-store and deep-link regression coverage** — Updated metallurgy, app integration, and SEO tests for the shared route ownership model and leather/metallurgy deep-link behavior.

## [1.10.2] - 2026-04-19

### Changed
- **FAQ schema scoped to About page** — JSON-LD `FAQPage` structured data now only emits on `/about/`, where the FAQ content actually lives. Other routes keep the `WebApplication` schema only, avoiding misleading FAQ markup on pages that do not render the FAQ.

### Tests
- **Test coverage raised from 56% to 96%** — Added comprehensive unit tests for `alloyLogic` (aggregation, evaluation, presets, ratio-lock adjustment, max-ingot calculation, nugget adjustments), `i18n/provider` (locale detection, persistence, fallback, var substitution), `i18n/head` (DOM SEO mutation), `analytics`, `card` UI primitives, and additional edge cases for routing, planner, and `appStateRouting`. Function coverage now 100%.

## [1.10.1] - 2026-04-19

### Fixed
- **Hreflang parity with build output** — Root `index.html` now declares hreflang entries for all ten supported locales (en, fr, de, es, ru, zh, ja, ko, pl, pt) plus `x-default`, matching what the build-time localized HTML plugin already emits. Removes confusing source/build divergence.
- **Static body content for crawlers** — Added a `<noscript>` block with a short Vintage Story alloy calculator description before the React root so low-authority crawlers see meaningful content without executing JavaScript. Helps Google Search Console indexing.

## [1.10.0] - 2026-04-19

### Added
- **Metallurgy planner** - Added a new planner workflow that starts from aggregate metal inventory, surfaces currently craftable alloys, compares scarcity strategies, and expands into per-recipe crucible run plans with calculator deep-links.
- **Domain-ready navigation model** - Refactored the app shell and routing around `Metallurgy` tools so `Calculator`, `Planner`, `Reference`, and `About` can coexist cleanly now without blocking a later `Leatherwork` expansion.
- **Planner URL state and test coverage** - Added dedicated planner routing/state handling plus tests for route restoration, inventory planning logic, scarcity ranking, and multi-run execution constraints.

### Changed
- **Planner simplified around discovery** - Removed the separate top-level `Plan a specific alloy` mode and folded recipe drill-down into the discovery results, while keeping the scarcity-method selector available in the main planner flow.
- **Planner copy localized across all supported languages** - Completed the new planner and metallurgy-navigation translations for French, German, Spanish, Russian, Chinese, Japanese, Korean, Polish, and Portuguese.
- **Planner SEO coverage completed** - Added dedicated planner static HTML output, localized planner route metadata, and sitemap generation so `/planner/` and its localized variants are discoverable by search engines.
- **i18n loading made nested-key safe** - Updated the translation provider to flatten nested locale objects at load time so new structured planner/header locale sections continue to work with the existing dot-key `t()` lookups.

### Fixed
- **Planner hero surface** - Removed the bottom strip artifact on the planner hero card so the background treatment fills the full rounded surface cleanly.
- **Breakpoint guidance wording** - Planner breakpoints no longer show `0` as the `next valid breakpoint` when no higher craftable target exists; the UI now reports that state explicitly.

## [1.9.2] - 2026-04-18

### Changed
- **Favicon setup improved** — Added a dedicated SVG favicon with PNG fallback and Apple touch icon support, then refined the icon artwork to keep the previous ingot-plus-metals concept while making browser/favicon rendering more intentional.

## [1.9.1] - 2026-04-18

### Changed
- **Sitemap expanded again** — Added localized `/reference/` URLs to the sitemap so Google and Bing can discover the searchable alloy reference pages alongside the homepage and dedicated About pages.

## [1.9.0] - 2026-04-18

### Added
- **Dedicated About page** — Added a route-backed `About` page in the SPA so longer-form guide, FAQ, and trust-building content live on their own screen without getting in the way of the calculator-first experience.
- **Route-aware static entries** — The production build now emits localized HTML entry points for `/`, `/reference/`, and `/about/`, including locale-prefixed variants such as `/fr/about/`.
- **Search-focused landing content** — Introduced localized hero copy, supported-alloys summaries, workflow explanations, and FAQ content designed around Vintage Story alloy calculator search intent.

### Changed
- **SEO metadata expanded** — Titles, descriptions, canonical URLs, hreflang alternates, Open Graph, and Twitter metadata now adapt to the current SPA route instead of treating the entire app as a single page.
- **Structured data improved** — Added FAQPage JSON-LD alongside the existing WebApplication schema and kept both synchronized with the localized SEO content source.
- **Sitemap upgraded** — Refreshed the sitemap dates and added alternate-language annotations plus dedicated `/about/` URLs to improve crawler discovery.
- **Repository positioning clarified** — Updated the README lead copy to better describe the app as a Vintage Story alloy ratio, nugget-count, and crucible-planning tool.

## [1.8.0] - 2026-04-18

### Added
- **Mockup-aligned calculator shell** — Rebuilt the main workspace around a collapsible left navigation rail, a dedicated calculator workspace, and a right-side Current Product/result rail while preserving the existing alloy logic, shareable URL state, and i18n behavior.
- **UI motion system** — Added reduced-motion-safe entrance animations for the navigation shell, calculator panels, result rail, translation notices, and reference rows so surfaces settle in instead of appearing abruptly.
- **Agent documentation** — Added `agent.md` plus `docs/agent/*` to document the codebase structure, current redesign direction, and plan implementation status for future contributors.

### Changed
- **Calculator workflow refined** — Extracted preset controls into a dedicated control bar, restored direct nugget number entry alongside sliders and quick-step buttons, and tightened desktop spacing so the main calculator path is denser and faster to use.
- **Result rail polished** — Empty crucible state now uses a shorter, subdued crucible hero; valid results keep the full Current Product treatment; sweet-spot guidance collapses by default for already-valid alloys to reduce unnecessary scroll.
- **Reference experience redesigned** — The reference tab now lives inside the same visual system as the calculator, with searchable/filterable card rows, stronger composition presentation, and smoother transitions between states.
- **Navigation hierarchy clarified** — Utility actions and outbound links in the left rail were demoted visually so `Calculator` and `Reference` remain the dominant navigation targets.
- **Theme and surface language updated** — Applied the forge/copper `alchemist_s_crucible` palette across the shell, inputs, cards, and overlays while keeping Nunito as the primary UI typeface.

### Fixed
- **Desktop calculator gap** — Removed the large empty gap that appeared between the preset controls and crucible inputs in the desktop layout.
- **State-change animation replay** — `Clear all`, empty-to-filled transitions, and preset loading now retrigger card/slot entrance motion instead of only animating on the first page mount.
- **Empty-state density** — The right rail no longer consumes full result-card height when no alloy is present, reducing dead space while keeping the crucible artwork visible.

## [1.7.2] - 2026-04-17

### Security
- **Vite upgraded 8.0.3 → 8.0.8** — Patches three advisories affecting the dev server only (not the production bundle): path traversal in optimized-deps `.map` handling (GHSA-4w7w-66w2-5vf9, CVE-2026-39365), `server.fs.deny` bypass via query parameters (GHSA-v2wj-q39q-566r, CVE-2026-39364, high), and arbitrary file read via Vite dev-server WebSocket (high). All require `--host` / `server.host` exposure, which this project does not use, but upgraded as a hardening measure.
- **hono / @hono/node-server pinned via pnpm overrides** — Transitive dependency under `shadcn` (dev-only CLI, never bundled). Forced to `hono@^4.12.14` and `@hono/node-server@^1.19.14` to clear seven moderate advisories: `setCookie` cookie-name validation, NBSP-prefix cookie-name bypass in `getCookie`, IPv4-mapped IPv6 handling in `ipRestriction`, `toSSG` path traversal, `serveStatic` repeated-slash middleware bypass (hono + @hono/node-server), and hono/jsx HTML injection via attribute names.
- **`pnpm audit` now reports 0 vulnerabilities** (was 2 high, 8 moderate).

### Reviewed — no action needed
- All user input validated against whitelist sets (`VALID_METAL_IDS`, `VALID_RECIPE_IDS`) before use; URL-param parsing in `App.tsx` rejects unknown metal/recipe IDs, non-numeric nugget counts, and out-of-range values.
- No `dangerouslySetInnerHTML`, `eval`, `document.write`, or `new Function` usage anywhere in `src/`.
- All 17 `target="_blank"` external links carry `rel="noopener noreferrer"`.
- No hardcoded API keys, tokens, or passwords in source.

## [1.7.1] - 2026-04-06

### Fixed
- **Umami locale tracking** — All analytics events now carry a `locale` property reflecting the active language. The locale is resolved at startup (URL path → localStorage → browser language) and updated whenever the user switches language, so events are always attributed to the correct locale.

## [1.7.0] - 2026-04-06

### Added
- **Internationalisation (10 locales)** — Full i18n system with locale detection (URL path → localStorage → browser language), URL-preserving locale switching, and per-locale SEO (canonical, hreflang alternates, Open Graph, JSON-LD). Supported languages: English, Français, Deutsch, Español, Русский, 中文, 日本語, 한국어, Polski, Português (Brasil).
- **Translation notice banner** — Dismissible amber banner automatically shown for machine-translated locales (DE, ES, RU, ZH, JA, KO, PL, PT) with a bilingual message so users know the translation may contain errors.
- **Locale-specific static HTML** — Vite build plugin generates `/dist/{locale}/index.html` for each non-default locale with localised meta tags for SEO.
- **CompositionCard collapsible on mobile** — A chevron toggle button (visible on small screens only) lets users collapse the composition panel to free up vertical space.
- **44 px minimum touch targets on sliders** — Both the crucible-slot and ingot-amount sliders now meet the WCAG 2.5.8 minimum target size on mobile.

### Changed
- **Data layer decoupled from English strings** — `Metal.label`, `Metal.shortLabel`, `AlloyRecipe.name`, and `AlloyRecipe.notes` removed from the TypeScript types and static data; all display strings are now resolved through the i18n system (`getMetalLabel()`, `getMetalShortLabel()`, `getRecipeName()`, `getRecipeNotes()`).
- **MobileWarning removed** — Replaced by the fully responsive layout introduced in v1.6.x; the standalone warning component is no longer needed.
- **Sitemap expanded** — Added URL entries for all 10 locale paths.
- **Translation accuracy** — French and German alloy names corrected to match Vintage Story wiki (FR: Cuproplomb, Bronze-étain, Bronze-bismuth; DE: Bismutbronze, Kupferblei, Kupfernickel).

### Fixed
- **"1 nuggets" plural bug** — Slot row now correctly shows "1 nugget" vs "2 nuggets" by passing pre-resolved singular/plural labels via interpolation variables.
- **Duplicate `className` prop on Slider** — Two `className` attributes were merged into one on both crucible-slot and ingot-amount sliders (was a TypeScript error).
- **Stale `name` field in test fixtures** — Inline `AlloyRecipe` objects in strategy and validator tests retained a `name` property after it was removed from the type; all occurrences removed.

## [1.6.4] - 2026-04-04

### Changed
- **Umami proxy removed** — Reverted the CloudFront proxy approach for Umami analytics. The script now loads directly from `https://cloud.umami.is/script.js` and events post to `api-gateway.umami.dev` as originally designed. CSP updated to explicitly allow both hosts.

## [1.6.3] - 2026-04-04

### Fixed
- **Umami proxy not intercepting events** — The Umami cloud script (`cloud.umami.is/script.js`) hardcodes `api-gateway.umami.dev` as its event endpoint regardless of where it is loaded from, so the CloudFront proxy at `/api/*` was bypassed entirely. Re-added `data-host-url="https://vs-calculator.tcousin.com"` to the script tag so the tracker POSTs to the same-origin `/api/send`, which CloudFront then proxies to `api-gateway.umami.dev`. This eliminates the CSP `connect-src 'self'` violation introduced in v1.6.1.

## [1.6.2] - 2026-04-04

### Fixed
- **Umami event ingestion proxy** — The `/api/*` CloudFront behavior was proxying to `cloud.umami.is`, but Umami's tracker script sends events to `api-gateway.umami.dev`. Added `api-gateway.umami.dev` as a separate CloudFront origin and pointed the `/api/*` behavior at it. Fixes the CSP `connect-src 'self'` violation that blocked analytics events from reaching Umami.

## [1.6.1] - 2026-04-04

### Fixed
- **Umami proxy url field** — Removed `data-host-url` from the script tag; the tracker now derives the endpoint from the script's own `src` origin (`/umami/script.js` → `vs-calculator.tcousin.com`) so the `url` payload field is sent as a path (`/`) instead of a full URL (`https://vs-calculator.tcousin.com/`). This fixes sessions not appearing in Umami's realtime view.
- **Test lint** — Replaced an invalid `@typescript-eslint/no-throw-literal` eslint-disable comment (rule was renamed) with a plain object throw, clearing the ESLint error.

### Changed
- **CI actions updated** — All GitHub Actions bumped to latest major versions: `checkout@v6`, `setup-node@v6`, `pnpm/action-setup@v5`, `upload-artifact@v7`, `download-artifact@v8`, `configure-aws-credentials@v6`, `softprops/action-gh-release@v2`.

### Tests
- **Optimizer and validator coverage** — Added property-based and unit tests for `recipeOptimizer`, `economicalStrategy`, and `recipeValidator`; updated lockfile to match.

## [1.6.0] - 2026-04-04

### Added
- **Custom event tracking** — Umami `track()` calls added throughout the app via a new `src/lib/analytics.ts` wrapper. Tracked events: `metal-selected`, `slot-cleared`, `preset-loaded`, `optimize-clicked` (maximize & economical), `adjust-clicked`, `tab-switched`, `external-link`, `theme-toggled`, `reference-searched` (1 s debounce), `mobile-warning-dismissed`. All calls are optional-chained so the app works normally when Umami is blocked.
- **CloudFront proxy for Umami** — Analytics traffic now routes through the existing CloudFront distribution (`/umami/*` → `cloud.umami.is/script.js`, `/api/*` → `api-gateway.umami.dev/api/send`) via a CloudFront Function that strips the path prefix. Defeats hostname-based ad blockers without a separate subdomain or certificate.

### Changed
- **Umami script src** — Changed from `https://cloud.umami.is/script.js` to `/umami/script.js` (same-origin via proxy). Added `data-host-url` so events POST to `/api/send` on the same domain.

### Security
- **CSP simplified** — Removed `https://cloud.umami.is` and `https://api-gateway.umami.dev` from `script-src` and `connect-src`; all Umami traffic is now same-origin so `'self'` covers it.

## [1.5.3] - 2026-03-30

### Fixed
- **CSP updated** — The CloudFront response headers policy now allows `https://cloud.umami.is` for the analytics script and `https://api-gateway.umami.dev` for Umami's event ingestion requests.

## [1.5.2] - 2026-03-30

### Added
- **Umami analytics** — Privacy-friendly, cookieless page-view analytics via Umami Cloud. No cookies, no personal data, no IP storage. GDPR/CCPA/ePrivacy compliant without a consent banner.
- **Privacy dialog** — "Privacy" link in the footer opens a modal explaining the analytics approach, localStorage usage, and compliance status.
- **Version display** — App version (`vX.Y.Z`) shown in the footer, injected at build time from `package.json` so it stays in sync automatically.

### Security
- **CSP updated** — `script-src` and `connect-src` directives in the CloudFront response headers policy now allow `https://cloud.umami.is` for the analytics script and its beacon endpoint.

## [1.5.1] - 2026-03-30

### Added
- **LICENSE file** — MIT license added to the project root (README already claimed MIT but the file was missing).
- **Credits footer** — Thin footer at the bottom of the app attributing Vintage Story game assets & data to Anego Studios, with links to Credits, MIT License, and GitHub.
- **Credits dialog** — "Credits" link in the footer opens a modal listing all third-party attributions: game assets (Anego Studios), alloy data (Vintage Story Wiki), fonts (Nunito & JetBrains Mono — SIL OFL 1.1), and open-source libraries (React, Radix UI, shadcn/ui, Tailwind CSS, Framer Motion, Lucide, CVA).

### Fixed
- **Dialog animation** — Removed `slide-in-from-left`/`slide-in-from-top` animation classes that caused the credits dialog to appear to fly in from the top-left corner; it now fades and zooms in from the center.

## [1.5.0] - 2026-03-30

### Changed
- **Vite 7 → 8 (Rolldown)** — Migrated build config from `rollupOptions`/`manualChunks` to `rolldownOptions`/`codeSplitting.groups`. The bundler is now Rolldown (Rust-based), replacing Rollup/esbuild.
- **TypeScript 5 → 6** — Removed deprecated `baseUrl` from `tsconfig.app.json`; paths already used `./`-relative entries so no resolution changes. All TS 6 defaults (`strict`, `module`, `target`) were already set explicitly.
- **ESLint 9 → 10** — Upgraded ESLint and `@eslint/js`. Already on flat config format, so no migration required. Fixed one `no-useless-assignment` violation in `alloyLogic.ts` (dead write before `return` in `calculateMaxIngots`).
- **shadcn 3 → 4 + Radix consolidation** — Ran `shadcn migrate radix`; 10 individual `@radix-ui/react-*` packages consolidated into the unified `radix-ui` package.
- **lucide-react 0.x → 1.x** — `Github` (brand icon, removed in v1) replaced with `GitFork` in the header.
- **plugin-react 5 → 6** — Drops Babel; no custom Babel config was in use so this is transparent.
- **jsdom 27 → 29** — Test environment upgrade; no test changes needed.
- Removed all `pnpm.overrides` security patches — every previously vulnerable transitive dependency is now fixed at the source by the major upgrades above.

### Security
- Resolved 9 `pnpm audit` vulnerabilities (express-rate-limit, hono, flatted, brace-expansion, picomatch, path-to-regexp) — previously patched via overrides, now resolved by dependency upgrades.

## [1.4.0] - 2026-03-04

### Added
- **Terraform remote state backend** — S3 backend with versioning and native lock file support. Bootstrap config in `terraform/bootstrap/` creates the state bucket.
- **Content-Security-Policy header** — Custom CloudFront response headers policy with full CSP, HSTS preload, and `X-Frame-Options: DENY`.
- **GitHub Actions OIDC** — Replaced long-lived IAM access keys with short-lived OIDC role credentials for CI/CD deployments.

### Changed
- **Security hardening** — Removed IAM user/access key from Terraform; credentials are now ephemeral via `sts:AssumeRoleWithWebIdentity`. Removed sensitive outputs (`iam_secret_access_key`, `iam_access_key_id`) from Terraform outputs.
- **Public repo hygiene** — AWS account ID kept out of committed files via partial backend config and gitignored tfvars. Removed `.terraform.lock.hcl` from `.gitignore` (lock files should be tracked).
- **Node.js 22 LTS** — CI workflow pinned to Node 22 LTS (was 25 current-release).
- **ResultCard refactored** — Extracted 160-line excess-material computation into `computeExcessMessage()` helper function.
- **CSS cleanup** — Removed unused sidebar variables, consolidated duplicate spinner rules, replaced global `*` transition with targeted selectors.
- **CompositionCard memoization** — Added `useMemo` for `metalMap` and `totalRarityCost` to avoid recalculation on every render.

### Fixed
- **Silver/Tin color collision** — Silver changed from `#C0C0C0` (identical to Tin) to `#D8D8D8` for visual distinction in composition bar charts.

### Security
- Resolved all 20 `pnpm audit` vulnerabilities (shadcn 3.5→3.8, vite 7.2→7.3, rollup path traversal fix).
- Upgraded typescript-eslint 8.47→8.56, vitest 4.0.10→4.0.18, tailwindcss 4.1→4.2.

## [1.3.0] - 2025-11-20

### Added
- **SEO Optimization** - Added comprehensive SEO meta tags including description, keywords, and author information to improve search engine visibility.
- **Social Media Integration** - Implemented Open Graph and Twitter Card meta tags for enhanced link previews when shared on social platforms.
- **Sitemap** - Created `sitemap.xml` to help search engines crawl and index the site more effectively.
- **Robots.txt** - Added `robots.txt` file to guide search engine crawlers and reference the sitemap.

## [1.2.0] - 2025-11-19

### Added
- **Performance Optimizations** - Implemented code splitting and lazy loading for the Reference Table, significantly reducing the initial bundle size.
- **Skeleton Loading** - Added a skeleton loading state for the Reference Table to improve perceived performance during navigation.
- **Deployment Caching** - Configured aggressive caching (1 year) for hashed assets and immediate revalidation for index.html to ensure users always get the latest updates without sacrificing performance.

### Changed
- **Build Configuration** - Optimized Vite build to split vendor libraries into separate chunks for better cacheability.

## [1.1.1] - 2025-11-19

### Changed
- **Advanced maximization algorithm** - Replaced heuristic-based optimization with a robust backtracking solver. This ensures the calculator consistently finds the absolute maximum number of ingots for any recipe, including complex edge cases with narrow percentage ranges.
- **Improved tolerance handling** - The optimizer now correctly handles the game's 0.01% tolerance, allowing for more efficient slot usage in specific scenarios (e.g., finding 23 ingots instead of 22 for certain random recipes).
- **Enhanced Alloy Reference Table** - Completely overhauled the reference table with search, sorting, and filtering capabilities. Added visual composition bars, interactive tooltips, and direct wiki links for a better user experience.

## [1.1.0] - 2025-11-18

### Added
- **Recipe optimization system** - Introduced intelligent optimization strategies for alloy recipes with two modes:
  - Economical mode: Minimizes rare metal usage while maintaining valid alloy ratios
  - Maximization mode: Calculates the absolute maximum ingots achievable for each recipe
- **Metal rarity scoring** - Added rarity cost calculation to help players make economical choices
- **Visual sweet spot zones** - Composition card now displays interactive range indicators showing whether each metal is within the valid percentage range for the selected alloy
- **Excess material detection** - Smart alerts that suggest either removing excess nuggets or adding specific amounts to reach the next complete ingot
- **Testing infrastructure** - Comprehensive test suite with Vitest, property-based testing with fast-check, and React Testing Library
- **Switch component** - New UI component for toggling economical optimization mode
- **GitHub link** - Added link to project repository in header

### Changed
- **Optimized ingot calculation algorithm** - The preset system now intelligently prefers multiples of 128, 96, 64, and 32 nuggets for more efficient crucible slot usage. This results in cleaner, more practical configurations, especially for larger batches. For example, a 24-ingot Bismuth Bronze batch now uses 256 Cu + 128 Zn + 96 Bi instead of less optimal distributions.
- **Simplified crucible controls** - Removed ratio lock feature in favor of more intuitive optimization controls
- **Enhanced composition display** - Replaced detailed tables with visual indicators and rarity cost information
- **Improved slot management** - Added individual clear buttons for each crucible slot
- **Streamlined result card** - Removed verbose adjustment tables in favor of actionable optimization buttons

### Fixed
- **Accurate maximum ingot calculation** - The preset slider now shows the true maximum achievable ingots for each alloy based on the optimized nugget distribution. For example, Bismuth Bronze now correctly shows 24 ingots maximum (up from the previous 21) because the optimized preset can fit more efficiently in 4 crucible slots.
- **Black Bronze preset calculation** - Fixed an issue where the optimized preset algorithm would fail for Black Bronze and other recipes with tight percentage constraints. The system now falls back to a simple midpoint calculation when the optimization produces invalid results, ensuring all recipes work correctly.
- **Minimal adjustment strategy** - When slightly over target ingot amounts, the system now makes minimal changes to metals that are over their maximum percentage rather than recalculating everything

## [1.0.3] - 2025-11-17

## [1.0.2] - 2025-11-17

### Changed
- Conditional deployment workflow based on file changes
- Skip unnecessary deployments when irrelevant files are changed

## [1.0.1] - 2025-11-17

### Added
- Build archive creation for tagged releases
- Single build.zip file for GitHub releases

### Changed
- Simplified release asset management

## [1.0.0] - 2025-11-17

### Added
- Initial release of the Vintage Story Alloy Calculator
- Core crucible and alloy calculation components
- Support for all Vintage Story alloy recipes
- Real-time composition analysis and validation
- Smart crucible editor with metal filtering and slot management
- Ratio lock mode for maintaining alloy proportions
- Preset system with adjustable ingot amounts
- Dynamic metal selection with constraints
- Comprehensive alloy reference table
- Mobile warning for optimal desktop experience
- AWS deployment infrastructure with Terraform
- Automated CI/CD with GitHub Actions
- AlertDialog component with Radix UI
- NumberInput component for precise numeric input
- CountUp component for animated number display
- Enhanced Select component with Radix UI icons
- ThemeToggle for dark/light mode switching
- Support for nugget images in metal selection

### Infrastructure
- S3 bucket for static website hosting with encryption and lifecycle policies
- CloudFront distribution for global content delivery
- ACM certificate for HTTPS with DNS validation
- Route53 DNS records for custom domain
- IAM user with minimal deployment permissions
- AppRegistry application for resource management
- Conditional deployment workflow based on file changes
- Build archive creation for tagged releases

### Features
- Four-slot crucible simulation (0-128 nuggets per slot)
- Live percentage calculations and visualization
- Exact match detection and close match suggestions
- Contamination warnings
- One-click composition adjustments
- Maximum ingot calculation per recipe
- Keyboard navigation support
- WCAG AA accessibility compliance
- Responsive UI with tabs and composition visualization

### Development
- Integrated Tailwind CSS and Radix UI
- Configured TypeScript path aliases (@/*)
- Added PostCSS with Tailwind and Autoprefixer
- Specified Node.js and pnpm versions for consistent environments
- Updated Button and Slider components with refined styling

## [0.1.0] - 2025-11-17

### Added
- Initial project setup
- Tailwind CSS and Radix UI integration
- Build tooling configuration (Vite, PostCSS, TypeScript)
- Path alias support for cleaner imports
