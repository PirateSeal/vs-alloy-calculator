# 🔥 Vintage Story Alloy Calculator

> A comprehensive web-based calculator for Vintage Story alloy crafting

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)

A dedicated Vintage Story helper for mapping crucible compositions to valid alloy recipes. The calculator simulates the in-game crucible (four slots, 0‑128 nuggets each), visualizes metal ratios in real-time, and validates whether your composition matches known recipes like Tin Bronze, Bismuth Bronze, Black Bronze, Brass, Electrum, and more.

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
- **Recipe-aware metal filtering** - only shows compatible metals based on current selection
- **Ratio lock mode** - automatically maintains alloy proportions when adjusting amounts
- Visual feedback with metal-specific colors

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
- Smelting temperatures
- Usage notes and applications
- Direct links to Vintage Story Wiki

### 🌓 Modern UI/UX
- Light and dark theme support
- Responsive design (optimized for desktop, mobile warning included)
- Smooth animations and transitions
- Accessibility-compliant (WCAG AA)
- Keyboard navigation support

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Icons**: Lucide React
- **Utilities**: clsx, class-variance-authority, tailwind-merge
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vs-alloy-calculator.git
cd vs-alloy-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Quick production build |
| `npm run build:prod` | **Recommended**: Full production build with linting, type checking, and statistics |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run preview` | Preview production build locally |
| `npm run clean` | Remove build artifacts |

### Production Build

For production deployment, use the comprehensive build script:

```bash
npm run build:prod
```

This will:
1. Clean previous build artifacts
2. Run ESLint for code quality
3. Run TypeScript type checking
4. Build optimized production bundle
5. Display build statistics

**Output:**
- Minified JavaScript (~405 KB, ~134 KB gzipped)
- Optimized CSS (~48 KB, ~9 KB gzipped)
- Total bundle: ~1.94 MB uncompressed

## 📁 Project Structure

```
vs-alloy-calculator/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AlloyReferenceTable.tsx
│   │   ├── CompositionCard.tsx
│   │   ├── CruciblePanel.tsx
│   │   ├── CrucibleSlotRow.tsx
│   │   ├── Header.tsx
│   │   ├── MobileWarning.tsx
│   │   ├── ResultCard.tsx
│   │   └── ThemeToggle.tsx
│   ├── data/
│   │   └── alloys.ts       # Metal definitions + recipe database
│   ├── lib/
│   │   ├── alloyLogic.ts   # Core calculation logic
│   │   └── utils.ts        # Utility functions
│   ├── types/
│   │   ├── alloys.ts       # Type definitions for metals/alloys
│   │   └── crucible.ts     # Type definitions for crucible state
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/
│   └── metal-images/       # Metal nugget and ingot images
├── build-prod.js           # Production build script
└── README.md               # This file
```

## 🎮 Usage

### Basic Workflow

1. **Select metals** in each crucible slot from the dropdown
2. **Adjust nugget amounts** using sliders or number inputs
3. **View composition** in real-time with percentage breakdowns
4. **Check results** to see if your mix matches a valid alloy
5. **Use presets** to quickly load perfect alloy compositions

### Advanced Features

**Ratio Lock Mode:**
- Enable "Lock Ratio" when you have a valid alloy loaded
- Adjusting any slot will automatically scale other slots to maintain the alloy ratio
- Perfect for scaling recipes up or down

**Metal Filtering:**
- The calculator automatically filters available metals based on your current selection
- Only shows metals that can form valid alloys with your current composition
- Prevents impossible combinations

**Adjustment Suggestions:**
- For near-miss compositions, the calculator shows exactly how many nuggets to add/remove
- Click "Adjust to Valid" to automatically fix the composition
- Detailed per-metal feedback helps you understand what's wrong

## 🔧 Configuration

### Adding New Alloys

Edit `src/data/alloys.ts` to add new alloy recipes:

```typescript
{
  id: "my-alloy",
  name: "My Custom Alloy",
  components: [
    { metalId: "copper", minPercent: 60, maxPercent: 70 },
    { metalId: "tin", minPercent: 30, maxPercent: 40 },
  ],
  meltTempC: 950,
  notes: "Custom alloy description"
}
```

### Customizing Metals

Edit the `METALS` array in `src/data/alloys.ts`:

```typescript
{
  id: "copper",
  label: "Copper",
  shortLabel: "Cu",
  color: "#B87333",
  nuggetImage: "/metal-images/Nugget-nativecopper.png"
}
```

### Environment Variables

No environment variables are currently required. To add them:

1. Create `.env.production` file
2. Prefix variables with `VITE_`
3. Access via `import.meta.env.VITE_*`

## 🚢 Deployment

[![Deployment Status](https://img.shields.io/github/actions/workflow/status/yourusername/vs-alloy-calculator/deploy.yml?branch=main&label=deployment)](https://github.com/yourusername/vs-alloy-calculator/actions)

This project uses automated AWS deployment with Terraform infrastructure and GitHub Actions CI/CD.

### AWS Architecture

The production deployment uses a modern, scalable AWS architecture:

```
GitHub → GitHub Actions → S3 Bucket → CloudFront CDN → Route53 DNS → Users
                            ↓
                      ACM Certificate (HTTPS)
