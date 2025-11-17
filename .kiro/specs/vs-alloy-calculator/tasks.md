# Implementation Plan

- [x] 1. Configure Tailwind CSS and shadcn/ui

  - Initialize Tailwind with dark mode configuration and content paths for `./index.html` and `./src/**/*.{ts,tsx,js,jsx}`
  - Update `src/index.css` to import Tailwind base, components, and utilities
  - Initialize shadcn/ui for Vite + React + Tailwind
  - Install and configure required shadcn/ui components: Button, Card, Tabs, Select, Slider, Input, Label, Table, Tooltip, Alert, Badge
  - Configure dark theme with teal/blue accent color using Tailwind tokens
  - _Requirements: 7.5, 9.1_

- [x] 2. Create type definitions and data models

  - [x] 2.1 Define core TypeScript types

    - Create `src/types/alloys.ts` with MetalId, Metal, AlloyComponent, and AlloyRecipe interfaces
    - Create `src/types/crucible.ts` with CrucibleSlot and CrucibleState interfaces
    - _Requirements: 9.2_

  - [x] 2.2 Create static alloy data from wiki sources

    - Create `src/data/alloys.ts` with METALS array containing all 8 base metals (copper, tin, zinc, bismuth, gold, silver, lead, nickel)
    - Define ALLOY_RECIPES array with all 9 alloys using percentage ranges from wiki: Tin Bronze (88-92% Cu, 8-12% Sn), Bismuth Bronze (50-70% Cu, 20-30% Zn, 10-20% Bi), Black Bronze (68-84% Cu, 8-16% Ag, 8-16% Au), Brass (60-70% Cu, 30-40% Zn), Molybdochalkos (8-12% Cu, 88-92% Pb), Lead Solder (45-55% Pb, 45-55% Sn), Silver Solder (40-50% Ag, 50-60% Sn), Cupronickel (65-75% Cu, 25-35% Ni), Electrum (40-60% Au, 40-60% Ag)
    - Include smelting temperatures and color values for each metal
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implement core calculation logic

  - [x] 3.1 Create crucible aggregation function

    - Implement `aggregateCrucible` in `src/lib/alloyLogic.ts` to sum nuggets by metal type across all slots
    - Calculate units as nuggets × 5 for each metal
    - Calculate percentage for each metal as (metalUnits / totalUnits) × 100
    - Filter out metals with zero units
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.3, 9.4_

  - [x] 3.2 Create alloy evaluation function

    - Implement `evaluateAlloys` to match composition against all alloy recipes
    - For each recipe, check if all component percentages fall within min-max ranges with 0.2% tolerance
    - Detect contamination (metals not in recipe with percentage > 0.5%)
    - Calculate deviation score as sum of absolute deviations from range midpoints
    - Build violations array listing metals outside required ranges
    - Sort matches by isExact (true first), then by score (ascending)
    - Return bestMatch as first element or null if no matches
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.3, 9.4_

  - [x] 3.3 Create helper utilities

    - Implement `isWithinRange` to check if value is within min-max with tolerance
    - Implement `clamp` to constrain value between min and max
    - Implement `createEmptyCrucible` to generate initial state with 4 empty slots
    - _Requirements: 9.3, 9.4_

- [x] 4. Build Header component

  - Create `src/components/Header.tsx` with app title "Vintage Story Alloy Calculator"
  - Add subtitle describing the calculator and mentioning wiki data source
  - Style with border, padding, and dark theme colors
  - _Requirements: 7.5, 9.5_

