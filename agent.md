# Agent Guide

This file is the entry point for future codebase exploration in `vs-alloy-calculator`.

## What This App Is

- React + TypeScript + Vite single-page app for Vintage Story alloy calculation.
- The active domain is metallurgy, with four route-backed surfaces: `Calculator`, `Planner`, `Reference`, and `About`.
- `src/App.tsx` is now a thin shell that mounts `I18nProvider` and renders `src/features/metallurgy/MetallurgyApp.tsx`.
- Core metallurgy flow: `src/features/metallurgy/data/alloys.ts` -> metallurgy logic/routing/store -> `src/features/metallurgy/MetallurgyApp.tsx` -> UI components.
- URL state is part of the product contract: calculator params use `s0..s3` and `r`; planner params use `mode`, `recipe`, `target`, and `inv_*`.

## Where To Start

- App shell and tab orchestration: [src/App.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/App.tsx)
- Metallurgy feature entrypoint: [src/features/metallurgy/MetallurgyApp.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/MetallurgyApp.tsx)
- Metallurgy Zustand store and URL sync: [src/features/metallurgy/store/useMetallurgyStore.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/store/useMetallurgyStore.ts), [src/features/metallurgy/store/useMetallurgyUrlSync.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/store/useMetallurgyUrlSync.ts)
- Metallurgy route/query helpers: [src/features/metallurgy/routing/appStateRouting.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/routing/appStateRouting.ts), [src/features/metallurgy/routing/routes.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/routing/routes.ts)
- Shared theme tokens and global surface language: [src/index.css](C:/Users/tcous/dev/vs-alloy-calculator/src/index.css)
- Calculator shell/navigation: [src/components/ShellNavigation.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/ShellNavigation.tsx)
- Calculator workspace: [src/features/metallurgy/components/CalculatorControls.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/CalculatorControls.tsx), [src/features/metallurgy/components/CruciblePanel.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/CruciblePanel.tsx), [src/features/metallurgy/components/CrucibleSlotRow.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/CrucibleSlotRow.tsx)
- Result rail: [src/features/metallurgy/components/ResultCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/ResultCard.tsx), [src/features/metallurgy/components/CompositionCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/CompositionCard.tsx)
- Planner, reference, and about surfaces: [src/features/metallurgy/components/PlannerView.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/PlannerView.tsx), [src/features/metallurgy/components/AlloyReferenceTable.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/AlloyReferenceTable.tsx), [src/features/metallurgy/components/SeoLandingContent.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/features/metallurgy/components/SeoLandingContent.tsx)
- i18n provider/routing: [src/i18n/provider.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/i18n/provider.tsx), [src/i18n/routing.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/i18n/routing.ts)
- Route-aware SEO and sitemap inputs: [src/i18n/seo.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/i18n/seo.ts), [vite.config.ts](C:/Users/tcous/dev/vs-alloy-calculator/vite.config.ts)

## Current UI Direction

- The live implementation has already moved away from the old centered layout into a shell with:
- a collapsible desktop left rail
- a mobile bottom nav
- a right-side result rail
- darker forge/copper theming through Tailwind v4 tokens
- a planner surface and dedicated about surface alongside calculator/reference
- a card-based reference experience instead of the older plain table feel

## Supporting Docs

- Codebase map: [docs/agent/codebase-map.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/codebase-map.md)
- UI redesign audit: [docs/agent/ui-redesign-audit.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/ui-redesign-audit.md)
- Plan implementation status: [docs/agent/ui-plan-status.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/ui-plan-status.md)

## Working Rules

- Preserve metallurgy URL/query compatibility, locale-prefixed routing, SEO route awareness, and translation notices.
- Treat `src/features/metallurgy/routing/routes.ts` as the route source of truth for runtime navigation and sitemap/SEO work.
- Keep feature-local imports relative inside `src/features/metallurgy/**`; use `@/` imports for shared or cross-feature modules.
- Prefer extending the current manual routing + Zustand setup over introducing a router abstraction unless the requirements materially change.
- Run `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm run build:prod` before considering the pass complete.