```

**Infrastructure Components:**
- **S3**: Static website hosting with encryption
- **CloudFront**: Global CDN with HTTP/2 and HTTP/3 support
- **Route53**: DNS management for custom domain
- **ACM**: Free SSL/TLS certificates with auto-renewal
- **IAM**: Secure service account for automated deployments

**Key Features:**
- ✅ Fully automated deployments on push to `main`
- ✅ HTTPS with automatic certificate renewal
- ✅ Global CDN for fast load times worldwide
- ✅ Infrastructure as Code with Terraform
- ✅ Cost-optimized (~$2-3/month)

### Deployment Guide

For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

**Quick Start:**

1. **Deploy Infrastructure** (one-time setup)
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

2. **Configure GitHub Secrets** (one-time setup)
   - Add AWS credentials from Terraform outputs
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions

3. **Deploy Application** (automatic on every push)
   ```bash
   git push origin main
   ```

The application will be live at `https://vs-calculator.tcousin.com` within 5-10 minutes.

### Alternative Deployment Options

The app is a static site and can also be deployed to other hosting services:

**Vercel**
```bash
npm i -g vercel
vercel deploy --prod
```

**Netlify**
1. Run `npm run build:prod`
2. Drag and drop `dist` folder to [netlify.com](https://netlify.com)

**GitHub Pages**
1. Build: `npm run build:prod`
2. Deploy `dist` contents to `gh-pages` branch

**Any Static Host**
- Build with `npm run build:prod`
- Upload contents of `dist` folder to your web server

### Infrastructure Documentation

- **[terraform/README.md](terraform/README.md)** - Terraform infrastructure documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with troubleshooting

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit pull requests

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run linting and type checking: `npm run lint && npm run type-check`
5. Test the build: `npm run build:prod`
6. Commit your changes: `git commit -m "Add my feature"`
7. Push to the branch: `git push origin feature/my-feature`
8. Open a pull request

### Ideas for Future Enhancements

- 💾 Persistence of crucible layouts (localStorage/URL)
- 🔗 Shareable links for compositions
- 📱 Enhanced mobile layout
- 📤 Import/export of presets
- 🎯 Multi-crucible planning
- 📊 Material cost calculator
- 🌍 Internationalization (i18n)
- 🔌 Mod support for custom alloys

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vintage Story** - The amazing voxel survival game this calculator is built for
- [Vintage Story Wiki](https://wiki.vintagestory.at) - Source of alloy data and recipes
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI component patterns
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- Original VS Alloy Calculator inspiration from the community

## 📞 Support

- 🐛 [Report a bug](https://github.com/yourusername/vs-alloy-calculator/issues)
- 💬 [Discussions](https://github.com/yourusername/vs-alloy-calculator/discussions)
- 📧 Email: your.email@example.com

## 🔗 Links

- [Vintage Story Official Website](https://www.vintagestory.at)
- [Vintage Story Wiki](https://wiki.vintagestory.at)
- [Vintage Story Discord](https://discord.gg/vintagestory)

---

Made with ❤️ for the Vintage Story community