- [x] 5. Build crucible input components

  - [x] 5.1 Create CrucibleSlotRow component

    - Create `src/components/CrucibleSlotRow.tsx` accepting slot, availableMetals, and onChange props
    - Render shadcn Select dropdown for metal selection with "Empty slot" option
    - Render shadcn Slider (0-128 range) for nugget amount
    - Render shadcn Input (type number, 0-128 range) synchronized with slider
    - Display calculated units as "X nuggets (Y units)" where Y = X × 5
    - Apply input validation to clamp nuggets to 0-128 range
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.3, 9.5_

  - [x] 5.2 Create CruciblePanel component
    - Create `src/components/CruciblePanel.tsx` with crucible state and onChange handler
    - Render shadcn Card container with title "Crucible Inputs"
    - Render four CrucibleSlotRow components for slots 0-3
    - Add "Clear Crucible" button that resets all slots to empty (null metal, 0 nuggets)
    - Add preset buttons for "Tin Bronze" (92 Cu, 8 Sn), "Brass" (70 Cu, 30 Zn), and "Black Bronze" (84 Cu, 8 Au, 8 Ag)
    - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5, 7.3, 9.5_

- [x] 6. Build composition display component

  - Create `src/components/CompositionCard.tsx` accepting amounts, totalNuggets, and totalUnits props
  - Render shadcn Card with title "Current Composition"
  - Display total nuggets and total units at the top
  - For each metal in amounts array, display color dot, name, nuggets, units, and percentage (1 decimal place)
  - Implement horizontal stacked bar chart using flex container with colored divs proportional to each metal's percentage
  - Show "Empty crucible" placeholder when totalUnits equals 0
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.5, 9.5_

- [x] 7. Build alloy result display component

  - Create `src/components/ResultCard.tsx` accepting evaluation prop
  - Implement empty state (totalUnits = 0) showing info message "Add metals to the crucible to see alloy results"
  - Implement exact match state (bestMatch.isExact = true) with success styling, alloy name, "Exact alloy" badge, and table showing required vs actual percentages
  - Implement close match state (bestMatch exists but not exact) with warning styling, "Closest alloy: X (not valid yet)" message, and per-metal deviation details with red/orange highlighting
  - Implement no match state (no bestMatch) with error styling and "No known alloy from this composition" message
  - Display required percentage ranges for each metal component in matched alloy
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 8.3, 8.4, 7.5, 9.5_

- [x] 8. Build alloy reference table component

  - Create `src/components/AlloyReferenceTable.tsx` accepting recipes prop
  - Render shadcn Card with title "Alloy Reference"
  - Render shadcn Table with columns: Alloy Name, Components, Smelting Temp, Notes
  - For each alloy recipe, display name and list components as "Metal: min-max%"
  - Display smelting temperature when available
  - Display notes when available
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.3, 9.5_

- [x] 9. Wire components in main App

  - Update `src/App.tsx` to import all components and data
  - Initialize crucible state with `useState(createEmptyCrucible())`
  - Use `useMemo` to calculate amounts via `aggregateCrucible(crucible)` when crucible changes
  - Use `useMemo` to calculate evaluation via `evaluateAlloys(amounts, ALLOY_RECIPES)` when amounts change
  - Render Header component
  - Render shadcn Tabs with "Calculator" and "Alloy Reference" tabs
  - In Calculator tab, render two-column grid layout (desktop) with CruciblePanel on left and CompositionCard + ResultCard on right
  - In Reference tab, render AlloyReferenceTable
  - Ensure responsive layout switches to single column on mobile (< 768px)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1, 7.2, 9.5_

- [x] 10. Implement accessibility features

  - Add proper ARIA labels to all form controls in CrucibleSlotRow
  - Ensure all interactive elements have visible focus indicators
  - Use semantic HTML with proper heading hierarchy (h1 for title, h2 for card titles)
  - Add keyboard navigation support for all controls
  - Verify color contrast ratios meet WCAG AA standards (≥ 4.5:1)
  - Add table headers with proper scope attributes in AlloyReferenceTable
  - _Requirements: 7.3, 7.4, 7.5_

- [ ]\* 11. Add manual testing and validation

  - Test crucible interactions: add/remove metals, adjust nuggets with both slider and input
  - Verify all 9 alloy recipes produce exact matches with known valid compositions
  - Test responsive layout on mobile (< 768px) and desktop (≥ 768px) viewports
  - Test keyboard navigation through all interactive elements
  - Verify preset buttons populate correct values and produce valid alloys
  - Verify reference table displays all 9 alloys with correct data
  - Test edge cases: empty crucible, single metal, contaminated mixtures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.2, 3.3, 4.2, 5.3, 5.4, 6.2, 7.1, 7.2, 7.3_

