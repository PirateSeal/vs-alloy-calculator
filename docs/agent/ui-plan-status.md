# UI Plan Status

Tracks the current state of the shipped UI and architecture after the metallurgy feature-boundary migration, the leatherwork feature launch, and the Tier 1 refactor (2026-04-19).

## Shipped Structure

- App shell is stable: collapsible desktop rail, mobile bottom navigation, compact mobile header, footer, theme toggle, locale switcher, share action.
- Two features live under `src/features/`:
  - `metallurgy/` — calculator, planner, reference, about.
  - `leatherwork/` — hide/leather/pelt calculator.
- `src/App.tsx` is a thin wrapper that mounts `I18nProvider`, `AppShellLayout`, `MetallurgyApp`, and `LeatherApp`.
- Each feature owns its own Zustand store + URL sync layer.

## User-Facing Surfaces

- Metallurgy calculator: dedicated control surface, crucible workspace, result rail, composition card.
- Metallurgy planner: inventory-driven planning, craftability ranking, scarcity mode selection.
- Metallurgy reference: searchable, filterable, card-based browser.
- Metallurgy about: route-backed SEO/supporting content.
- Leatherwork calculator: hide/leather/pelt workflow switcher, hide picker, pipeline view, shopping list, reference panel.

## Pinned Navigation Decision

- Desktop sidebar separates domain switching from supporting pages.
- `Metallurgy` and `Leatherwork` own the domain-navigation area and expose their tool dropdowns from the sidebar.
- `Reference` and `About` stay pinned as standalone rail buttons rather than being folded into a domain dropdown.
- Intentional separation: domain dropdowns are for active tools, `Reference` and `About` remain globally discoverable support surfaces.

## Routing And SEO Status

- Routing remains manual and pathname/query based for both features.
- Locale-prefixed routes (e.g. `/fr/planner/`, `/fr/leather/`) are supported.
- Runtime navigation, route-aware SEO metadata, and sitemap generation share the top-level route manifest (`src/routing/routes.ts`) plus the per-feature manifests.
- Browser back/forward restores feature view state and locale state.

## Refactor Status (Tier 1 — 2026-04-19)

Shipped on `refactor/tier-1-dedup-and-dead-code`:

- Shared crucible allocation utilities extracted to `src/features/metallurgy/lib/shared/crucibleAllocation.ts`. Maximization, economical, and planner strategies consume instead of duplicating.
- `MetalAmount` canonicalized as `MetalNuggetAmount` + `MetalAmount` in `src/features/metallurgy/types/alloys.ts`. Local copies removed.
- Tolerance + unit constants consolidated in `src/features/metallurgy/lib/constants.ts` (`PERCENTAGE_TOLERANCE`, `CONTAMINATION_THRESHOLD`, `NUGGETS_PER_INGOT`, `UNITS_PER_INGOT`, `UNITS_PER_NUGGET`, `MAX_NUGGETS_PER_SLOT`, `MAX_CRUCIBLE_SLOTS`).
- Dead metallurgy exports removed (`isWithinRange`, `calculateMaxIngots`, `calculateMaxIngotsForPreset`) and tests pruned.
- `shadcn` devDep removed.
- Leather asset-path builders (`getHideAssetPath`, `getMaterialAssetPath`) centralized in `src/features/leatherwork/lib/leather.ts`; `LeatherReferencePanel` and `HidePicker` now consume.
- Pelt fat formula data-driven via `PELT_FAT_PER_HIDE: Record<HideSize, number>`.

Remaining tiers (plan at `~/.claude/plans/could-you-search-for-stateful-kernighan.md`):
- Tier 2 — component splits in both features, recipe-asset consolidation, `hideOptions` extraction, memoization, `useShallow` selector hooks.
- Tier 3 — discriminated `OptimizerResult`, generic backtracking solver, `leather.ts` split into calc + builder modules, mode-discriminated `LeatherCalculation`, component tests, vitest coverage config.

## Validation Status

- `pnpm lint`
- `pnpm type-check`
- `pnpm test` (203/203)
- `pnpm run build:prod`

All pass on `refactor/tier-1-dedup-and-dead-code` HEAD.

## Current Watch Items

- Preserve existing metallurgy + leatherwork URL contracts when adding future features.
- Keep the route manifests (`src/routing/routes.ts`, per-feature `routing/routes.ts`) as the only route sources of truth for runtime + SEO + sitemap.
- New solver code must import from `lib/shared/crucibleAllocation.ts` and `lib/constants.ts`. Do not re-introduce local duplicates.
- New leather components must import asset-path builders from `@/features/leatherwork/lib/leather`. Do not hardcode `/leather/...` strings.
- Adding a new domain feature: mirror the current feature-boundary shape (own store, own routing, own components) rather than widening shared app state.
