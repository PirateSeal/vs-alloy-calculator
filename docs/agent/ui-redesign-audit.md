# UI Redesign Audit

## Current State

The current tree is no longer in the middle of the earlier shell redesign. The forge-themed shell, the metallurgy feature split, and the leatherwork feature launch are all landed.

## Preserved And Improved

- App shell reorganized around a desktop left rail and a dedicated result rail.
- Theme tokens in `src/index.css` follow the charcoal/copper/parchment palette from `ui-improvements/palettes/alchemist_s_crucible/DESIGN.md`.
- Calculator controls, crucible inputs, result guidance, composition display, planner, reference, and about content all live in the metallurgy feature rather than scattered across top-level app folders.
- Leatherwork lives alongside metallurgy under `src/features/`, using the same feature-boundary pattern (own Zustand store, own URL sync, own routing manifest, own components).
- Result area still centers the real "Current Product" concept with local crucible imagery and calculation output.
- Reference screen remains a searchable, filterable, card-style browser that matches the current shell.
- Planner, reference, about, and leatherwork coexist in the same navigation model without introducing React Router.

## Architectural Notes Worth Remembering

- `src/App.tsx` no longer owns feature state. Each feature's Zustand store does, via `src/features/metallurgy/store/useMetallurgyStore.ts` and `src/features/leatherwork/store/useLeatherStore.ts`.
- Browser history and deep-link preservation handled per-feature: `useMetallurgyUrlSync.ts` and `useLeatherUrlSync.ts`.
- Manual route parsing and query serialization live in `src/features/<feature>/routing/appStateRouting.ts`. Top-level manifest at `src/routing/routes.ts`.
- Runtime route definitions, SEO metadata routing, and sitemap generation share the top-level + per-feature manifests.
- Metallurgy solver code goes through `lib/shared/crucibleAllocation.ts` and `lib/constants.ts` — do not re-introduce local duplicates of `distributeToSlots`, `amountsToCrucible`, `fitsInFourSlots`, `PERCENTAGE_TOLERANCE`, etc.
- Leather asset paths go through `getHideAssetPath` / `getMaterialAssetPath` exported from `src/features/leatherwork/lib/leather.ts`. Do not hardcode `/leather/...` strings in components.
- Top-level metallurgy compatibility shims were intentionally removed. Shared code imports features directly.

## Residual Risks

- The routing model is still manual. That is intentional, but future changes need to preserve the current query-string contract and `popstate` behavior.
- Locale-prefixed URLs and route-aware SEO are coupled to route generation; changes to route paths must be reflected through the shared route manifest rather than ad hoc edits.
- Future cross-domain work should avoid pushing locale, theme, or shell preferences into Zustand unless there is a concrete need.

## Current Visual Direction

- Desktop: collapsible left rail, wide main workspace, sticky right rail.
- Mobile: compact header, bottom nav, stacked workflow.
- Atmosphere: dark forge surfaces, copper accents, restrained glow, real game imagery only.
- Tone: utility-first; no fake account/session/dashboard language.
