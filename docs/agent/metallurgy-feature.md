# Metallurgy Feature

> Agent reference for `src/features/metallurgy/`. Primary domain; landed before leatherwork and pottery.

## What It Does

Two tools for Vintage Story alloy calculation:
1. **Calculator** (`/calculator/`) — compose a 4-slot crucible, identify matching alloy recipes, detect contamination, get suggested adjustments.
2. **Planner** (`/planner/`) — given a metal inventory and target ingot count, compute an optimal production run per recipe.

## Domain Concepts

### Units

| Constant | Value | Location |
|----------|-------|----------|
| `UNITS_PER_NUGGET` | 5 | `lib/constants.ts` |
| `NUGGETS_PER_INGOT` | 20 | `lib/constants.ts` |
| `UNITS_PER_INGOT` | 100 | `lib/constants.ts` |
| `MAX_NUGGETS_PER_SLOT` | 128 | `lib/constants.ts` |
| `MAX_CRUCIBLE_SLOTS` | 4 | `lib/constants.ts` |
| `PERCENTAGE_TOLERANCE` | 0.01% | `lib/constants.ts` |
| `CONTAMINATION_THRESHOLD` | 0.5% | `lib/constants.ts` |

Always import from `lib/constants.ts`. Never re-define locally.

### Metals (`data/alloys.ts:METALS`)

| ID | Color | Ore nugget image |
|----|-------|-----------------|
| `copper` | #B87333 | `Nugget-nativecopper.png` |
| `tin` | #C0C0C0 | `Nugget-cassiterite.png` |
| `zinc` | #7F8C8D | `Nugget-sphalerite.png` |
| `bismuth` | #E8B4F0 | `Nugget-bismuthinite.png` |
| `gold` | #FFD700 | `Nugget_nativegold.png` |
| `silver` | #D8D8D8 | `Nugget-nativesilver.png` |
| `lead` | #5D6D7E | `Nugget-galena.png` |
| `nickel` | #8C9A9E | `Nugget-pentlandite.png` |

Nugget images live under `public/metal-images/`. The `Metal.nuggetImage` field stores the full path.

### Alloy Recipes (`data/alloys.ts:ALLOY_RECIPES`)

| ID | Components (% range) | Melt °C |
|----|----------------------|---------|
| `tin-bronze` | Cu 88–92, Sn 8–12 | 950 |
| `bismuth-bronze` | Cu 50–70, Zn 20–30, Bi 10–20 | 850 |
| `black-bronze` | Cu 68–84, Ag 8–16, Au 8–16 | 1020 |
| `brass` | Cu 60–70, Zn 30–40 | 920 |
| `molybdochalkos` | Cu 8–12, Pb 88–92 | 902 |
| `lead-solder` | Pb 45–55, Sn 45–55 | 327 |
| `silver-solder` | Ag 40–50, Sn 50–60 | 758 |
| `cupronickel` | Cu 65–75, Ni 25–35 | 1171 |
| `electrum` | Au 40–60, Ag 40–60 | 1010 |

`AlloyRecipe.components[].minPercent` and `maxPercent` must collectively allow 100% compositions. `meltTempC` is display-only.

### Crucible

4 slots (`CrucibleState.slots: CrucibleSlot[]`). Each slot: `{ metalId: MetalId | null, nuggets: number }`. Max 128 nuggets per slot.

Multiple slots of the same metal are legal — `aggregateCrucible` sums them. The calculator UI enforces one metal per slot.

### Types To Know

```ts
// Canonical nugget-level amount — used by solver, planner, rarity
interface MetalNuggetAmount { metalId: MetalId; nuggets: number; }

// Extended amount — output of aggregateCrucible
interface MetalAmount extends MetalNuggetAmount { units: number; percent: number; }

// Planner inventory — one entry per metal
type InventoryState = Record<MetalId, number>; // values = nugget count

type MetallurgyView = "calculator" | "planner";

type ScarcityMode = "balanced" | "economical" | "preserve-copper" | "max-output";
```

Always import `MetalNuggetAmount` and `MetalAmount` from `types/alloys.ts`, not from `lib/alloyLogic.ts` (which re-exports for convenience).

## Key Logic Functions

### Calculator logic (`lib/alloyLogic.ts`)

| Function | Purpose |
|----------|---------|
| `aggregateCrucible(crucible)` | Sum nuggets per metal → `MetalAmount[]` with percentages |
| `evaluateAlloys(amounts, recipes)` | Score all recipes; return `EvaluationResult` with `bestMatch` |
| `createPresetForAlloy(recipe, targetNuggets)` | Crucible preset at target ingot count for a recipe |
| `adjustCrucibleForAlloy(crucible, recipe)` | Auto-adjust slot amounts to put crucible inside recipe tolerance |
| `calculateNuggetAdjustments(amounts, recipe)` | `NuggetAdjustment[]` showing add/remove per metal to hit recipe |

`evaluateAlloys` returns `AlloyMatchDetail[]` sorted by score. `bestMatch` is the first exact match, or the highest-scoring near-match. Violations include metals outside recipe % range and contaminants (non-recipe metals above `CONTAMINATION_THRESHOLD`).

### Shared solver utilities (`lib/shared/crucibleAllocation.ts`)

