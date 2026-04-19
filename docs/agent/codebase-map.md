# Codebase Map

## App Structure

- `src/App.tsx`: thin app shell. Owns only shell-rail collapse state. Mounts `I18nProvider`, `AppShellLayout`, `MetallurgyApp`, and `LeatherApp`.
- `src/components/`: shared shell + app-level UI (`AppShellLayout`, `ShellNavigation`, `Header`, `Footer`, `OverviewPage`, `LeatherReferencePanel`, `TranslationNotice`).
- `src/components/ui/`: shared primitives (shadcn/Radix patterns).
- `src/i18n/`: locale dictionaries, routing helpers, provider, SEO helpers, tests.
- `src/routing/routes.ts`: top-level domain route manifest (metallurgy + leatherwork).
- `src/lib/`: `utils.ts` (`cn` helper), `analytics.ts`, and test files for metallurgy logic (tests import via `@/features/metallurgy/...`).

## Metallurgy Feature (`src/features/metallurgy/`)

- `MetallurgyApp.tsx`: feature composition root (calculator/planner/reference/about).
- `data/alloys.ts`: static `METALS` and `ALLOY_RECIPES`.
- `types/alloys.ts`: domain types including canonical `MetalNuggetAmount` (`{ metalId, nuggets }`) and `MetalAmount` (adds `units`, `percent`).
- `types/{crucible,planner}.ts`: crucible + planner domain types.
- `lib/constants.ts`: `PERCENTAGE_TOLERANCE`, `CONTAMINATION_THRESHOLD`, `NUGGETS_PER_INGOT`, `UNITS_PER_INGOT`, `UNITS_PER_NUGGET`, `MAX_NUGGETS_PER_SLOT`, `MAX_CRUCIBLE_SLOTS`. Single source for magic numbers.
- `lib/shared/crucibleAllocation.ts`: shared solver utilities — `distributeToSlots`, `amountsToCrucible`, `countSlotsUsed`, `fitsInFourSlots`, `calculatePercentages`. Consumed by all three solver strategies + planner.
- `lib/alloyLogic.ts`: `aggregateCrucible`, `evaluateAlloys`, `createPresetForAlloy`, `adjustCrucibleForAlloy`, `calculateNuggetAdjustments`. Re-exports `MetalAmount` from `types/alloys.ts`.
- `lib/recipeOptimizer.ts`: dispatcher — routes to maximize or economical strategy.
- `lib/maximizationStrategy.ts`: fills crucible to max ingot count (uses `crucibleAllocation` + `constants`).
- `lib/economicalStrategy.ts`: minimizes rarer metal usage for target ingot count (uses `crucibleAllocation` + `constants`).
- `lib/metalRarity.ts`: rarity scores + `calculateRarityCost` (consumes `MetalNuggetAmount`).
- `lib/recipeValidator.ts`: slot count / capacity / percentage validators (uses `PERCENTAGE_TOLERANCE`).
- `lib/planner.ts`: inventory-driven batch planning, craftability, scarcity modes (uses `crucibleAllocation` + `constants`).
- `store/useMetallurgyStore.ts`: Zustand store — active view, crucible, selected recipe, planner state.
- `store/useMetallurgyUrlSync.ts`: `pushState`/`replaceState`/`popstate` hydration + SEO updates.
- `routing/{routes,appStateRouting}.ts`: manual path + query-string parsing for calculator/planner URLs.
- `components/`: `CalculatorControls`, `CruciblePanel`, `CrucibleSlotRow`, `ResultCard`, `CompositionCard`, `PlannerView`, `AlloyReferenceTable`, `SeoLandingContent`.

## Leatherwork Feature (`src/features/leatherwork/`)

