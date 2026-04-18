# Agent Guide

This file is the entry point for future codebase exploration in `vs-alloy-calculator`.

## What This App Is

- React + TypeScript + Vite single-page app for Vintage Story alloy calculation.
- Two real user surfaces: `Calculator` and `Reference`.
- Core data flow: `src/data/alloys.ts` -> `src/lib/alloyLogic.ts` -> `src/App.tsx` -> UI components in `src/components/`.
- URL state is part of the product contract: slot params use `s0..s3`, selected recipe uses `r`.

## Where To Start

- App shell and tab orchestration: [src/App.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/App.tsx)
- Shared theme tokens and global surface language: [src/index.css](C:/Users/tcous/dev/vs-alloy-calculator/src/index.css)
- Calculator shell/navigation: [src/components/ShellNavigation.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/ShellNavigation.tsx)
- Calculator workspace: [src/components/CalculatorControls.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/CalculatorControls.tsx), [src/components/CruciblePanel.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/CruciblePanel.tsx), [src/components/CrucibleSlotRow.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/CrucibleSlotRow.tsx)
- Result rail: [src/components/ResultCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/ResultCard.tsx), [src/components/CompositionCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/CompositionCard.tsx)
- Reference surface: [src/components/AlloyReferenceTable.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/AlloyReferenceTable.tsx)
- i18n provider/routing: [src/i18n/provider.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/i18n/provider.tsx), [src/i18n/routing.ts](C:/Users/tcous/dev/vs-alloy-calculator/src/i18n/routing.ts)

## Current UI Direction

- The in-progress redesign is driven by the materials in `ui-improvements/`.
- The live implementation already moved away from the old centered layout into a mockup-inspired shell with:
- a collapsible desktop left rail
- a mobile bottom nav
- a right-side result rail
- darker forge/copper theming through Tailwind v4 tokens
- a card-based reference experience instead of the older plain table feel

## Supporting Docs

- Codebase map: [docs/agent/codebase-map.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/codebase-map.md)
- UI redesign audit: [docs/agent/ui-redesign-audit.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/ui-redesign-audit.md)
- Plan implementation status: [docs/agent/ui-plan-status.md](C:/Users/tcous/dev/vs-alloy-calculator/docs/agent/ui-plan-status.md)

## Working Rules

- Treat `ui-improvements/codex-plan.md` as the redesign entry point.
- Preserve alloy logic, URL schema, locale behavior, and translation notices.
- Prefer editing existing UI components over introducing new frameworks or abstractions.
- Run `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm run build:prod` before considering the pass complete.
