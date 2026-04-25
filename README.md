# Vintage Story Calculator Suite

> Browser tools for planning Vintage Story metallurgy, pottery, and leatherwork workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev/)
[![Deployment](https://img.shields.io/github/actions/workflow/status/PirateSeal/vs-alloy-calculator/deploy.yml?branch=master&label=deployment)](https://github.com/PirateSeal/vs-alloy-calculator/actions)

This project started as a Vintage Story alloy calculator and is now a multi-domain crafting helper. It keeps the calculations client-side, makes each tool shareable through URL state, and ships localized static routes for search engines and social previews.

## Live App

- Overview: [vs-calculator.tcousin.com](https://vs-calculator.tcousin.com/)
- Metallurgy calculator: [vs-calculator.tcousin.com/calculator/](https://vs-calculator.tcousin.com/calculator/)
- Metallurgy planner: [vs-calculator.tcousin.com/planner/](https://vs-calculator.tcousin.com/planner/)
- Pottery calculator: [vs-calculator.tcousin.com/pottery/](https://vs-calculator.tcousin.com/pottery/)
- Pottery planner: [vs-calculator.tcousin.com/pottery/planner/](https://vs-calculator.tcousin.com/pottery/planner/)
- Leatherwork calculator: [vs-calculator.tcousin.com/leather/](https://vs-calculator.tcousin.com/leather/)
- Shared reference: [vs-calculator.tcousin.com/reference/](https://vs-calculator.tcousin.com/reference/)

## What It Does

### Metallurgy

- Simulates the in-game four-slot crucible with 0-128 nuggets per slot.
- Validates compositions against all supported alloy recipes, including Tin Bronze, Bismuth Bronze, Black Bronze, Brass, Molybdochalkos, Lead Solder, Silver Solder, Cupronickel, and Electrum.
- Shows percentage breakdowns, contaminants, near-match diagnostics, and exact add/remove suggestions.
- Generates balanced presets and optimized crucible fills.
- Includes an inventory-driven planner for target ingot counts and scarcity modes.

### Pottery

- Calculates clay cost and actual output for individual pottery recipes.
- Plans multi-item production batches from regular clay and fire clay inventory.
- Handles the fire-clay substitution rule: fire clay can cover any-clay recipes after fire-only demand is reserved, but regular clay cannot replace fire clay.
- Schedules pit kiln and beehive kiln firings with fuel, sticks, dry grass, duration, and capacity rules.
- Covers cooking, storage, agriculture, building, utility, and mold recipes.

### Leatherwork

- Plans leather tanning from raw hides through soaking, scraping, weak tannin, strong tannin, and finishing.
- Plans pelt curing workflows with fat, barrel, and duration requirements.
- Supports hide sizes, small-hide animal variants, bear variants, lime vs. borax preparation, and target-leather back-calculation.
- Produces a step-by-step pipeline, aggregate shopping list, and summary metrics.

### Shared Product Features

- Route-based navigation without React Router.
- Shareable URLs for every calculator and planner state.
- Shared reference page with metallurgy, pottery, and leather tabs.
- Light/dark theme, responsive shell navigation, and accessible shadcn/Radix UI primitives.
- Locale-prefixed routes for English, French, German, Spanish, Russian, Chinese, Japanese, Korean, Polish, and Portuguese.
- Route-aware SEO metadata, hreflang alternates, sitemap generation, and prerendered no-JS body copy.

## Tech Stack

- **Frontend**: React 19 + TypeScript 6
- **Build tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **UI primitives**: Radix UI and shadcn/ui patterns
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Testing**: Vitest, Testing Library, jsdom, fast-check
- **Deployment**: GitHub Actions, S3, CloudFront, Route53, ACM, Terraform

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9.15.0

### Run Locally

```bash
git clone https://github.com/PirateSeal/vs-alloy-calculator.git
cd vs-alloy-calculator
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:5173`.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | TypeScript compile plus Vite production build |
| `pnpm build:prod` | Clean, lint, type-check, build, and print stats |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint auto-fix |
| `pnpm type-check` | Run `tsc --noEmit` |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm preview` | Preview the production build locally |

Recommended local gate before opening a PR:

```bash
pnpm lint && pnpm type-check && pnpm test
```

## Project Structure

```text
src/
  App.tsx                         # thin shell: navigation callbacks and mounted feature apps
  components/                     # shared shell, reference page, footer, UI primitives
  features/
    metallurgy/                   # alloy calculator, alloy planner, recipe reference
    pottery/                      # pottery calculator, batch planner, kiln planning
    leatherwork/                  # leather and pelt workflow calculator
  i18n/                           # locale dictionaries, routing, SEO, sitemap
  lib/                            # shared utilities, analytics, theme helpers
  routing/routes.ts               # top-level route manifest
  types/app.ts                    # shared app navigation/domain types
docs/agent/                       # codebase maps and feature-specific maintainer docs
public/                           # Vintage Story-derived visual assets
terraform/                        # AWS infrastructure
```

Each feature owns its domain types, static data, pure calculation logic, Zustand store, URL serialization, route manifest, and UI components. `src/routing/routes.ts` and the per-feature route manifests are the source of truth for navigation, SEO, and sitemap output.

## URL State

The app treats public URLs as a product contract. Default values are omitted, invalid parameters fall back safely, and locale-prefixed paths are supported.

| Tool | Path | Main query params |
|------|------|-------------------|
| Metallurgy calculator | `/calculator/` | `s0..s3`, `r` |
| Metallurgy planner | `/planner/` | `mode`, `recipe`, `target`, `inv_<metalId>` |
| Pottery calculator | `/pottery/` | `item`, `qty` |
| Pottery planner | `/pottery/planner/` | `plan`, `inv-any`, `inv-fire`, `kiln`, `fuel` |
| Leatherwork | `/leather/` | `workflow`, `mode`, `size`, `animal`, `bear`, `hides`, `target`, `solvent` |

See [docs/agent/url-contracts.md](docs/agent/url-contracts.md) for the complete contract.

## Maintainer Docs

Agent-facing documentation lives in [docs/agent/README.md](docs/agent/README.md). Useful entry points:

- [Codebase map](docs/agent/codebase-map.md)
- [Metallurgy feature](docs/agent/metallurgy-feature.md)
- [Pottery feature](docs/agent/pottery-feature.md)
- [Leatherwork feature](docs/agent/leatherwork-feature.md)
- [Adding a feature](docs/agent/adding-a-feature.md)

## Deployment

Pushes and pull requests to `master` run build and test validation. Version tags matching `v*` run the deployment job:

1. Build and test with coverage.
2. Upload static assets to S3 with cache rules by file type.
3. Invalidate CloudFront.
4. Create a GitHub Release with `build.zip`.

Infrastructure is managed with Terraform in [terraform/](terraform/). Deployment details are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run `pnpm lint && pnpm type-check && pnpm test`.
5. Open a pull request against `master`.

For architecture-sensitive changes, read [docs/agent/codebase-map.md](docs/agent/codebase-map.md) first.

## License And Attribution

Source code is licensed under the [MIT License](LICENSE).

Vintage Story game assets, names, and underlying game data belong to [Anego Studios](https://www.vintagestory.at). They are used here for fan/community tooling. This project is not affiliated with Anego Studios.

Thanks to:

- [Vintage Story](https://www.vintagestory.at) and [Vintage Story Wiki](https://wiki.vintagestory.at)
- [React](https://react.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide](https://lucide.dev/)