- [x] 12. Update layout for vertical fit on 1080p displays

  - Modify App.tsx calculator tab layout from two-column to vertical stacking
  - Position CruciblePanel at the top
  - Place CompositionCard and ResultCard in a two-column grid below the crucible
  - Ensure all primary controls are visible without scrolling on 1080px height viewports
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 13. Implement compatible metal filtering

  - [x] 13.1 Add metal compatibility logic

    - Implement `getCompatibleMetals` function in alloyLogic.ts to find metals that form alloys with a given metal
    - Implement `getAvailableMetals` function to filter metals based on current crucible state
    - Build compatibility matrix from ALLOY_RECIPES data
    - _Requirements: 12.4_

  - [x] 13.2 Update CrucibleSlotRow to use filtered metals

    - Modify CrucibleSlotRow to receive and use filtered availableMetals prop
    - Ensure empty slots show only compatible metals when one metal is selected
    - Show all metals when crucible is empty or multiple metals are selected
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 13.3 Wire filtering into CruciblePanel

    - Update CruciblePanel to calculate availableMetals for each slot using getAvailableMetals
    - Pass filtered metal lists to each CrucibleSlotRow component
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 14. Add complete preset coverage for all 9 alloys

  - [x] 14.1 Implement preset generation logic

    - Create `createPresetForAlloy` function in alloyLogic.ts
    - Calculate midpoint percentages for each alloy component
    - Scale to minimum 20 nuggets (1 ingot) total
    - Distribute metals across slots with proper rounding
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 14.2 Update ResultCard with preset selector

    - Add preset dropdown in ResultCard for all 9 alloys: Tin Bronze, Bismuth Bronze, Black Bronze, Brass, Molybdochalkos, Lead Solder, Silver Solder, Cupronickel, Electrum
    - Add ingot amount slider to scale preset from 1 to maximum possible ingots
    - Generate preset crucible states using createPresetForAlloy function
    - _Requirements: 11.1, 11.2_

- [x] 15. Implement dynamic alloy ratio adjustment

  - [x] 15.1 Add ratio adjustment logic

    - Implement `adjustCrucibleForAlloy` function in alloyLogic.ts
    - Calculate new total based on changed slot's percentage in recipe
    - Distribute remaining nuggets proportionally across other slots
    - Clamp each slot to 0-128 range
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 15.2 Add preset tracking state to App

    - Add selectedRecipe state to track currently loaded preset/alloy
    - Add ratioLocked state to control whether ratio adjustment is enabled
    - Pass state and handlers to child components
    - _Requirements: 13.1, 13.2, 13.5_

  - [x] 15.3 Wire ratio adjustment into CruciblePanel

    - When nugget amount changes and ratioLocked is true, call adjustCrucibleForAlloy
    - Update crucible state with adjusted values
    - Allow invalid states when constraints cannot be satisfied
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Add nugget adjustment suggestions

  - [x] 16.1 Implement adjustment calculation logic

    - Implement `calculateNuggetAdjustments` function in alloyLogic.ts
    - Calculate target nuggets for each metal to achieve valid alloy
    - Return adjustments showing add/remove actions needed
    - Implement `getAdjustmentSummary` to create human-readable summary
    - _Requirements: 3.3, 3.4, 8.3, 8.4_

  - [x] 16.2 Update ResultCard with adjustment UI

    - Display adjustment summary in close match state
    - Show per-metal adjustment details in table
    - Display hints about Lock Ratio feature when enabled
    - Add "Adjust to Valid" button to automatically apply adjustments
    - Implement `applyNuggetAdjustments` to apply adjustments to crucible
    - _Requirements: 3.3, 3.4, 8.3, 8.4_