# UI Plan Status

Tracks shipped UI and architecture state. Update after each significant feature or refactor lands.

Last updated: 2026-04-25 (pottery feature + sitemap generation branch).

## Shipped Structure

- App shell is stable: collapsible desktop rail, mobile bottom navigation, compact mobile header, footer, theme toggle, locale switcher, share action.
- Three features live under `src/features/`:
  - `metallurgy/` — calculator, planner, reference, about.
  - `pottery/` — pottery calculator, pottery planner.
  - `leatherwork/` — hide/leather/pelt calculator (lazy-loaded).
- `src/App.tsx` mounts `I18nProvider`, `AppShellLayout`, `MetallurgyApp`, `PotteryApp`, and lazy `LeatherApp`.
- Each feature owns its own Zustand store + URL sync layer.
- `SharedReferencePage` is a tabbed surface covering metallurgy, pottery, leather — tab driven by `#<domain>` hash.

## User-Facing Surfaces

- **Metallurgy calculator**: dedicated control surface, crucible workspace, result rail, composition card.
- **Metallurgy planner**: inventory-driven planning, craftability ranking, scarcity mode selection.
- **Metallurgy reference**: searchable, filterable, card-based browser (tab in `SharedReferencePage`).
- **Metallurgy about**: route-backed SEO/supporting content.
- **Pottery calculator**: recipe picker, quantity input, clay cost + firing info display.
- **Pottery planner**: multi-item plan, clay inventory (any + fire clay), pit kiln plan, beehive kiln plan, fuel selector, feasibility summary.
- **Leatherwork calculator**: hide/leather/pelt workflow switcher, hide picker, pipeline view, shopping list, reference panel.

## Navigation Model

- Desktop sidebar separates domain switching from supporting pages.
- `Metallurgy`, `Pottery`, and `Leatherwork` own the domain-navigation area.
- `Reference` and `Overview` stay pinned as standalone rail buttons.
- Three domains (`metallurgy`, `pottery`, `leather`) map to `AppDomain` in `src/types/app.ts`.

## Routing And SEO Status

- Routing is manual and pathname/query based for all features.
- Locale-prefixed routes (e.g. `/fr/pottery/`, `/fr/pottery/planner/`) are supported.
- Runtime navigation, route-aware SEO metadata, and sitemap generation all share the top-level route manifest (`src/routing/routes.ts`) plus per-feature manifests.
- Browser back/forward restores feature view state and locale state via `popstate` handlers in each feature's URL sync module.
- Sitemap generation lives in `src/i18n/sitemap.ts`.

## Pottery Feature Landing (2026-04-25)

Branch: `codex/sitemap-generation`

Landed:
- `src/features/pottery/` — full feature boundary: types, data, logic, store, routing, components.
- Pottery routes: `/pottery/` (calculator) and `/pottery/planner/`.
- `POTTERY_APP_ROUTES` added to `APP_STATIC_ROUTES` in `src/routing/routes.ts`.
- `AppDomain` and `AppNavTarget` in `src/types/app.ts` extended for pottery.
- `SharedReferencePage` now has pottery tab (`#pottery`).
- Pit kiln and beehive kiln planning with fuel selection.
- Clay feasibility check across any-clay and fire-clay inventory.

Pending (still in modified files, may not be fully committed):
- `PotteryPlanner.test.tsx` — component tests (untracked).
- Images in `public/pottery/items/` (untracked) — game asset copies.
- i18n keys in all locale files for pottery strings.

## Refactor Status (Tier 1 — 2026-04-19)

Shipped on `refactor/tier-1-dedup-and-dead-code`:

- Shared crucible allocation utilities in `src/features/metallurgy/lib/shared/crucibleAllocation.ts`.
- `MetalNuggetAmount` + `MetalAmount` canonicalized in `src/features/metallurgy/types/alloys.ts`.
- Constants consolidated in `src/features/metallurgy/lib/constants.ts`.
- Dead metallurgy exports removed.
- `shadcn` devDep removed.
- Leather asset-path builders centralized in `src/features/leatherwork/lib/leather.ts`.
- Pelt fat formula data-driven via `PELT_FAT_PER_HIDE`.

Remaining tiers (plan at `~/.claude/plans/could-you-search-for-stateful-kernighan.md`):
- Tier 2 — component splits, recipe-asset consolidation, `hideOptions` extraction, memoization, `useShallow` selector hooks.
- Tier 3 — discriminated `OptimizerResult`, generic backtracking solver, `leather.ts` split, mode-discriminated `LeatherCalculation`, component tests, vitest coverage config.

## Last Known Validation State

Run `pnpm lint && pnpm type-check && pnpm test && pnpm run build:prod` to verify. Last clean pass was on `refactor/tier-1-dedup-and-dead-code` HEAD.

## Current Watch Items

- Preserve all three feature URL contracts when making routing changes. See `docs/agent/url-contracts.md`.
- Keep `src/routing/routes.ts` + per-feature `routing/routes.ts` as the only route sources of truth.
- Solver code must import from `lib/shared/crucibleAllocation.ts` and `lib/constants.ts`.
- Leather components must import asset-path builders from `@/features/leatherwork/lib/leather`.
- Pottery components must not hardcode `/pottery/items/...` paths — use the `imageSrc` field on `PotteryRecipe`.
- Adding a new domain: mirror the feature-boundary shape (own store, own routing, own components); update `AppDomain` and `AppNavTarget` in `src/types/app.ts`; add routes to `APP_STATIC_ROUTES`. See `docs/agent/adding-a-feature.md`.
