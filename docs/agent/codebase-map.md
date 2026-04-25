# Codebase Map

> Canonical structure reference. Update this file when adding or moving modules.

## App Structure

- `src/App.tsx`: thin app shell. Owns only shell-rail collapse state + top-level navigation callbacks. Mounts `I18nProvider`, `AppShellLayout`, `MetallurgyApp`, `PotteryApp`, and lazy `LeatherApp`.
- `src/components/`: shared shell + app-level UI (`AppShellLayout`, `ShellNavigation`, `Header`, `Footer`, `OverviewPage`, `SharedReferencePage`, `LeatherReferencePanel`, `TranslationNotice`).
- `src/components/ui/`: shared primitives (shadcn/Radix patterns).
- `src/i18n/`: locale dictionaries, routing helpers, provider, SEO helpers, sitemap, tests.
- `src/routing/routes.ts`: top-level domain route manifest (all features + shared routes). **Single source of truth for runtime nav, SEO, sitemap.**
- `src/types/app.ts`: `AppDomain` (`"metallurgy" | "leather" | "pottery"`), `AppNavTarget`, `ReferenceTab`, `SharedAppTarget`.
- `src/lib/`: `utils.ts` (`cn` helper), `analytics.ts`, `themeTransition.ts`, `useTheme.ts`, and legacy test files for metallurgy logic.

## Metallurgy Feature (`src/features/metallurgy/`)

- `MetallurgyApp.tsx`: feature composition root (calculator/planner/reference/about). Exported via `src/features/metallurgy/index.ts`.
- `data/alloys.ts`: static `METALS` and `ALLOY_RECIPES`.
- `data/recipeAssets.ts`: recipe image/asset mappings.
- `types/alloys.ts`: domain types including canonical `MetalNuggetAmount` (`{ metalId, nuggets }`) and `MetalAmount` (adds `units`, `percent`).
- `types/{crucible,planner}.ts`: crucible + planner domain types. `MetallurgyView` union lives in `types/planner.ts`.
- `lib/constants.ts`: `PERCENTAGE_TOLERANCE`, `CONTAMINATION_THRESHOLD`, `NUGGETS_PER_INGOT`, `UNITS_PER_INGOT`, `UNITS_PER_NUGGET`, `MAX_NUGGETS_PER_SLOT`, `MAX_CRUCIBLE_SLOTS`. Single source for magic numbers.
- `lib/shared/crucibleAllocation.ts`: `distributeToSlots`, `amountsToCrucible`, `countSlotsUsed`, `fitsInFourSlots`, `calculatePercentages`. Consumed by all solver strategies + planner — do not duplicate.
- `lib/shared/configurationSolver.ts`: backtracking solver shared by strategies.
- `lib/alloyLogic.ts`: `aggregateCrucible`, `evaluateAlloys`, `createPresetForAlloy`, `adjustCrucibleForAlloy`, `calculateNuggetAdjustments`.
- `lib/recipeOptimizer.ts`: dispatcher — routes to maximize or economical strategy.
- `lib/maximizationStrategy.ts`: fills crucible to max ingot count.
- `lib/economicalStrategy.ts`: minimizes rarer metal usage for target ingot count.
- `lib/metalRarity.ts`: rarity scores + `calculateRarityCost`.
- `lib/recipeValidator.ts`: slot count / capacity / percentage validators.
- `lib/planner.ts`: inventory-driven batch planning, craftability, scarcity modes.
- `store/useMetallurgyStore.ts`: Zustand store — active view, crucible, selected recipe, planner state.
- `store/useMetallurgyView.ts`: view selector hook.
- `store/useMetallurgyUrlState.ts`: URL state parsing helpers used by the store.
- `store/useMetallurgyUrlSync.ts`: `pushState`/`replaceState`/`popstate` hydration + SEO updates.
- `routing/routes.ts`: `METALLURGY_VIEW_PATHS`, `METALLURGY_APP_ROUTES`.
- `routing/appStateRouting.ts`: query-string serialization/deserialization for calculator + planner URLs.
- `components/`: `CalculatorControls`, `CruciblePanel`, `CrucibleSlotRow`, `ResultCard`, `CompositionCard`, `PlannerView`, `AlloyReferenceTable`, `SeoLandingContent`.

## Pottery Feature (`src/features/pottery/`)

New feature added 2026-04-25. See `docs/agent/pottery-feature.md` for full detail.

