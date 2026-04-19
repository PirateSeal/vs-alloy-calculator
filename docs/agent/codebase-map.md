# Codebase Map

## App Structure

- `src/App.tsx`: thin app shell. It owns only shell-rail collapse persistence and mounts `I18nProvider` plus `MetallurgyApp`.
- `src/features/metallurgy/MetallurgyApp.tsx`: primary feature composition root for calculator, planner, reference, and about.
- `src/features/metallurgy/data/alloys.ts`: static alloy and metal definitions.
- `src/features/metallurgy/lib/alloyLogic.ts`: crucible aggregation, recipe evaluation, preset creation, and adjustment helpers.
- `src/features/metallurgy/lib/planner.ts`: inventory planning, craftability, and scarcity-driven recipe planning.
- `src/features/metallurgy/lib/recipeOptimizer.ts`: maximize/economical optimization logic used by calculator controls and result guidance.
- `src/features/metallurgy/store/useMetallurgyStore.ts`: Zustand store for active view, calculator crucible, selected recipe ID, and planner state.
- `src/features/metallurgy/store/useMetallurgyUrlSync.ts`: browser history, `replaceState`/`pushState`, `popstate` hydration, and SEO updates for metallurgy routes.
- `src/features/metallurgy/routing/appStateRouting.ts`: manual pathname/query parsing and serialization for calculator/planner URLs.
- `src/features/metallurgy/routing/routes.ts`: single source of truth for metallurgy route paths.
- `src/components/`: shared shell and app-level UI.
- `src/components/ui/`: shared primitives based on the local design system.
- `src/i18n/`: locale dictionaries, routing helpers, provider, SEO helpers, and tests.

## Calculator Surface

- `src/features/metallurgy/components/CalculatorControls.tsx`: preset loading, ingot scaling, maximize/economical actions.
- `src/features/metallurgy/components/CruciblePanel.tsx`: workspace container for all four slots and bulk clear.
- `src/features/metallurgy/components/CrucibleSlotRow.tsx`: per-slot metal selection, nugget slider, and quick adjustments.
- `src/features/metallurgy/components/ResultCard.tsx`: current product hero, validity state, contamination, excess material, and adjust-to-valid action.
- `src/features/metallurgy/components/CompositionCard.tsx`: composition summary, stacked bar, and sweet-spot guidance.

## Planner, Reference, And About

- `src/features/metallurgy/components/PlannerView.tsx`: inventory-driven alloy planning surface and scarcity strategy controls.
- `src/features/metallurgy/components/AlloyReferenceTable.tsx` is effectively a dense reference browser rather than a literal table-only screen.
- It keeps search, metal filters, sorting, wiki links, notes, and composition range display.
- On mobile it degrades to stacked row-cards to avoid horizontal overflow.
- `src/features/metallurgy/components/SeoLandingContent.tsx`: route-backed about/SEO content surface.

## Shell And Global UI

- `ShellNavigation.tsx`: desktop rail, collapse state, share action, locale switcher, theme toggle, and mobile bottom nav.
- `Header.tsx`: compact mobile top bar only.
- `Footer.tsx`: credits/privacy/license/GitHub links.
- `TranslationNotice.tsx`: locale-specific machine-translation notice banner.
- `src/index.css`: global theme tokens, dark palette overrides, focus styles, and background treatment.

## Product Contracts Worth Protecting

- Calculator URL state uses `s0..s3` plus `r`; planner URL state uses `mode`, `recipe`, `target`, and `inv_*`. Changes here are user-visible and share-link-visible.
- Manual routing is still pathname-based, not React Router. `src/features/metallurgy/routing/routes.ts` and `src/features/metallurgy/routing/appStateRouting.ts` define the contract.
- Locale detection priority and URL-preserving switching live in `src/i18n/`. The provider also listens to `popstate` and must stay aligned with locale-prefixed paths.
- Route-aware SEO and sitemap generation both depend on the metallurgy route manifest.
- Translation notices should only appear for the locales that already surface them.
- Calculator behavior depends on `aggregateCrucible`, `evaluateAlloys`, `calculateNuggetAdjustments`, and `optimizeRecipe`; UI refactors should not change their semantics.
- Import policy is deliberate: relative imports inside `src/features/metallurgy/**`, alias imports for shared or cross-feature code. Do not recreate the deleted top-level metallurgy re-export shims.
