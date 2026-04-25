# Leatherwork Feature

> Agent reference for `src/features/leatherwork/`. Second domain after metallurgy. Lazy-loaded in `App.tsx`.

## What It Does

Single-surface calculator at `/leather/` with two workflows:
1. **Leather** — tan raw hides into leather: soaking → preparing → weak tannin → strong tannin → completing.
2. **Pelt** — cure raw hides into pelts: soak in fat, cure in barrel.

Both workflows output a `Pipeline` (step-by-step process), a `ShoppingList` (all materials), and `SummaryMetrics` (key numbers at a glance).

## Domain Concepts

### Hide Sizes (`lib/core.ts:HIDE_DATA`)

| Size | Liters/hide | Leather yield | Max/barrel |
|------|------------|---------------|------------|
| `small` | 2 L | 1 leather | 25 |
| `medium` | 4 L | 2 leather | 12 |
| `large` | 6 L | 3 leather | 8 |
| `huge` | 10 L | 5 leather | 5 |

### Animal Variants (small hides only)

`AnimalVariant`: `"generic"` | `"fox"` | `"arctic-fox"` | `"raccoon"`.

Variant affects `rawHideLabel`, `rawHideSubtitle`, and asset paths. Non-`generic` variants only apply to `size === "small"` — the parser normalizes `animalVariant` to `"generic"` for other sizes.

### Bear Variants (overrides size)

`BearVariant`: `"sun"` | `"panda"` | `"black"` | `"brown"` | `"polar"`.

Selecting a bear variant overrides `size` (sun/panda → `"large"`; black/brown/polar → `"huge"`) and forces `animalVariant = "generic"`. Bears produce huge scraped hides and split pelt outputs.

| Bear | Raw size | Scraped huge hides | Pelt fat | Split pelt size | Split pelt count |
|------|----------|-------------------|----------|-----------------|-----------------|
| sun | large | 2 | 1 | medium | 1 |
| panda | large | 2 | 1 | large | 1 |
| black | huge | 2 | 2 | large | 2 |
| brown | huge | 3 | 2 | huge | 2 |
| polar | huge | 3 | 2 | huge | 3 |

### Workflows And Modes

- `LeatherWorkflow`: `"leather"` | `"pelt"`. Controls which calculation runs.
- `LeatherMode` (leather workflow only): `"hides"` (input = how many raw hides) | `"leather"` (input = target leather count, back-calculates hides needed).
- Pelt workflow forces `mode = "hides"`.

### Solvent (leather workflow only)

`Solvent`: `"lime"` | `"borax"`.
- `lime`: quantity = soaking liters (1:1).
- `borax`: diluted borax in batches of `DILUTED_BORAX_BATCH_LITERS` (5 L) costing `DILUTED_BORAX_BATCH_COST` (2 borax ore). Use `getPowderedBoraxRequired(soakingLiters)`.

### Constants (`lib/core.ts`)

| Constant | Value |
|----------|-------|
| `TANNIN_BATCH_LITERS` | 10 L per tannin batch |
| `DILUTED_BORAX_BATCH_LITERS` | 5 L per diluted borax batch |
| `DILUTED_BORAX_BATCH_COST` | 2 borax ore per batch |
| `PELT_FAT_PER_HIDE` | small: 0.25, medium: 0.5, large: 1, huge: 2 |

## Module Responsibilities

| Module | Purpose |
|--------|---------|
| `lib/core.ts` | Static data (`HIDE_DATA`, `BEAR_DATA`, constants), pure utility functions, asset-path builders |
| `lib/leather.ts` | `calculateLeatherPlan`, `calculatePeltPlan` — top-level calculation entry points. Re-exports `core.ts` symbols. |
| `lib/hideProfileAllocation.ts` | `getSelectedHideProfile` — resolves `HideProfile` from (size, animalVariant, bearVariant, rawHideCount) |
| `lib/batchBuilder.ts` | `build*Pipeline`, `build*ShoppingList`, `build*SummaryMetrics` — assembles display data from raw calculation numbers |
| `lib/useLeatherCalculation.ts` | React hook: reads store state, memoizes `calculateLeatherPlan`/`calculatePeltPlan`, returns `LeatherworkCalculation` |

## Key Logic Functions

### `calculateLeatherPlan(params)` → `LeatherCalculation`

Input: `{ t, hideCount, mode, size, solvent, targetLeather?, animalVariant?, bearVariant? }`.

Steps:
1. If `mode === "leather"`: use `hidesForLeatherTarget(targetLeather, size, bearVariant)` to back-calculate `rawHideCount`.
2. Call `getSelectedHideProfile` → `HideProfile`.
3. Compute barrel counts, tannin batches, water, logs, leather yield.
4. Call `buildLeatherPipeline`, `buildLeatherShoppingList`, `buildLeatherSummaryMetrics` from `batchBuilder.ts`.

Output shape (simplified):
```ts
{
  workflow: "leather",
  mode: "hides" | "leather",
  hideProfile,
  rawHideCount, scrapedHideCount, actualLeather,
  soakingLiters, soakingBarrels, preparingBarrels,
  weakTanninBarrelsPerRound, strongTanninBarrels, completingBarrels,
  limeRequired, powderedBoraxRequired,
  tanninLogsForWeak, tanninLogsForStrong, totalLogs,
  totalWater, soakingWater,
  summaryMetrics, shoppingList, pipeline,
}
```

