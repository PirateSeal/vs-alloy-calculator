# Changelog

All notable changes to the Vintage Story Alloy Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-19

### Added
- **Performance Optimizations** - Implemented code splitting and lazy loading for the Reference Table, significantly reducing the initial bundle size.
- **Skeleton Loading** - Added a skeleton loading state for the Reference Table to improve perceived performance during navigation.
- **Deployment Caching** - Configured aggressive caching (1 year) for hashed assets and immediate revalidation for index.html to ensure users always get the latest updates without sacrificing performance.

### Changed
- **Build Configuration** - Optimized Vite build to split vendor libraries into separate chunks for better cacheability.

## [1.1.1] - 2025-11-19

### Changed
- **Advanced maximization algorithm** - Replaced heuristic-based optimization with a robust backtracking solver. This ensures the calculator consistently finds the absolute maximum number of ingots for any recipe, including complex edge cases with narrow percentage ranges.
- **Improved tolerance handling** - The optimizer now correctly handles the game's 0.01% tolerance, allowing for more efficient slot usage in specific scenarios (e.g., finding 23 ingots instead of 22 for certain random recipes).
- **Enhanced Alloy Reference Table** - Completely overhauled the reference table with search, sorting, and filtering capabilities. Added visual composition bars, interactive tooltips, and direct wiki links for a better user experience.

## [1.1.0] - 2025-11-18

### Added
- **Recipe optimization system** - Introduced intelligent optimization strategies for alloy recipes with two modes:
  - Economical mode: Minimizes rare metal usage while maintaining valid alloy ratios
  - Maximization mode: Calculates the absolute maximum ingots achievable for each recipe
- **Metal rarity scoring** - Added rarity cost calculation to help players make economical choices
- **Visual sweet spot zones** - Composition card now displays interactive range indicators showing whether each metal is within the valid percentage range for the selected alloy
- **Excess material detection** - Smart alerts that suggest either removing excess nuggets or adding specific amounts to reach the next complete ingot
- **Testing infrastructure** - Comprehensive test suite with Vitest, property-based testing with fast-check, and React Testing Library
- **Switch component** - New UI component for toggling economical optimization mode
- **GitHub link** - Added link to project repository in header

### Changed
- **Optimized ingot calculation algorithm** - The preset system now intelligently prefers multiples of 128, 96, 64, and 32 nuggets for more efficient crucible slot usage. This results in cleaner, more practical configurations, especially for larger batches. For example, a 24-ingot Bismuth Bronze batch now uses 256 Cu + 128 Zn + 96 Bi instead of less optimal distributions.
- **Simplified crucible controls** - Removed ratio lock feature in favor of more intuitive optimization controls
- **Enhanced composition display** - Replaced detailed tables with visual indicators and rarity cost information
- **Improved slot management** - Added individual clear buttons for each crucible slot
- **Streamlined result card** - Removed verbose adjustment tables in favor of actionable optimization buttons

### Fixed
- **Accurate maximum ingot calculation** - The preset slider now shows the true maximum achievable ingots for each alloy based on the optimized nugget distribution. For example, Bismuth Bronze now correctly shows 24 ingots maximum (up from the previous 21) because the optimized preset can fit more efficiently in 4 crucible slots.
- **Black Bronze preset calculation** - Fixed an issue where the optimized preset algorithm would fail for Black Bronze and other recipes with tight percentage constraints. The system now falls back to a simple midpoint calculation when the optimization produces invalid results, ensuring all recipes work correctly.
- **Minimal adjustment strategy** - When slightly over target ingot amounts, the system now makes minimal changes to metals that are over their maximum percentage rather than recalculating everything

## [1.0.3] - 2025-11-17

## [1.0.2] - 2025-11-17

### Changed
- Conditional deployment workflow based on file changes
- Skip unnecessary deployments when irrelevant files are changed

## [1.0.1] - 2025-11-17

### Added
- Build archive creation for tagged releases
- Single build.zip file for GitHub releases

### Changed
- Simplified release asset management

## [1.0.0] - 2025-11-17

### Added
- Initial release of the Vintage Story Alloy Calculator
- Core crucible and alloy calculation components
- Support for all Vintage Story alloy recipes
- Real-time composition analysis and validation
- Smart crucible editor with metal filtering and slot management
- Ratio lock mode for maintaining alloy proportions
- Preset system with adjustable ingot amounts
- Dynamic metal selection with constraints
- Comprehensive alloy reference table
- Mobile warning for optimal desktop experience
- AWS deployment infrastructure with Terraform
- Automated CI/CD with GitHub Actions
- AlertDialog component with Radix UI
- NumberInput component for precise numeric input
- CountUp component for animated number display
- Enhanced Select component with Radix UI icons
- ThemeToggle for dark/light mode switching
- Support for nugget images in metal selection

### Infrastructure
- S3 bucket for static website hosting with encryption and lifecycle policies
- CloudFront distribution for global content delivery
- ACM certificate for HTTPS with DNS validation
- Route53 DNS records for custom domain
- IAM user with minimal deployment permissions
- AppRegistry application for resource management
- Conditional deployment workflow based on file changes
- Build archive creation for tagged releases

### Features
- Four-slot crucible simulation (0-128 nuggets per slot)
- Live percentage calculations and visualization
- Exact match detection and close match suggestions
- Contamination warnings
- One-click composition adjustments
- Maximum ingot calculation per recipe
- Keyboard navigation support
- WCAG AA accessibility compliance
- Responsive UI with tabs and composition visualization

### Development
- Integrated Tailwind CSS and Radix UI
- Configured TypeScript path aliases (@/*)
- Added PostCSS with Tailwind and Autoprefixer
- Specified Node.js and pnpm versions for consistent environments
- Updated Button and Slider components with refined styling

## [0.1.0] - 2025-11-17

### Added
- Initial project setup
- Tailwind CSS and Radix UI integration
- Build tooling configuration (Vite, PostCSS, TypeScript)
- Path alias support for cleaner imports
