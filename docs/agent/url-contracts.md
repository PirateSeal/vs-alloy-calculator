# URL Contracts

> All share-link-visible URL contracts in one place. These are public API surface — changing them breaks existing shared links.

## Metallurgy Calculator

Path: `/calculator/`  
Locale: `/<locale>/calculator/`

| Param | Type | Description |
|-------|------|-------------|
| `s0`–`s3` | `<metalId>:<nuggets>` | Crucible slot contents (4 slots). Omit empty slots. |
| `r` | `string` | Selected recipe ID. Omit if none. |

Example: `/calculator/?s0=copper:64&s1=tin:24&r=bronze`

## Metallurgy Planner

Path: `/planner/`  
Locale: `/<locale>/planner/`

| Param | Type | Description |
|-------|------|-------------|
| `mode` | `"maximize" \| "economical"` | Optimizer mode |
| `recipe` | `string` | Target recipe ID |
| `target` | `number` | Target ingot count |
| `inv_<metalId>` | `number` | Inventory nugget count per metal |

Example: `/planner/?mode=maximize&recipe=bronze&target=10&inv_copper=200&inv_tin=80`

## Pottery Calculator

Path: `/pottery/`  
Locale: `/<locale>/pottery/`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `item` | `string` | none | Recipe ID. Omit if no item selected. |
| `qty` | `number` | `1` | Quantity. Omit if 1. |

Example: `/pottery/?item=crock&qty=8`

## Pottery Planner

Path: `/pottery/planner/`  
Locale: `/<locale>/pottery/planner/`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `plan` | `id:qty,id:qty,...` | none | Comma-separated `recipeId:quantity` pairs. Omit if empty. |
| `inv-any` | `number` | `0` | Any-clay inventory. Omit if 0. |
| `inv-fire` | `number` | `0` | Fire-clay inventory. Omit if 0. |
| `kiln` | `"pit" \| "beehive"` | `"pit"` | Kiln mode. Omit if `"pit"`. |
| `fuel` | `KilnFuelType` | `"firewood"` | Fuel type. Omit if `"firewood"`. |

Valid `KilnFuelType` values: `firewood`, `peat`, `brown-coal`, `black-coal`, `charcoal`, `coke`.

Example: `/pottery/planner/?plan=bowl:4,crock:2&inv-any=100&kiln=beehive&fuel=charcoal`

## Leatherwork

Path: `/leather/`  
Locale: `/<locale>/leather/`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `workflow` | `"leather" \| "pelt"` | `"leather"` | Workflow mode. Omit if `"leather"`. |
| `mode` | `"hides" \| "leather"` | `"hides"` | Input mode (leather workflow only). Omit if `"hides"`. |
| `size` | `"small" \| "medium" \| "large" \| "huge"` | `"small"` | Hide size. Ignored if `bear` is present. |
| `animal` | `AnimalVariant` | `"generic"` | Small-hide animal variant. Omit if `"generic"`. |
| `bear` | `BearVariant` | none | Bear variant — overrides `size`. Omit if no bear selected. |
| `hides` | `number` | `1` | Raw hide count (mode=hides). Omit if 1. |
| `target` | `number` | `1` | Target leather count (mode=leather). Omit if 1. |
| `solvent` | `"lime" \| "borax"` | `"lime"` | Preparing solvent (leather workflow). Omit if `"lime"`. |

Valid `AnimalVariant`: `generic`, `fox`, `arctic-fox`, `raccoon` (small hides only).  
Valid `BearVariant`: `sun`, `panda`, `black`, `brown`, `polar`.  
Max count: 999.

Bear implies size: `sun`/`panda` → `large`; `black`/`brown`/`polar` → `huge`. When `bear` is present, `size` param is ignored.

Example: `/leather/?workflow=pelt&size=large&hides=4`  
Example: `/leather/?mode=leather&target=20&solvent=borax`  
Example: `/leather/?bear=brown&hides=3`

## Reference Page

Path: `/reference/`  
Locale: `/<locale>/reference/`

Tab is controlled by the URL hash:
- `#metallurgy` — metallurgy reference (default)
- `#pottery` — pottery reference
- `#leather` — leather reference

## Route Manifest Sources

| File | Exports |
|------|---------|
| `src/routing/routes.ts` | `APP_STATIC_ROUTES`, `OVERVIEW_ROUTE_PATH`, `REFERENCE_ROUTE_PATH`, `LEATHER_ROUTE_PATH`, `LEGACY_*` paths, all nav helpers |
| `src/features/metallurgy/routing/routes.ts` | `METALLURGY_VIEW_PATHS`, `METALLURGY_APP_ROUTES` |
| `src/features/pottery/routing/routes.ts` | `POTTERY_VIEW_PATHS`, `POTTERY_APP_ROUTES` |
| `src/features/leatherwork/routing/routes.ts` | `LEATHER_VIEW_PATH` (re-exports from top-level) |

These manifests feed: runtime nav in `App.tsx`, SEO metadata via `src/i18n/seo.ts`, sitemap generation via `src/i18n/sitemap.ts`.

## Serialization Rules

1. Default values are not serialized. If `qty === 1` the param is omitted.
2. Invalid params are silently dropped on parse (no errors thrown).
3. Unknown recipe IDs are treated as missing (fallback to default).
4. Quantities are clamped to `[1, 9999]` (positive) or `[0, 9999]` (non-negative).
5. Plan items with `qty === 0` are omitted from serialization.
6. Duplicate plan recipe IDs are merged (quantities summed, capped at 9999).

## Locale Prefix

All paths support an optional `/<locale>/` prefix. Supported locales are defined in `src/i18n/locales.ts`. The locale is stripped before route matching and re-prepended by `getLocalizedAppPath` in `src/routing/routes.ts`.

Example: `/fr/pottery/planner/?plan=bowl:4` is valid.
