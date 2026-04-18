# Codebase Map

## App Structure

- `src/App.tsx`: owns tab state, URL sync, lazy reference loading, and shell layout.
- `src/data/alloys.ts`: static alloy and metal definitions.
- `src/lib/alloyLogic.ts`: crucible aggregation, recipe evaluation, preset creation, and adjustment helpers.
- `src/lib/recipeOptimizer.ts`: maximize/economical optimization logic used by calculator controls and result guidance.
- `src/components/`: product UI.
- `src/components/ui/`: shared primitives based on the local design system.
- `src/i18n/`: locale dictionaries, routing helpers, provider, SEO helpers, and tests.

## Calculator Surface

- `CalculatorControls.tsx`: preset loading, ingot scaling, maximize/economical actions.
- `CruciblePanel.tsx`: workspace container for all four slots and bulk clear.
- `CrucibleSlotRow.tsx`: per-slot metal selection, nugget slider, and quick adjustments.
- `ResultCard.tsx`: current product hero, validity state, contamination, excess material, and adjust-to-valid action.
- `CompositionCard.tsx`: composition summary, stacked bar, and sweet-spot guidance.

## Reference Surface

- `AlloyReferenceTable.tsx` is now effectively a dense reference browser rather than a literal table-only screen.
- It keeps search, metal filters, sorting, wiki links, notes, and composition range display.
- On mobile it degrades to stacked row-cards to avoid horizontal overflow.

## Shell And Global UI

- `ShellNavigation.tsx`: desktop rail, collapse state, share action, locale switcher, theme toggle, and mobile bottom nav.
- `Header.tsx`: compact mobile top bar only.
- `Footer.tsx`: credits/privacy/license/GitHub links.
- `TranslationNotice.tsx`: locale-specific machine-translation notice banner.
- `src/index.css`: global theme tokens, dark palette overrides, focus styles, and background treatment.

## Product Contracts Worth Protecting

- URL state uses `s0..s3` plus `r`; changes here are user-visible and share-link-visible.
- Locale detection priority and URL-preserving switching live in `src/i18n/`.
- Translation notices should only appear for the locales that already surface them.
- Calculator behavior depends on `aggregateCrucible`, `evaluateAlloys`, `calculateNuggetAdjustments`, and `optimizeRecipe`; UI refactors should not change their semantics.