- `PotteryApp.tsx` (via `index.ts`): feature composition root. Renders `PotteryPlanner` or `PotteryCalculator` based on active view.
- `data/recipes.ts`: `POTTERY_RECIPES`, `POTTERY_RECIPE_BY_ID`, `POTTERY_CATEGORIES`, `POTTERY_CATEGORY_ORDER`, `POTTERY_CATEGORY_BY_ID`. Recipe images served from `/pottery/items/<id>.png`.
- `types/pottery.ts`: `ClayType`, `KilnMode`, `KilnFuelType`, `BeehiveClass`, `PotteryCategory`, `PotteryCategoryMeta`, `PotteryRecipe`, `PotteryCalculatorState`, `PotteryPlanItem`, `PotteryPlannerState`, `PotteryView`.
- `lib/potteryLogic.ts`: all domain logic — `KILN_FUEL_OPTIONS`, `DEFAULT_KILN_FUEL_TYPE`, `BEEHIVE_CAPACITY_BY_CLASS`, `clampPositiveInt`, `getKilnFuelOption`, `calcClayCost`, `calcCraftedOutput`, `calcMaxCraftable`, `calcFeasibility`, `hydratePlanItems`, `getFireablePlan`, `calcPitKilnPlan`, `calcBeehiveKilnPlan`.
- `store/usePotteryStore.ts`: Zustand store — `activeView`, `calculatorState`, `plannerState`. Hydrates from URL on init.
- `store/usePotteryView.ts`: view selector hook.
- `store/usePotteryUrlSync.ts`: `pushState`/`replaceState`/`popstate` hydration.
- `routing/routes.ts`: `POTTERY_VIEW_PATHS` (`/pottery/`, `/pottery/planner/`), `POTTERY_APP_ROUTES`.
- `routing/appStateRouting.ts`: query-string serialization/deserialization for pottery calculator + planner URLs.
- `components/PotteryPlanner.tsx`: full planner UI — item picker, plan list, clay feasibility, pit/beehive kiln plans, fuel selector.
- `components/PotteryUi.tsx`: shared pottery primitives (`CategoryPill`, `ClayTypeBadge`, `NudgeRow`, `PotteryItemTile`, `SectionLabel`).
- `components/PotteryItemPicker.tsx`: recipe browser/filter used by planner.
- `components/PotteryPlanner.test.tsx`: component tests.

## Leatherwork Feature (`src/features/leatherwork/`)

- `LeatherApp.tsx` (lazy via `index.ts`): feature composition root. Drives inputs, memoizes calculation, renders summary + `HidePicker` + `ShoppingList` + `Pipeline`.
- `lib/leather.ts`: pure calculators (`calculateLeatherPlan`, `calculatePeltPlan`, `getSelectedHideProfile`), static data (`HIDE_DATA`, `BEAR_DATA`), `PELT_FAT_PER_HIDE`, asset-path builders (`getHideAssetPath`, `getMaterialAssetPath`).
- `lib/core.ts`: shared leather calculation core.
- `lib/batchBuilder.ts`: barrel/batch construction utilities.
- `lib/hideProfileAllocation.ts`: hide profile allocation helpers.
- `lib/useLeatherCalculation.ts`: calculation hook consumed by `LeatherApp`.
- `types/leather.ts`: `HideSize`, `Solvent`, `LeatherMode`, `LeatherWorkflow`, `AnimalVariant`, `BearVariant`, `LeatherState`, `HideProfile`, `LeatherCalculation`, `PeltCalculation`, `LeatherworkCalculation` (union), `PipelineStep`, `ShoppingListItem`, `SummaryMetric`.
- `data/hideOptions.ts`: hide option data for the picker.
- `store/useLeatherStore.ts`: Zustand store.
- `store/useLeatherInputs.ts`: input state helpers.
- `store/useLeatherUrlState.ts`: URL state parsing.
- `store/useLeatherUrlSync.ts`: URL ↔ store sync (`popstate`).
- `routing/routes.ts`: `LEATHER_VIEW_PATH` re-exports `@/routing/routes.LEATHER_ROUTE_PATH`.
- `routing/appStateRouting.ts`: path + query parsing.
- `components/HidePicker.tsx`: size + animal + bear-variant selector (uses `getHideAssetPath`).
- `components/Pipeline.tsx`: step-by-step production pipeline (barrels, batches, durations).
- `components/ShoppingList.tsx`: aggregate material list.
- Shared surface: `src/components/LeatherReferencePanel.tsx` (reference rail, uses asset builders from `lib/leather.ts`).

## Shell And Global UI

- `AppShellLayout.tsx`: top-level layout. Owns desktop rail + content area composition.
- `ShellNavigation.tsx`: desktop rail, collapse state, share action, locale switcher, theme toggle, mobile bottom nav.
- `Header.tsx`: compact mobile top bar only.
- `Footer.tsx`: credits/privacy/license/GitHub links.
- `OverviewPage.tsx`: landing/overview screen with domain navigation cards.
- `SharedReferencePage.tsx`: tabbed reference surface covering metallurgy, pottery, leather. Tab driven by `#<domain>` URL hash.
- `TranslationNotice.tsx`: locale-specific machine-translation notice.
- `src/index.css`: global theme tokens, dark palette overrides, focus styles, background treatment.

## Product Contracts Worth Protecting

See `docs/agent/url-contracts.md` for the full URL contract specification.

- **Manual routing**: pathname-based, not React Router. Route manifests are the only source of truth — `src/routing/routes.ts` (top-level), per-feature `routing/routes.ts` files.
- **Calculator semantics**: `aggregateCrucible`, `evaluateAlloys`, `calculateNuggetAdjustments`, `optimizeRecipe` — UI refactors must not change their semantics.
- **Canonical shared modules**: solver code must import from `lib/shared/crucibleAllocation.ts` and `lib/constants.ts`. Do not re-introduce local copies.
- **MetalAmount types**: import `MetalNuggetAmount` (solver/planner/rarity) and `MetalAmount` (aggregateCrucible output) from `types/alloys.ts`.
- **Leather asset builders**: import `getHideAssetPath` / `getMaterialAssetPath` from `@/features/leatherwork/lib/leather`. Do not hardcode `/leather/...` paths.
- **Pottery assets**: images served from `/pottery/items/<recipe.id>.png`. Path built by `data/recipes.ts:recipe()` factory — do not hardcode in components.
- **Import policy**: relative imports inside `src/features/<feature>/**`; alias imports (`@/`) for shared or cross-feature code. Do not recreate deleted top-level re-export shims.
- **AppDomain / AppNavTarget**: defined in `src/types/app.ts`. Update this file when adding a new domain.
