# 🔥 Vintage Story Alloy Calculator

> A web-based Vintage Story alloy calculator for bronze ratios, crucible planning, nugget counts, and ingot yield.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev/)
[![Deployment](https://img.shields.io/github/actions/workflow/status/PirateSeal/vs-alloy-calculator/deploy.yml?branch=master&label=deployment)](https://github.com/PirateSeal/vs-alloy-calculator/actions)

A dedicated Vintage Story helper for mapping crucible compositions to valid alloy recipes. The calculator simulates the in-game crucible (four slots, 0-128 nuggets each), visualizes metal ratios in real time, and validates whether your composition matches recipes like Tin Bronze, Bismuth Bronze, Black Bronze, Brass, Electrum, and more while showing exact nugget counts and ingot yield.

## ✨ Why This Exists

Tracking alloy breakpoints in spreadsheets becomes error-prone when juggling multiple metals with odd nugget counts or partial ingots. This UI-first calculator:

- 📊 Shows composition percentages in real-time
- ✅ Validates against all 9 Vintage Story alloy recipes
- 🎯 Pre-fills crucibles with perfectly balanced presets
- 🔍 Provides detailed feedback on invalid compositions
- 💡 Suggests exact adjustments to fix near-miss alloys

## 🎯 Key Features

### 🔧 Smart Crucible Editor
- Four independent slots with 0-128 nugget range per slot
- Dual input: sliders for quick adjustments, number inputs for precision
- **Recipe-aware metal filtering** — only shows compatible metals based on current selection
- **Ratio lock mode** — automatically maintains alloy proportions when adjusting amounts

### 📊 Live Composition Analysis
- Real-time conversion from nuggets to units (1 nugget = 5 units)
- Percentage breakdown for each metal
- Color-coded stacked bar chart visualization
- Animated number transitions for smooth updates

### ✅ Intelligent Result Validation
- **Exact match detection** - confirms valid alloy compositions
- **Close match suggestions** - shows how to fix near-miss compositions
- **Contamination warnings** - alerts when unwanted metals are present
- **Per-metal diagnostics** - detailed feedback on each component
- **One-click adjustments** - automatically fix invalid compositions

### 🎨 Preset System
- All 9 Vintage Story alloys supported:
  - Tin Bronze
  - Bismuth Bronze
  - Black Bronze
  - Brass
  - Molybdochalkos
  - Lead Solder
  - Silver Solder
  - Cupronickel
  - Electrum
- Adjustable ingot amount (1-25+ ingots depending on recipe)
- Midpoint percentage calculations for optimal ratios
- Smart distribution across slots with proper rounding
- Maximum ingot calculation per recipe

### 📚 Reference Table
- Complete alloy database with all recipes
- Percentage ranges for each metal component
- Smelting temperatures and usage notes
- Direct links to Vintage Story Wiki

### 🌓 Modern UI/UX
- Light and dark theme support
- Responsive design (optimized for desktop, mobile warning included)
- Smooth animations and transitions
- Accessibility-compliant (WCAG AA), keyboard navigation support

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 6
- **Build Tool**: Vite 8 (Rolldown bundler)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives (`radix-ui`) with shadcn/ui patterns
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Utilities**: clsx, class-variance-authority, tailwind-merge
- **Testing**: Vitest, @testing-library/react, fast-check (property-based)

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Installation

```bash
git clone https://github.com/PirateSeal/vs-alloy-calculator.git
cd vs-alloy-calculator
pnpm install
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Quick production build |
| `pnpm build:prod` | Full production build: lint → type-check → build + stats |
| `pnpm lint` | Check code quality with ESLint |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm preview` | Preview production build locally |

## 📁 Project Structure

```
vs-alloy-calculator/
├── src/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── AlloyReferenceTable.tsx # Lazy-loaded reference tab
│   │   ├── CompositionCard.tsx
│   │   ├── CreditsDialog.tsx       # Attribution modal
│   │   ├── CruciblePanel.tsx
│   │   ├── CrucibleSlotRow.tsx
│   │   ├── Footer.tsx              # Attribution footer
│   │   ├── Header.tsx
│   │   ├── MobileWarning.tsx
│   │   ├── ResultCard.tsx
│   │   └── ThemeToggle.tsx
│   ├── data/
│   │   └── alloys.ts               # Metal definitions + recipe database
│   ├── lib/
│   │   ├── alloyLogic.ts           # Core calculation logic
│   │   ├── economicalStrategy.ts
│   │   ├── maximizationStrategy.ts
│   │   ├── metalRarity.ts
│   │   ├── recipeOptimizer.ts
│   │   ├── recipeValidator.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── alloys.ts
│   │   └── crucible.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── metal-images/               # Game asset images (© Anego Studios)
├── terraform/                      # AWS infrastructure (IaC)
├── build-prod.js
├── LICENSE
└── README.md
```

## 🎮 Usage

### Basic Workflow

1. **Select metals** in each crucible slot from the dropdown
2. **Adjust nugget amounts** using sliders or number inputs
3. **View composition** in real-time with percentage breakdowns
4. **Check results** to see if your mix matches a valid alloy
5. **Use presets** to quickly load perfect alloy compositions

### Ratio Lock Mode

Enable "Lock Ratio" when a valid alloy is loaded. Adjusting any slot automatically scales the others to maintain the alloy ratio — useful for scaling recipes up or down.

### Adjustment Suggestions

For near-miss compositions, the calculator shows exactly how many nuggets to add/remove. Click "Adjust to Valid" to apply automatically.

## 🚢 Deployment

This project uses automated AWS deployment via GitHub Actions and Terraform.

```
GitHub → GitHub Actions → S3 → CloudFront CDN → Route53 → Users
                                      ↓
                              ACM Certificate (HTTPS)
```

For detailed setup instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

The app is a standard static site and can also be deployed to Vercel, Netlify, GitHub Pages, or any static host by building with `pnpm build:prod` and uploading the `dist` folder.

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and run `pnpm lint && pnpm type-check && pnpm test`
4. Open a pull request against `master`

## 📄 License

Source code is licensed under the [MIT License](LICENSE).

Game assets (images, logo) and alloy data are property of [Anego Studios](https://www.vintagestory.at) / Vintage Story and are used here for fan/community purposes. This project is not affiliated with Anego Studios.

## 🙏 Acknowledgments

- **[Vintage Story](https://www.vintagestory.at)** (Anego Studios) — game, assets, and alloy data
- **[Vintage Story Wiki](https://wiki.vintagestory.at)** — alloy recipes and metal data
- **[Radix UI](https://www.radix-ui.com/)** — accessible component primitives (MIT)
- **[shadcn/ui](https://ui.shadcn.com/)** — UI component patterns (MIT)
- **[Framer Motion](https://www.framer.com/motion)** — animations (MIT)
- **[Lucide](https://lucide.dev)** — icons (ISC)
- **Nunito & JetBrains Mono** — fonts via Google Fonts (SIL OFL 1.1)

---

Made with ❤️ for the Vintage Story community
