# UI Redesign Audit

> Architectural state-of-the-world. Update when shell or cross-feature architecture changes.

## Current State (2026-04-25)

Three features are live. The forge-themed shell, metallurgy feature split, leatherwork feature launch, and pottery feature launch are all landed.

## Shipped And Preserved

- App shell: collapsible left rail (desktop), compact top header (mobile), bottom nav (mobile), footer. Stable.
- Theme tokens in `src/index.css` follow the charcoal/copper/parchment palette defined in `DESIGN.md`.
- Three features under `src/features/`: metallurgy, pottery, leatherwork. All follow the same feature-boundary pattern (own Zustand store, own URL sync, own routing manifest, own components).
- `SharedReferencePage` provides a unified tabbed reference surface: metallurgy tab, pottery tab, leather tab. Tab is driven by `#<domain>` hash. Previously each domain had its own reference surface.
- Result area (metallurgy) still centers the "Current Product" concept with local crucible imagery.
- Planner, reference, about, pottery, and leatherwork coexist in the same navigation model without React Router.

## Architectural Notes Worth Remembering

- `src/App.tsx` does not own feature state. Each feature's Zustand store does.
- Navigation in `App.tsx` is a set of `useCallback` handlers (`navigateToOverview`, `navigateToReference`, `navigateToLeather`, `navigateToMetallurgy`, `navigateToPottery`) passed down through `AppShellLayout` → `ShellNavigation`.
- Browser history and deep-link preservation handled per-feature by `use*UrlSync.ts` hooks plus `App.tsx`'s `popstate` listener that updates `activeTarget` and `activeDomain`.
- Manual route parsing and query serialization live in `src/features/<feature>/routing/appStateRouting.ts`. Top-level manifest at `src/routing/routes.ts`.
- Metallurgy solver code must go through `lib/shared/crucibleAllocation.ts` and `lib/constants.ts`. No local duplicates.
- Leather asset paths must go through `getHideAssetPath` / `getMaterialAssetPath` from `src/features/leatherwork/lib/leather.ts`.
- Pottery recipe images come from `PotteryRecipe.imageSrc` (set by the `recipe()` factory in `data/recipes.ts`). Pattern: `/pottery/items/<id>.png`.
- `AppDomain` (`"metallurgy" | "leather" | "pottery"`) and `AppNavTarget` are defined in `src/types/app.ts`. This is the canonical type for shell domain switching.
- `LeatherApp` is lazy-loaded (`React.lazy`) to reduce initial bundle size. `MetallurgyApp` and `PotteryApp` are eager.

## Residual Risks

- The routing model is manual. Future changes must preserve each feature's query-string contract and `popstate` behavior.
- Locale-prefixed URLs and route-aware SEO are coupled to route generation; path changes must go through the shared route manifest.
- `SharedReferencePage` now covers all three domains. Adding a fourth domain requires updating its tab model and the `ReferenceTab` type.
- Future cross-domain work should avoid pushing locale, theme, or shell preferences into Zustand unless there is a concrete need.

## Current Visual Direction

- Desktop: collapsible left rail, wide main workspace, sticky right rail (metallurgy only).
- Mobile: compact header, bottom nav, stacked workflow.
- Atmosphere: dark forge surfaces, copper accents, restrained glow, real game imagery only.
- Tone: utility-first; no fake account/session/dashboard language.
