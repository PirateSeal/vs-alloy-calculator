# Adding A New Domain Feature

> Step-by-step guide for agents adding a new top-level domain (like pottery or leatherwork).
> Follow this to keep the feature-boundary pattern consistent.

## Checklist

### 1. Create the feature directory

```
src/features/<name>/
  index.ts                  # export { <Name>App }
  <Name>App.tsx             # feature composition root
  types/<name>.ts           # domain types
  data/<data>.ts            # static data / recipes / constants
  lib/<name>Logic.ts        # pure domain logic (no React)
  store/use<Name>Store.ts   # Zustand store
  store/use<Name>View.ts    # view selector hook (optional)
  store/use<Name>UrlSync.ts # pushState/popstate hydration
  routing/routes.ts         # VIEW_PATHS + APP_ROUTES
  routing/appStateRouting.ts # query serialization/deserialization
  components/               # feature UI components
```

### 2. Define types

In `types/<name>.ts`:
- Define the view union: `export type <Name>View = "<name>-calculator" | "<name>-planner"` (or whatever views you need).
- All domain types live here.

### 3. Define routes

In `routing/routes.ts`:
```ts
import type { <Name>View } from "@/features/<name>/types/<name>";

export const <NAME>_VIEW_PATHS: Record<<Name>View, string> = {
  "<name>-calculator": "/<name>/",
  "<name>-planner": "/<name>/planner/",
};

export const <NAME>_APP_ROUTES = [
  <NAME>_VIEW_PATHS["<name>-calculator"],
  <NAME>_VIEW_PATHS["<name>-planner"],
] as const;
```

### 4. Register routes in the top-level manifest

In `src/routing/routes.ts`:
1. Import `<NAME>_APP_ROUTES` and `<NAME>_VIEW_PATHS` from the feature.
2. Add `...<NAME>_APP_ROUTES` to `APP_STATIC_ROUTES`.
3. Add path-matching cases to `getCanonicalAppPath`, `getAppNavTargetFromPath`, `getAppDomainFromPath`.
4. Add `getLocalized<Name>Path` helper.

### 5. Update app-level types

In `src/types/app.ts`:
1. Add `"<name>"` to `AppDomain`.
2. Add `<Name>View` values to `AppNavTarget` (it's a union — import the type).

`ReferenceTab` is `AppDomain`, so the new domain gets a reference tab automatically.

### 6. Build the store

In `store/use<Name>Store.ts`:
- Use Zustand `create`.
- Initialize state from `window.location` on first render.
- Expose `hydrateFromLocation(pathname, search)` — called by `App.tsx` on navigation.
- Pattern: see `usePotteryStore.ts` or `useLeatherStore.ts`.

### 7. Write URL routing helpers

In `routing/appStateRouting.ts`:
- `createDefault<Name><View>State()` — default state factory.
- `parse<Name><View>StateFromSearch(search)` — URLSearchParams → state.
- `build<Name><View>Search(state)` — state → URLSearchParams string (omit defaults).
- `get<Name>ViewFromPath(pathname)` — pathname → view.
- `getPathnameFor<Name>View(pathname, view)` — view → locale-aware pathname.

### 8. Wire navigation in App.tsx

1. Import the store and routing helpers.
2. Add a `navigateTo<Name>` callback (pattern: `navigateToPottery`).
3. Add a case in `handleSharedNavigation`.
4. Extend `shellDomain` derivation to include the new target values.
5. Add the app component to the render tree: `activeTarget === "<name>-calculator" || activeTarget === "<name>-planner" ? (<Name>App /> ) : ...`.

Consider lazy-loading if the feature is large:
```ts
const <Name>App = lazy(() =>
  import("./features/<name>").then((m) => ({ default: m.<Name>App })),
);
```

### 9. Add to SharedReferencePage (if applicable)

If the feature has a reference table:
1. Import the reference component into `src/components/SharedReferencePage.tsx`.
2. Add a tab for `"<name>"` next to the existing tabs.
3. The `#<name>` hash is already handled by `getReferenceTabFromHash` once you add `"<name>"` to `AppDomain`.

### 10. Add i18n keys

Add all feature string keys to every locale file in `src/i18n/`. Missing keys surface as bare key strings in production.

### 11. Add assets

Static images go under `public/<name>/items/`. Reference them via the recipe/data layer, not hardcoded in components.

### 12. Write tests

- Pure logic in `lib/<name>Logic.ts` → test in `lib/<name>Logic.test.ts`.
- URL routing → test in `routing/appStateRouting.test.ts`.
- Store → test in `store/use<Name>Store.test.ts`.
- Component tests optional, placed alongside the component.

Run `pnpm test` to verify before committing.

## Import Policy

- **Within the feature** (`src/features/<name>/**`): use relative imports.
- **Importing shared code**: use `@/` alias (`@/components/...`, `@/i18n`, `@/lib/utils`).
- **Cross-feature imports**: allowed but use `@/features/<other>/...` alias, not relative.
- **Do not** create top-level re-export shims for feature code.

## What Not To Do

- Do not add feature state to `src/App.tsx` beyond navigation callbacks.
- Do not add feature state to the shell components.
- Do not hardcode locale strings — use `useTranslation` / `t()`.
- Do not hardcode asset paths — derive from data layer.
- Do not duplicate `distributeToSlots`, `amountsToCrucible`, or other metallurgy solver utilities — those are metallurgy-specific; write your own domain logic in your feature.