### `calculatePeltPlan(params)` → `PeltCalculation`

Input: `{ t, hideCount, size, animalVariant?, bearVariant? }`.

Output shape:
```ts
{
  workflow: "pelt",
  hideProfile,
  rawHideCount, fatRequired, curingDuration,
  curedPeltCount, curedPeltLabel, curedPeltAssetPath,
  splitGenericPeltCount, splitGenericPeltSize, splitGenericPeltLabel, splitHeadCount,
  summaryMetrics, shoppingList, pipeline,
}
```

### `getSelectedHideProfile(params)` → `HideProfile`

Resolves all size/variant combinations into a single normalized `HideProfile` object. All downstream calculation uses only `HideProfile` fields — never reads raw size/variant after this point.

### Asset path builders (`lib/core.ts`) — import from `lib/leather.ts`

```ts
getHideAssetPath(stage: HideStage, size: HideSize): string
// stage: "raw" | "soaked" | "scraped" | "prepared"
// Returns: /leather/hides/<stage>/<size>.png

getMaterialAssetPath(material: LeatherMaterial): string
// barrel/knife-copper → /leather/tools/<material>.png
// everything else → /leather/materials/<material>.png
```

**Always import these from `@/features/leatherwork/lib/leather`.** Do not hardcode `/leather/...` paths anywhere else.

## State And Store (`store/useLeatherStore.ts`)

```ts
interface LeatherState {
  workflow: LeatherWorkflow;     // "leather" | "pelt"
  mode: LeatherMode;             // "hides" | "leather"
  size: HideSize;
  animalVariant: AnimalVariant;
  bearVariant: BearVariant | null;
  hideCount: number;
  targetLeather: number;
  solvent: Solvent;
}
```

Additional store hooks:
- `store/useLeatherInputs.ts` — derived input state helpers for the UI.
- `store/useLeatherUrlState.ts` — URL parsing helpers.
- `store/useLeatherUrlSync.ts` — `pushState`/`popstate` sync.

## URL Contract

Path: `/leather/`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `workflow` | `"leather" \| "pelt"` | `"leather"` | Workflow mode |
| `mode` | `"hides" \| "leather"` | `"hides"` | Input mode (leather workflow only) |
| `size` | `HideSize` | `"small"` | Hide size (overridden by `bear`) |
| `animal` | `AnimalVariant` | `"generic"` | Animal variant (small hides only) |
| `bear` | `BearVariant` | none | Bear variant (overrides `size`) |
| `hides` | `number` | `1` | Hide count (mode=hides) |
| `target` | `number` | `1` | Target leather count (mode=leather) |
| `solvent` | `"lime" \| "borax"` | `"lime"` | Preparing solvent (leather workflow) |

Max count: 999. Invalid params silently drop to defaults.

Bear param implies size — `size` param is ignored when `bear` is present.

Full canonical spec in `src/features/leatherwork/routing/appStateRouting.ts`.

## Components

| Component | Purpose |
|-----------|---------|
| `LeatherApp.tsx` | Feature root. Reads store, memoizes calculation, passes result down |
| `HidePicker.tsx` | Size selector, animal variant selector, bear variant selector (uses `getHideAssetPath`) |
| `Pipeline.tsx` | Step-by-step production pipeline: each `PipelineStep` shows inputs/outputs/duration/barrel count |
| `ShoppingList.tsx` | Aggregated material list from `LeatherworkCalculation.shoppingList` |
| `src/components/LeatherReferencePanel.tsx` | Reference surface in the nav rail; also uses asset builders from `lib/leather.ts` |

## `HideProfile` Shape

`HideProfile` is the resolved representation of a (size, variant) combination. Key fields agents should know:

```ts
interface HideProfile {
  rawSize: HideSize;                    // actual raw hide size after bear override
  displaySize: HideSize;                // size shown in UI
  soakingLitersPerRawHide: number;
  soakingBarrelCapacity: number;        // max raw hides per soaking barrel
  scrapedHideCountPerRawHide: number;   // scraped hides produced per raw hide
  scrapedHideSize: HideSize;            // size of scraped output
  leatherYieldPerRawHide: number;       // leather pieces per raw hide
  rawHideCount: number;                 // total raw hides needed
  // ... asset paths, labels ...
}
```

## Calculation Entry Point Pattern

`LeatherApp.tsx` does not call calculation functions directly — it uses the `useLeatherCalculation` hook, which memoizes on store state. If you add a new input field:
1. Add it to `LeatherState` in `types/leather.ts`.
2. Add it to the store in `useLeatherStore.ts`.
3. Add URL serialization/deserialization in `routing/appStateRouting.ts`.
4. Thread it into `calculateLeatherPlan` or `calculatePeltPlan` params.
5. Update `useLeatherCalculation` deps if needed.

## Adding A New Animal Variant

1. Add value to `AnimalVariant` union in `types/leather.ts`.
2. Update `VALID_ANIMALS` set in `routing/appStateRouting.ts`.
3. Update `getSelectedHideProfile` in `lib/hideProfileAllocation.ts` to handle the new variant's hide profile.
4. Add the hide images to `public/leather/hides/`.
5. Add i18n keys for labels.
6. Only applies to `size === "small"` hides — the URL parser enforces this via `normalizeAnimalVariant`.
