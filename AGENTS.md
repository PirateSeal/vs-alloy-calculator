# Repository Guidelines for AI Agents

## Before You Write Code

1. **Surface assumptions.** If the request is ambiguous, name what's unclear and ask before implementing.
2. **Check docs first.** `docs/agent/README.md` is the index. `docs/agent/codebase-map.md` is the canonical structure reference. Feature deep-dives live in `docs/agent/<feature>-feature.md`. Read the relevant doc before touching unfamiliar code.
3. **Surgical changes only.** Touch only what the task requires. Do not improve adjacent code, reformat unrelated files, or remove pre-existing dead code unless explicitly asked.
4. **Define done before starting.** Convert tasks to verifiable goals: "add X" → "tests for X pass, `pnpm test` is green, `pnpm type-check` is clean."

## Project Structure

Three-domain SPA. `src/App.tsx` is a thin shell that owns navigation callbacks and `activeTarget` / `activeDomain` state. Feature state lives exclusively in each feature's Zustand store.

```
src/
  App.tsx                        # nav callbacks only; mounts three feature apps
  features/
    metallurgy/                  # alloy calculator + planner
    pottery/                     # pottery calculator + planner
    leatherwork/                 # hide/leather/pelt calculator (lazy-loaded)
  components/                    # shared shell (AppShellLayout, ShellNavigation, SharedReferencePage, ui/*)
  i18n/                          # locale dicts, SEO, sitemap
  routing/routes.ts              # top-level route manifest — feeds nav, SEO, sitemap
  types/app.ts                   # AppDomain, AppNavTarget, ReferenceTab — update when adding a domain
  lib/                           # utils.ts, analytics.ts; metallurgy test files (legacy location)
docs/agent/                      # AI agent documentation — start here
```

**Each feature follows the same boundary shape:**
```
src/features/<name>/
  <Name>App.tsx + index.ts       # composition root
  types/<name>.ts                # all domain types
  data/                          # static data
  lib/<name>Logic.ts             # pure domain logic (no React)
  store/use<Name>Store.ts        # Zustand store; initializes from URL
  store/use<Name>UrlSync.ts      # pushState/popstate hydration
  routing/routes.ts              # VIEW_PATHS, APP_ROUTES
  routing/appStateRouting.ts     # URL query serialization/deserialization
  components/                    # feature UI
```

## Build & Test Commands

```bash
pnpm dev              # dev server at localhost:5173
pnpm build            # TypeScript compile + Vite build
pnpm build:prod       # lint → type-check → build + stats (full CI gate)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint auto-fix
pnpm type-check       # tsc --noEmit
pnpm test             # vitest --run (all tests)
pnpm vitest run <file>  # single test file
```

Gate before committing: `pnpm lint && pnpm type-check && pnpm test`.

## Import Policy

| Context | Import style |
|---------|-------------|
| Within `src/features/<name>/**` | Relative (`../lib/...`) |
| Cross-feature or shared code | `@/` alias (`@/features/<other>/...`, `@/components/...`) |
| Do not | Recreate deleted top-level re-export shims |

`@/` maps to `src/` in both `vite.config.ts` and `vitest.config.ts`.

## URL Contracts (Share-Link-Visible — Do Not Break)

Full spec: `docs/agent/url-contracts.md`.

| Feature | Path | Key params |
|---------|------|-----------|
| Metallurgy calculator | `/calculator/` | `s0..s3` (slot contents), `r` (recipe) |
| Metallurgy planner | `/planner/` | `mode`, `recipe`, `target`, `inv_<metalId>` |
| Pottery calculator | `/pottery/` | `item`, `qty` |
| Pottery planner | `/pottery/planner/` | `plan` (`id:qty,...`), `inv-any`, `inv-fire`, `kiln`, `fuel` |
| Leatherwork | `/leather/` | `workflow`, `mode`, `size`, `animal`, `bear`, `hides`, `target`, `solvent` |

Default values are **omitted** from serialization. Invalid params silently fall back to defaults — never throw.

Route manifests (`src/routing/routes.ts` + per-feature `routing/routes.ts`) are the **only** source of truth for paths. The same manifests feed runtime nav, SEO metadata, and sitemap generation.

