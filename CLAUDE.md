# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (localhost:5173)
pnpm build            # TypeScript compile + Vite production build
pnpm build:prod       # Full production build: lint → type-check → build + stats
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm type-check       # TypeScript check (no emit)
pnpm test             # Run tests once (vitest --run)
pnpm test:watch       # Run tests in watch mode
```

Run a single test file:
```bash
pnpm vitest run src/lib/recipeValidator.test.ts
```

## Architecture

Single-page React 19 + TypeScript app (Vite 8, Tailwind CSS 4, Radix UI / shadcn-ui patterns). State is held in Zustand, not React props. Routing is **manual** (pathname + query), not React Router.

### Top-level layout

- `src/App.tsx` — thin shell. Owns rail collapse state + navigation callbacks. Mounts `I18nProvider`, `AppShellLayout`, `MetallurgyApp`, `PotteryApp`, and lazy `LeatherApp`.
- `src/features/metallurgy/` — alloy calculator feature (calculator, planner, reference, about).
- `src/features/pottery/` — pottery planner feature (calculator, planner).
- `src/features/leatherwork/` — leatherwork feature (hide/leather/pelt calculator), lazy-loaded.
- `src/components/` — shared shell and primitives (`ShellNavigation`, `Header`, `Footer`, `AppShellLayout`, `OverviewPage`, `SharedReferencePage`, `ui/*`).
- `src/i18n/` — locale dictionaries, routing helpers, provider, SEO helpers, sitemap.
- `src/lib/` — `utils.ts` (cn helper), `analytics.ts`, and **the test files** for metallurgy logic (tests import from the feature via the `@/` alias).
- `src/routing/routes.ts` — top-level domain route manifest. Source of truth for runtime nav, SEO, and sitemap.
- `src/types/app.ts` — `AppDomain`, `AppNavTarget`, `ReferenceTab` types. Update when adding a new domain.
- `docs/agent/` — agent-focused codebase notes. **Start with `docs/agent/README.md`.** `codebase-map.md` is the canonical structure reference.

### Metallurgy feature layout (`src/features/metallurgy/`)

| Path | Purpose |
|------|---------|
| `MetallurgyApp.tsx` | Feature composition root (calculator/planner/reference/about views). |
| `data/alloys.ts` | Static `METALS` + `ALLOY_RECIPES`. |
| `types/{alloys,crucible,planner}.ts` | Domain types. |
| `lib/alloyLogic.ts` | `aggregateCrucible`, `evaluateAlloys`, `createPresetForAlloy`, `adjustCrucibleForAlloy`, `calculateNuggetAdjustments`. |
| `lib/recipeOptimizer.ts` | Dispatcher — routes to maximize/economical. |
| `lib/maximizationStrategy.ts` | Fills crucible to maximum ingot count. |
| `lib/economicalStrategy.ts` | Minimizes rarer metal usage for target ingot count. |
| `lib/metalRarity.ts` | Rarity scores + `calculateRarityCost`. |
| `lib/recipeValidator.ts` | Slot count / capacity / percentage validators. |
| `lib/planner.ts` | Inventory-driven batch planning, craftability, scarcity modes. |
| `store/useMetallurgyStore.ts` | Zustand store — active view, crucible, selected recipe, planner state. |
| `store/useMetallurgyUrlSync.ts` | `pushState`/`replaceState`/`popstate` hydration, SEO updates. |
| `routing/{routes,appStateRouting}.ts` | Manual path + query-string parsing for calculator/planner URLs. |
| `components/*` | `CalculatorControls`, `CruciblePanel`, `CrucibleSlotRow`, `CompositionCard`, `ResultCard`, `PlannerView`, `AlloyReferenceTable`, `SeoLandingContent`. |

### Leatherwork feature layout (`src/features/leatherwork/`)

| Path | Purpose |
|------|---------|
| `LeatherApp.tsx` | Feature composition root. Drives inputs, memoizes calculation, renders summary + `HidePicker` + `ShoppingList` + `Pipeline`. |
| `lib/leather.ts` | Pure calculators: `calculateLeatherPlan`, `calculatePeltPlan`, `getSelectedHideProfile`. Hosts `HIDE_DATA`, `BEAR_DATA`, barrel/batch constants. |
| `types/leather.ts` | Domain types: `HideSize`, `Solvent`, `LeatherMode`, `LeatherWorkflow`, `AnimalVariant`, `BearVariant`, `LeatherState`, `HideProfile`, `LeatherCalculation`, `PeltCalculation`, `LeatherworkCalculation` (union), `PipelineStep`, `ShoppingListItem`, `SummaryMetric`. |
| `store/useLeatherStore.ts` | Zustand store — workflow (leather/pelt), mode (hides/leather), size, animalVariant, bearVariant, hideCount, targetLeather, solvent. |
| `store/useLeatherUrlSync.ts` | URL ↔ store sync (query params + `popstate`). |
| `routing/{routes,appStateRouting}.ts` | Path + query parsing for leatherwork URLs. `LEATHER_VIEW_PATH` re-exports `@/routing/routes.LEATHER_ROUTE_PATH`. |
| `components/HidePicker.tsx` | Size + animal + bear-variant selector. |
| `components/Pipeline.tsx` | Step-by-step production pipeline display (barrels, batches, durations). |
| `components/ShoppingList.tsx` | Aggregate material list (logs, water, lime/borax, fat, etc.). |

Shared leather surfaces outside the feature: `src/components/LeatherReferencePanel.tsx` (rail/reference surface).

### Pottery feature layout (`src/features/pottery/`)

| Path | Purpose |
|------|---------|
| `PotteryApp.tsx` | Feature composition root (pottery-calculator / pottery-planner views). |
| `data/recipes.ts` | `POTTERY_RECIPES`, `POTTERY_RECIPE_BY_ID`, `POTTERY_CATEGORIES`. Images at `/pottery/items/<id>.png` set by the `recipe()` factory — never hardcode asset paths. |
| `types/pottery.ts` | `ClayType`, `KilnMode`, `KilnFuelType`, `BeehiveClass`, `PotteryRecipe`, `PotteryCalculatorState`, `PotteryPlannerState`, `PotteryView`. |
| `lib/potteryLogic.ts` | All domain logic: `calcClayCost`, `calcFeasibility`, `calcPitKilnPlan`, `calcBeehiveKilnPlan`, `KILN_FUEL_OPTIONS`, `BEEHIVE_CAPACITY_BY_CLASS`. |
| `store/usePotteryStore.ts` | Zustand store — activeView, calculatorState, plannerState. Hydrates from URL on init. |
| `store/usePotteryUrlSync.ts` | `pushState`/`popstate` hydration. |
| `routing/{routes,appStateRouting}.ts` | Paths `/pottery/` and `/pottery/planner/`. Query contracts: calculator uses `item`, `qty`; planner uses `plan`, `inv-any`, `inv-fire`, `kiln`, `fuel`. |
| `components/PotteryPlanner.tsx` | Full planner UI — item picker, feasibility, pit/beehive kiln schedules, fuel selector. |

See `docs/agent/pottery-feature.md` for full domain detail.

### Key domain concepts

**Metallurgy:**

- **Crucible**: 4 slots, each holding up to 128 nuggets of one metal. 1 nugget = 5 units. 20 nuggets = 1 ingot = 100 units.
- **`MetalId`** is a string union in `src/features/metallurgy/types/alloys.ts` (copper, tin, zinc, …).
- **`AlloyRecipe`** has `components: AlloyComponent[]` where each specifies `minPercent`/`maxPercent`.
- **`evaluateAlloys`** scores all recipes against the current composition and returns `EvaluationResult` with `bestMatch`.
- **Validation tolerance**: 0.01% for floating-point rounding; 0.5% for contamination detection.

**Leatherwork:**

- **Two workflows**: `leather` (tan hides into leather) and `pelt` (cure hides into pelts). Pelt workflow forces `mode = "hides"`.
- **Hide sizes**: `small` / `medium` / `large` / `huge`, each with `litersPerHide`, `leatherYield`, `maxPerBarrel` in `HIDE_DATA`.
- **Animal variants** (small hides only): `generic`, `fox`, `arctic-fox`, `raccoon`.
- **Bear variants**: `sun`/`panda` → large raw, `black`/`brown`/`polar` → huge raw. Selecting a bear variant overrides size and forces `animalVariant = "generic"`.
- **Solvent** (leather workflow only): `lime` or `borax`. Affects preparing-stage chemistry, not yield.
- **Asset builders**: always import `getHideAssetPath` / `getMaterialAssetPath` from `@/features/leatherwork/lib/leather`. Never hardcode `/leather/...` paths.

**Pottery:**

- **Two clay types**: `"any"` (regular clay) and `"fire"` (fire clay only). Fire clay can substitute for any-clay items; not vice versa.
- **Two tools**: calculator (single recipe + quantity) and planner (multi-item with clay inventory tracking).
- **Two kiln modes**: `"pit"` (sequential, per-item cycles) and `"beehive"` (parallel, items grouped by `BeehiveClass`).
- **Fuel types**: `firewood`, `peat`, `brown-coal`, `black-coal`, `charcoal`, `coke`. Default: `firewood`.
- **Assets**: recipe images at `/pottery/items/<recipe.id>.png`. Use `PotteryRecipe.imageSrc` from `data/recipes.ts` — never hardcode paths.

### Product contracts worth protecting

All URL query params are share-link-visible. See `docs/agent/url-contracts.md` for the full spec.

- **Metallurgy calculator**: `s0..s3` (slot contents) + `r` (recipe ID).
- **Metallurgy planner**: `mode`, `recipe`, `target`, `inv_<metalId>`.
- **Pottery calculator**: `item`, `qty`.
- **Pottery planner**: `plan` (`id:qty,...`), `inv-any`, `inv-fire`, `kiln`, `fuel`.
- **Leatherwork**: `workflow`, `mode`, `size`, `animal`, `bear`, `hides`, `target`, `solvent`.
- **Manual routing**: `src/routing/routes.ts` (top-level) + per-feature `routing/routes.ts` files are the only route sources of truth. Same manifests feed runtime nav, SEO, and sitemap.
- **Locale**: detection + URL-preserving switching in `src/i18n/`. Provider listens to `popstate`.
- **Import policy**: relative imports inside `src/features/<feature>/**`; `@/` alias for shared or cross-feature code. Do not recreate deleted re-export shims.
- **`AppDomain` / `AppNavTarget`** in `src/types/app.ts` must be updated when adding a new domain.

### Adding a new alloy

Edit `src/features/metallurgy/data/alloys.ts`:
1. Add any new `MetalId` values to the union in `src/features/metallurgy/types/alloys.ts`.
2. Add entries to `METALS` with color and nugget image path.
3. Add an `AlloyRecipe` to `ALLOY_RECIPES` with `components` (min/max percentages must span 100%).

For adding a new pottery recipe, leather animal variant, or entire new domain feature see `docs/agent/adding-a-feature.md`.

### Skills for UI work

This project uses shadcn/ui patterns. When working on UI components:

- **`/shadcn`** — manages shadcn components (add, search, fix, style, compose). Use before adding any new primitive. The project has a `components.json` registry.
- **`/make-interfaces-feel-better`** — design-engineering principles for polish: hover states, shadows, border radii, micro-interactions, stagger animations, optical alignment, tabular numbers. Invoke when work touches visual detail.

Do not bypass these skills and hand-roll primitives that shadcn already provides.

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `vitest.config.ts`).

### Testing

Tests live at `src/lib/*.test.ts` (metallurgy logic tests were **not** moved during feature migration — they import via `@/features/metallurgy/lib/...`). Additional tests live next to source:
- `src/i18n/*.test.ts` — i18n and SEO helpers
- `src/routing/*.test.ts` — top-level routing
- `src/features/*/store/*.test.ts` — Zustand store tests for each feature
- `src/features/*/routing/appStateRouting.test.ts` — URL serialization per feature
- `src/features/leatherwork/lib/*.test.ts` — leather domain logic
- `src/features/pottery/lib/potteryLogic.test.ts` — pottery domain logic
- `src/features/pottery/components/PotteryPlanner.test.tsx` — pottery component tests

Uses Vitest + jsdom + `@testing-library/react`. Property-based tests use `@fast-check/vitest`. Always add or update tests when changing calculation rules, URL contracts, or user-visible behavior.

### Competitor landscape

| Tool | URL | Strengths | Weaknesses |
|------|-----|-----------|------------|
| vintagestory.cz/slitiny | https://www.vintagestory.cz/slitiny/ | 9 languages, ranked #1 in VS forum, mobile-friendly | No optimization modes, no contamination detection, no auto-fix |
| vintagecalc.eu | https://vintagecalc.eu/ | Top Google result, smelting temps, URL sharing, casting calculator, themes | English only, no economical mode, no near-miss fix |

**Features we must match or beat:**
- [x] Smelting temperatures displayed (v1.7.x)
- [x] URL sharing / shareable links (v1.7.x)
- [x] Mobile responsive layout (v1.7.x)
- [x] Multi-language support (i18n) — 9 locales shipped
- [ ] Casting / ore-to-ingot calculator — highest-priority remaining gap vs vintagecalc.eu

**Features already unique to this tool (must preserve):**
- Maximize ingots optimization
- Economical mode (minimizes rare metal usage)
- Near-miss auto-fix ("Adjust to Valid" button)
- Ratio lock
- Contamination detection with per-metal breakdown
- Inventory-driven batch planner with scarcity modes
- Pottery planner with clay feasibility + pit/beehive kiln scheduling
- Leatherwork pipeline calculator (tanning + pelts)

### Deployment

AWS (S3 + CloudFront + Route53) via GitHub Actions CI/CD. Terraform config in `terraform/`. See `DEPLOYMENT.md` for setup. Pushes to `master` trigger automatic deploys.

### Terraform backend

Remote state is stored in S3 with native locking (`use_lockfile = true`, requires TF ≥ 1.10). Bucket name lives in `terraform/backend.tfvars` (gitignored).

Bootstrap config that created the state bucket lives in `terraform/bootstrap/` (local state, applied once). Its account-specific vars are in `terraform/bootstrap/terraform.tfvars` (gitignored).

```bash
# First-time setup on a new machine
cd terraform && terraform init -backend-config=backend.tfvars

# Normal workflow
terraform plan
terraform apply
```
