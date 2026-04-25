# Agent Documentation Index

> Start here. All docs in this directory are targeted at AI agents.

## Files

| File | Purpose |
|------|---------|
| `codebase-map.md` | Directory structure, module responsibilities, contracts. **Canonical reference.** |
| `metallurgy-feature.md` | Metallurgy domain deep-dive: metals, alloys, solver strategies, store, URL contract, how to extend. |
| `leatherwork-feature.md` | Leatherwork domain deep-dive: hide sizes, variants, workflows, calculation pipeline, URL contract. |
| `pottery-feature.md` | Pottery domain deep-dive: recipes, kiln logic, state, URL contract, how to extend. |
| `url-contracts.md` | All share-link-visible URL param specs for all features. Do not break these. |
| `adding-a-feature.md` | Step-by-step checklist for adding a new domain feature (store, routing, types, nav wiring). |
| `ui-plan-status.md` | What is shipped, what is in-progress, watch items. Update after each feature or refactor. |
| `ui-redesign-audit.md` | Architectural state-of-the-world: shell decisions, residual risks, visual direction. |

## Where To Start For Common Tasks

**Understanding a module** → `codebase-map.md`

**Adding a recipe/item** → see the relevant feature doc (`metallurgy-feature.md`, `leatherwork-feature.md`, `pottery-feature.md`)

**Adding a new domain** → `adding-a-feature.md`

**Touching routing or URLs** → `url-contracts.md` + `codebase-map.md` (Product Contracts section)

**Understanding what's shipped vs. pending** → `ui-plan-status.md`

**Shell/navigation architecture** → `ui-redesign-audit.md`

## Key Invariants

1. **Route manifests are the single source of truth.** `src/routing/routes.ts` + per-feature `routing/routes.ts` feed runtime nav, SEO, and sitemap. Never hardcode paths anywhere else.
2. **Each feature is self-contained.** Own store, own routing, own components. `App.tsx` only owns navigation callbacks and active-target state.
3. **URL contracts are public API.** Changing query param names breaks existing shared links. Add params; never rename or remove.
4. **Import policy is enforced.** Relative imports within a feature; `@/` alias for cross-feature or shared code. No top-level re-export shims.
5. **`AppDomain` and `AppNavTarget` in `src/types/app.ts` must be updated** when a new domain is added. The shell, reference page, and analytics all depend on these types.