- `LeatherApp.tsx`: feature composition root. Drives inputs, memoizes calculation, renders summary + `HidePicker` + `ShoppingList` + `Pipeline`.
- `lib/leather.ts`: pure calculators (`calculateLeatherPlan`, `calculatePeltPlan`, `getSelectedHideProfile`), static data (`HIDE_DATA`, `BEAR_DATA`), batch constants, `PELT_FAT_PER_HIDE` (data-driven pelt fat scale), and canonical asset-path builders (`getHideAssetPath`, `getMaterialAssetPath`) consumed by all leather surfaces.
- `types/leather.ts`: domain types — `HideSize`, `Solvent`, `LeatherMode`, `LeatherWorkflow`, `AnimalVariant`, `BearVariant`, `LeatherState`, `HideProfile`, `LeatherCalculation`, `PeltCalculation`, `LeatherworkCalculation` (union), `PipelineStep`, `ShoppingListItem`, `SummaryMetric`.
- `store/useLeatherStore.ts`: Zustand store — workflow, mode, size, animalVariant, bearVariant, hideCount, targetLeather, solvent.
- `store/useLeatherUrlSync.ts`: URL ↔ store sync (query params + `popstate`).
- `routing/{routes,appStateRouting}.ts`: path + query parsing. `LEATHER_VIEW_PATH` re-exports `@/routing/routes.LEATHER_ROUTE_PATH`.
- `components/HidePicker.tsx`: size + animal + bear-variant selector. Consumes `getHideAssetPath` from `lib/leather.ts`.
- `components/Pipeline.tsx`: step-by-step production pipeline (barrels, batches, durations).
- `components/ShoppingList.tsx`: aggregate material list.
- Shared-side surface: `src/components/LeatherReferencePanel.tsx` (reference rail) — also consumes asset builders from `lib/leather.ts`.

## Shell And Global UI

- `ShellNavigation.tsx`: desktop rail, collapse state, share action, locale switcher, theme toggle, mobile bottom nav.
- `Header.tsx`: compact mobile top bar only.
- `Footer.tsx`: credits/privacy/license/GitHub links.
- `TranslationNotice.tsx`: locale-specific machine-translation notice.
- `src/index.css`: global theme tokens, dark palette overrides, focus styles, background treatment. Imports `tw-animate-css`.

## Product Contracts Worth Protecting

- **Metallurgy URL state**: calculator uses `s0..s3` + `r`; planner uses `mode`, `recipe`, `target`, `inv_*`. Share-link-visible.
- **Leatherwork URL state**: query contract lives in `src/features/leatherwork/routing/appStateRouting.ts`. Share-link-visible.
- **Manual routing**: still pathname-based, not React Router. Sources of truth — `src/routing/routes.ts` (top-level), `src/features/metallurgy/routing/{routes,appStateRouting}.ts`, `src/features/leatherwork/routing/{routes,appStateRouting}.ts`. Same manifests feed runtime nav, SEO, sitemap.
- **Locale**: detection priority and URL-preserving switching live in `src/i18n/`. Provider listens to `popstate`; keep aligned with locale-prefixed paths.
- **Translation notices**: only appear for locales that already surface them.
- **Calculator semantics**: `aggregateCrucible`, `evaluateAlloys`, `calculateNuggetAdjustments`, `optimizeRecipe` — UI refactors must not change their semantics.
- **Canonical shared modules**: new solver code must import from `lib/shared/crucibleAllocation.ts` and `lib/constants.ts` — do not re-introduce local copies of `distributeToSlots`, `amountsToCrucible`, `fitsInFourSlots`, `PERCENTAGE_TOLERANCE`, etc.
- **MetalAmount types**: import from `types/alloys.ts`. Use `MetalNuggetAmount` for solver/planner/rarity; `MetalAmount` for `aggregateCrucible` output.
- **Leather asset builders**: import `getHideAssetPath` / `getMaterialAssetPath` from `@/features/leatherwork/lib/leather`. Do not hardcode `/leather/...` paths in components.
- **Import policy**: relative imports inside `src/features/metallurgy/**` and `src/features/leatherwork/**`; alias imports (`@/`) for shared or cross-feature code. Do not recreate deleted top-level re-export shims.