Do not duplicate. Import directly.

| Export | Purpose |
|--------|---------|
| `distributeToSlots(amounts)` | Pack `MetalNuggetAmount[]` into 4 slots |
| `amountsToCrucible(amounts)` | Same, returns `CrucibleState` |
| `countSlotsUsed(amounts)` | Count non-empty slots |
| `fitsInFourSlots(amounts)` | Boolean — fits within 4-slot limit |
| `calculatePercentages(amounts)` | Compute % share from nugget amounts |

### Optimizer (`lib/recipeOptimizer.ts`)

`optimizeRecipe(recipe, inventory, mode)` dispatches to:
- **Maximize** (`lib/maximizationStrategy.ts`): fills all available slots to produce the most ingots. Ignores rarity.
- **Economical** (`lib/economicalStrategy.ts`): reaches target ingot count while minimizing rare metal usage (uses `calculateRarityCost`).

### Validator (`lib/recipeValidator.ts`)

`validateRecipe(crucible, recipe)` — checks slot count, per-slot capacity, and percentage compliance within `PERCENTAGE_TOLERANCE`. Returns validation result used by the UI to show pass/fail state.

### Planner (`lib/planner.ts`)

Entry point: `computePlan(recipe, inventory, targetIngots, scarcityMode)` → `RecipePlannerResult`.

Internally:
- Uses `visitValidConfigurations` from `lib/shared/configurationSolver.ts` (backtracking).
- Builds `BatchRun[]` — one run per crucible fill, each consuming from the inventory.
- `ScarcityMode` controls run candidate selection heuristic.
- Caches run candidates in `runCandidateCache` (module-level `Map`).

Exported helpers: `normalizeInventoryState`, `getInventoryTotalNuggets`, `hasInventoryForCost`, `subtractInventory`.

### Metal rarity (`lib/metalRarity.ts`)

`calculateRarityCost(amounts)` — weighted sum based on per-metal rarity scores. Lower = more common. Used by economical strategy and planner scarcity ranking.

## State And Store (`store/useMetallurgyStore.ts`)

```ts
interface MetallurgyStoreState {
  activeView: MetallurgyView;         // "calculator" | "planner"
  calculatorCrucible: CrucibleState;
  selectedRecipeId: string | null;
  plannerState: PlannerState;
  setActiveView(view): void;
  setCrucible(update): void;
  setSelectedRecipeId(id): void;
  setPlannerState(update): void;
  hydrateFromLocation(pathname, search): void;
}
```

`PlannerState`: `{ scarcityMode, recipeId, targetIngots, inventory }`.

Store initializes from `window.location` on first render. Only one view's state is hydrated from URL at a time — switching views does not re-parse the URL.

Additional hooks:
- `store/useMetallurgyView.ts` — lightweight view selector.
- `store/useMetallurgyUrlSync.ts` — `pushState`/`replaceState`/`popstate` that serializes crucible + planner state back to the URL and updates SEO metadata.

## URL Contract

See `docs/agent/url-contracts.md` for the full spec.

**Calculator** — `/calculator/?s0=<metalId>:<nuggets>&s1=...&s2=...&s3=...&r=<recipeId>`
- Up to 4 slot params (`s0`–`s3`). Empty slots omitted.
- `r` is the selected recipe ID. Omit if none.

**Planner** — `/planner/?mode=<scarcityMode>&recipe=<id>&target=<n>&inv_<metalId>=<nuggets>`
- `mode` default: `"balanced"` (omitted).
- `target` default: `1` (omitted).
- `inv_<metalId>` params omitted if 0.

## Components

| Component | Purpose |
|-----------|---------|
| `CalculatorControls` | Recipe picker, mode toggle, preset/optimize buttons |
| `CruciblePanel` | 4-slot crucible workspace |
| `CrucibleSlotRow` | Individual slot: metal picker, nugget input, unit display |
| `CompositionCard` | Per-metal percentage bars with color coding |
| `ResultCard` | Match result: recipe name, score, violations, adjustment suggestions |
| `PlannerView` | Inventory inputs, recipe/target selection, batch plan display |
| `AlloyReferenceTable` | Searchable/filterable recipe browser (also used in `SharedReferencePage`) |
| `SeoLandingContent` | Pre-rendered body copy for SEO (hidden in normal use) |

## Adding A New Alloy

1. Extend `MetalId` union in `types/alloys.ts` if a new metal is needed.
2. Add `Metal` entry to `METALS` in `data/alloys.ts` (color + nugget image path).
3. Add image to `public/metal-images/`.
4. Add `AlloyRecipe` to `ALLOY_RECIPES` — components must allow valid 100% compositions.
5. Add i18n keys for recipe name in all locale files.
6. No logic changes needed; `evaluateAlloys` is data-driven.

## Protected Semantics

Do not change the behavior of these functions under any UI refactor:
- `aggregateCrucible` — UI depends on its `MetalAmount[]` output shape.
- `evaluateAlloys` — scoring determines `bestMatch` displayed to users.
- `calculateNuggetAdjustments` — drives the "Adjust to Valid" feature.
- `optimizeRecipe` — drives preset generation.

These are the calculator's core contract. Test coverage lives in `src/lib/alloyLogic.test.ts` (and surrounding test files).
