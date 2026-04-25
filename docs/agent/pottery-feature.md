# Pottery Feature

> Agent reference for `src/features/pottery/`. Added 2026-04-25.

## What It Does

Pottery planner for Vintage Story. Two tools:
1. **Calculator** (`/pottery/`) — pick a recipe + quantity, see clay cost and firing requirements.
2. **Planner** (`/pottery/planner/`) — multi-item production plan with clay inventory tracking and kiln scheduling.

## Domain Concepts

### Clay Types

| Type | Description |
|------|-------------|
| `"any"` | Regular clay (can substitute fire clay) |
| `"fire"` | Fire clay only (clay oven, etc.) |

Feasibility logic: fire clay is consumed by fire-clay items first; leftover fire clay can substitute for any-clay items. Any-clay items cannot substitute fire clay.

### Recipes (`data/recipes.ts`)

Each `PotteryRecipe` has:
- `id`: slug used as URL param and image filename.
- `clayCost` / `outputCount`: base recipe. Some items craft multiple outputs.
- `batchRecipe`: optional override for crafting 4 at once (e.g., bowls). Some batches save clay vs. 4× single.
- `minCraft` + `outputCount > 1`: indicates minimum craft quantity is `outputCount` (e.g., shingles always craft 12).
- `pitKilnCapacity`: how many of this item fit in one pit kiln firing cycle.
- `beehiveClass`: which beehive kiln capacity class this item falls into.
- `requiresFiring`: false for clay oven (placed without firing).
- `clayType`: `"any"` or `"fire"`.
- `clayPerItem`: derived field (`clayCost / outputCount`), set by `recipe()` factory.
- `imageSrc`: `/pottery/items/<id>.png`, set by `recipe()` factory. Do not hardcode elsewhere.

Categories: `cooking`, `storage`, `agriculture`, `building`, `utility`, `molds`.

### Kiln Modes

**Pit kiln** (`"pit"`):
- Sequential: each item type is fired in its own set of cycles.
- `pitKilnCapacity` items per cycle.
- Each cycle costs 10 dry grass + 8 sticks + fuel (4 per cycle for most; 8 for storage vessel).
- Duration per cycle varies by fuel type (10–20 hours).

**Beehive kiln** (`"beehive"`):
- Items grouped by `BeehiveClass`: `"small"` (72/firing), `"full-block"` (18/firing), `"storage-vessel"` (27/firing), `"shingles"` (5184/firing).
- Each class fires independently; total firings = max across classes.
- Fixed duration: 10.9 hours/firing regardless of fuel.
- Fuel per firing varies by fuel type.

### Fuel Options (`lib/potteryLogic.ts:KILN_FUEL_OPTIONS`)

| Type | Pit Duration (hr/cycle) | Pit Fuel/Cycle | Beehive Fuel/Firing |
|------|------------------------|----------------|---------------------|
| firewood | 20 | 4 | 252 |
| peat | 16 | 4 | 216 |
| brown-coal | 14 | 4 | 54 |
| black-coal | 12 | 4 | 54 |
| charcoal | 10 | 4 | 54 |
| coke | 10 | 4 | 54 |

Default: `firewood`.

## Key Logic Functions (`lib/potteryLogic.ts`)

| Function | Purpose |
|----------|---------|
| `calcClayCost(recipe, qty)` | Clay needed for `qty` items, respecting batch/minCraft rules |
| `calcCraftedOutput(recipe, qty)` | Actual output count (rounds up to batch boundary for minCraft items) |
| `calcMaxCraftable(inventory, recipe)` | Max craftable given clay inventory |
| `calcFeasibility(inventory, plan)` | Returns `PotteryFeasibility`: shortfalls, leftovers, total clay |
| `hydratePlanItems(plan, recipeById)` | Converts `PotteryPlanItem[]` → `PotteryPlanInput[]` by resolving recipe refs |
| `getFireablePlan(plan)` | Filters to items that require firing and have kiln data |
| `calcPitKilnPlan(plan, fuelType)` | Full pit kiln schedule: cycles, dry grass, sticks, fuel, duration |
| `calcBeehiveKilnPlan(plan, fuelType)` | Full beehive schedule: firings by class, fuel, duration |
| `clampPositiveInt(value, min, max)` | Safe integer clamp (min=1, max=9999) |
| `getKilnFuelOption(fuelType)` | Looks up fuel option, falls back to firewood |

## State And Store (`store/usePotteryStore.ts`)

```ts
interface PotteryStoreState {
  activeView: PotteryView;           // "pottery-calculator" | "pottery-planner"
  calculatorState: PotteryCalculatorState;
  plannerState: PotteryPlannerState;
  setActiveView(view): void;
  setCalculatorState(update): void;
  setPlannerState(update): void;
  hydrateFromLocation(pathname, search): void;
}
```

`PotteryCalculatorState`: `{ recipeId: string | null, quantity: number }`.

`PotteryPlannerState`: `{ plan: PotteryPlanItem[], invAny: number, invFire: number, kilnMode: KilnMode, fuelType: KilnFuelType }`.

Store initializes from `window.location` on first render. `hydrateFromLocation` is called by `App.tsx` navigation handlers on in-app navigation.

## URL Contract

See `docs/agent/url-contracts.md` for the full spec.

- Calculator: `/pottery/?item=<recipeId>&qty=<n>`
- Planner: `/pottery/planner/?plan=<id>:<qty>,<id>:<qty>&inv-any=<n>&inv-fire=<n>&kiln=<pit|beehive>&fuel=<type>`
- Default params are omitted from the URL (e.g., `qty=1` not serialized, `kiln=pit` not serialized, `fuel=firewood` not serialized).

## Assets

Recipe images live at `public/pottery/items/<recipe.id>.png`. The `recipe()` factory function in `data/recipes.ts` sets `imageSrc` automatically. Do not hardcode asset paths in components — always use `recipe.imageSrc`.

Kiln/fuel images are referenced from `public/pottery/items/` as well (e.g., `Charcoal.png`, `Coke.png`, `Firewood.png`).

## Adding A New Pottery Recipe

1. Add entry to `POTTERY_RECIPES` in `data/recipes.ts` using the `recipe()` factory.
2. Add the image to `public/pottery/items/<id>.png`.
3. Add i18n key `pottery.item.<id>` to all locale files in `src/i18n/`.
4. No logic changes needed unless the item has unusual firing rules.

## Adding A New Kiln Fuel

1. Add `KilnFuelType` value to `src/features/pottery/types/pottery.ts`.
2. Add entry to `KILN_FUEL_OPTIONS` in `lib/potteryLogic.ts`.
3. Add i18n key `pottery.fuel.<type>` to all locale files.
4. Add the fuel image to `public/pottery/items/<Name>.png`.
