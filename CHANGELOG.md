# Changelog

All notable changes to the Vintage Story Alloy Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
