# UI Redesign Audit

## Current State

The current tree is no longer in the middle of the earlier shell redesign. The forge-themed shell and the metallurgy feature split are already landed.

## Preserved And Improved

- The app shell has already been reorganized around a desktop left rail and a dedicated result rail.
- Theme tokens in `src/index.css` now follow the charcoal/copper/parchment palette from `ui-improvements/palettes/alchemist_s_crucible/DESIGN.md`.
- Calculator controls, crucible inputs, result guidance, composition display, planner, reference, and about content all live in the metallurgy feature rather than being scattered across top-level app folders.
- The result area still centers the real "Current Product" concept with local crucible imagery and calculation output.
- The reference screen remains a searchable, filterable, card-style browser that matches the current shell.
- Planner, reference, and about now coexist in the same navigation model without introducing React Router.

## Architectural Notes Worth Remembering

- `src/App.tsx` no longer owns metallurgy state. Zustand does, via `src/features/metallurgy/store/useMetallurgyStore.ts`.
- Browser history and deep-link preservation are handled in `src/features/metallurgy/store/useMetallurgyUrlSync.ts`.
- Manual route parsing and query serialization live in `src/features/metallurgy/routing/appStateRouting.ts`.
- Runtime route definitions, SEO metadata routing, and sitemap generation share `src/features/metallurgy/routing/routes.ts`.
- Top-level metallurgy compatibility shims were intentionally removed. Shared code should import the feature directly.

## Residual Risks

- The routing model is still manual. That is intentional, but future changes need to preserve the current query-string contract and `popstate` behavior.
- Locale-prefixed URLs and route-aware SEO are coupled to route generation; changes to route paths must be reflected through the shared route manifest rather than ad hoc edits.
- Future cross-domain work should avoid pushing locale, theme, or shell preferences into Zustand unless there is a concrete need.

## Current Visual Direction

- Desktop: collapsible left rail, wide main workspace, sticky right rail.
- Mobile: compact header, bottom nav, stacked workflow.
- Atmosphere: dark forge surfaces, copper accents, restrained glow, real game imagery only.
- Tone: utility-first; no fake account/session/dashboard language.