## Domain Gotchas

**Metallurgy:**
- All constants (`NUGGETS_PER_INGOT`, `UNITS_PER_NUGGET`, `PERCENTAGE_TOLERANCE`, etc.) live in `lib/constants.ts`. Never redefine locally.
- Shared solver utilities (`distributeToSlots`, `amountsToCrucible`, `fitsInFourSlots`, `calculatePercentages`) live in `lib/shared/crucibleAllocation.ts`. Do not duplicate.
- `MetalNuggetAmount` (solver/planner/rarity) and `MetalAmount` (aggregateCrucible output) are distinct types — import both from `types/alloys.ts`.
- Do not change the semantics of `aggregateCrucible`, `evaluateAlloys`, `calculateNuggetAdjustments`, or `optimizeRecipe` under UI refactors.

**Pottery:**
- Fire clay can substitute for any-clay items; any-clay cannot substitute fire clay. `calcFeasibility` in `lib/potteryLogic.ts` enforces this.
- Recipe images are set by the `recipe()` factory in `data/recipes.ts` — never hardcode `/pottery/items/...` paths in components. Use `PotteryRecipe.imageSrc`.
- Storage vessel uses 8 fuel/cycle in pit kiln (not the standard 4). This is a hardcoded exception in `calcPitKilnPlan`.

**Leatherwork:**
- Bear variant overrides `size` — the URL parser sets `size` from the bear map; the `size` param is ignored when `bear` is present.
- Always import `getHideAssetPath` / `getMaterialAssetPath` from `@/features/leatherwork/lib/leather`. Never hardcode `/leather/...` strings.
- Calculation entry point is the `useLeatherCalculation` hook — `LeatherApp.tsx` does not call calculation functions directly.

**Routing:**
- Routing is manual pathname + query. `popstate` listeners in each feature's URL sync module plus `App.tsx` restore state on back/forward.
- Locale-prefixed paths (`/fr/pottery/planner/`) are supported. Strip with `stripLocalePrefix`; re-prepend with `getLocalizedAppPath`.
- Adding a new domain requires updating `AppDomain` and `AppNavTarget` in `src/types/app.ts`, adding routes to `APP_STATIC_ROUTES`, and wiring navigation in `App.tsx`. Full checklist: `docs/agent/adding-a-feature.md`.

## UI Work — Use These Skills

**Shadcn components:** invoke `/shadcn` before adding any new UI primitive. The project uses shadcn/ui patterns with a `components.json` registry. Do not hand-roll buttons, selects, cards, or other primitives shadcn already provides.

**Visual polish:** invoke `/make-interfaces-feel-better` when touching hover states, shadows, border radii, animations, spacing, typography details, or anything described as "feels off." The project has a defined design system — see `DESIGN.md` for tokens (read-only reference, do not edit).

## Testing

- Vitest + jsdom + `@testing-library/react`. Property-based tests use `@fast-check/vitest`.
- Test locations by category:
  - Metallurgy domain logic: `src/lib/*.test.ts` (legacy location — imports via `@/features/metallurgy/lib/...`)
  - Pottery domain logic: `src/features/pottery/lib/potteryLogic.test.ts`
  - Pottery routing: `src/features/pottery/routing/appStateRouting.test.ts`
  - Leatherwork domain: `src/features/leatherwork/lib/leather.test.ts`
  - Leatherwork routing: `src/features/leatherwork/routing/appStateRouting.test.ts`
  - Stores: `src/features/*/store/*.test.ts`
  - i18n + SEO: `src/i18n/*.test.ts`
  - Top-level routing: `src/routing/*.test.ts`
- **Add or update tests whenever you change:** calculation rules, URL query contracts, or user-visible behavior.
- Run a single file during iteration: `pnpm vitest run src/features/pottery/lib/potteryLogic.test.ts`

## Commit & PR Guidelines

Conventional prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`. Subject line: imperative, ≤ 72 chars, scoped to one change.

PRs should note: user-visible impact, Terraform/deployment implications if any, and how you validated locally. Include screenshots or recordings for UI changes.
