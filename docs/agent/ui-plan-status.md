# UI Plan Status

This document tracks the current state of the shipped UI and architecture after the metallurgy feature-boundary and Zustand migration.

## Shipped Structure

- The app shell is stable: collapsible desktop rail, mobile bottom navigation, compact mobile header, footer, theme toggle, locale switcher, and share action are all live.
- The metallurgy domain is isolated under `src/features/metallurgy/`, with shared shell concerns kept outside the feature.
- `src/App.tsx` is now a thin wrapper around `I18nProvider` and `MetallurgyApp`.
- Metallurgy view state is centralized in Zustand and synchronized with the URL/history layer.

## User-Facing Surfaces

- Calculator: dedicated control surface, crucible workspace, result rail, and composition card are live.
- Planner: inventory-driven planning, craftability ranking, and scarcity mode selection are live.
- Reference: searchable, filterable, card-based reference browser is live.
- About: route-backed SEO/supporting content is live.

## Routing And SEO Status

- Routing remains manual and pathname/query based.
- Locale-prefixed routes such as `/fr/planner/` remain supported.
- Runtime navigation, route-aware SEO metadata, and sitemap generation now share the same metallurgy route manifest.
- Browser back/forward restores both metallurgy view state and locale state.

## Validation Status

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm run build:prod`

These all pass on the current tree for the metallurgy/Zustand migration.

## Current Watch Items

- Preserve existing calculator/planner URL compatibility when adding future features.
- Keep the metallurgy route manifest as the only route source of truth for runtime + SEO + sitemap work.
- If a future domain such as leatherwork needs its own state/routing, mirror the current feature-boundary shape instead of widening shared app state by default.
