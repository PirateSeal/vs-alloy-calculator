# Requirements Document

## Introduction

The Vintage Story Alloy Calculator is a single-page web application that enables players to calculate valid alloy compositions for the game Vintage Story. The application simulates the in-game crucible mechanics, allowing users to input metal compositions and receive real-time feedback on whether their mixture produces a valid alloy. The calculator uses alloy ratio data automatically fetched from the official Vintage Story Wiki to ensure accuracy and eliminate manual data entry errors.

## Glossary

- **Crucible System**: The in-game smelting interface with 4 input slots, each holding 0-128 nuggets of a single metal type
- **Nugget**: A unit of ore or metal representing 5 units of metal in the crucible
- **Alloy**: A mixture of two or more metals combined in specific percentage ratios to create a new metal type
- **Metal Composition**: The percentage distribution of different metals in the crucible
- **Valid Alloy**: A metal composition that falls within the acceptable percentage ranges defined by the game
- **Web Application**: The client-side React application that runs entirely in the browser
- **Wiki Data Source**: The official Vintage Story Wiki pages containing authoritative alloy ratio information

## Requirements

### Requirement 1

**User Story:** As a Vintage Story player, I want to input metal amounts into a virtual crucible, so that I can plan my alloy compositions before using in-game resources

#### Acceptance Criteria

1. THE Web Application SHALL display four crucible input slots
2. WHEN a user selects a metal type for a slot, THE Web Application SHALL allow selection from all available base metals
3. WHEN a user adjusts the nugget amount for a slot, THE Web Application SHALL accept integer values between 0 and 128 inclusive
4. THE Web Application SHALL provide both slider and numeric input controls for nugget amounts
5. THE Web Application SHALL display the calculated unit value for each slot as nuggets multiplied by 5

### Requirement 2

**User Story:** As a player experimenting with alloys, I want to see the total metal composition in real-time, so that I can understand the percentage distribution of my mixture

#### Acceptance Criteria

1. WHEN any crucible slot changes, THE Web Application SHALL recalculate the total composition within 100 milliseconds
2. THE Web Application SHALL display each metal's total nugget count across all slots
3. THE Web Application SHALL display each metal's total unit count as nuggets multiplied by 5
4. THE Web Application SHALL display each metal's percentage of the total composition with one decimal place precision
5. THE Web Application SHALL display a visual stacked bar chart showing the proportional composition of each metal
6. WHEN the crucible is empty, THE Web Application SHALL display a placeholder message indicating no metals are present

### Requirement 3

**User Story:** As a player checking alloy validity, I want immediate feedback on whether my composition creates a valid alloy, so that I can adjust my mixture accordingly

#### Acceptance Criteria

1. WHEN the crucible composition changes, THE Web Application SHALL evaluate all known alloy recipes within 100 milliseconds
2. IF the composition exactly matches an alloy recipe's percentage ranges, THE Web Application SHALL display a success state with the alloy name
3. IF the composition is close but not valid, THE Web Application SHALL display the closest matching alloy with deviation details
4. THE Web Application SHALL highlight which metal percentages are too high or too low for the closest match
5. IF no alloy matches the composition, THE Web Application SHALL display a message indicating no known alloy matches
6. THE Web Application SHALL display the required percentage ranges for each metal in the matched alloy

### Requirement 4

**User Story:** As a player learning about alloys, I want to view a reference table of all available alloys, so that I can understand what combinations are possible

#### Acceptance Criteria

1. THE Web Application SHALL provide a tabbed interface with separate Calculator and Reference views
2. WHEN the Reference tab is selected, THE Web Application SHALL display a table of all alloy recipes
3. THE Web Application SHALL display for each alloy the name, component metals, and percentage ranges
4. THE Web Application SHALL display optional smelting temperature information when available
5. THE Web Application SHALL organize alloy information in a scannable table format

### Requirement 5

**User Story:** As a player managing my crucible, I want quick actions to reset or load preset compositions, so that I can efficiently test different alloy recipes

#### Acceptance Criteria

1. THE Web Application SHALL provide a Clear Crucible button that resets all slots to empty
2. WHEN the Clear Crucible button is activated, THE Web Application SHALL set all slot metal types to null and all nugget counts to 0
3. THE Web Application SHALL provide preset buttons for common valid alloy compositions
4. WHEN a preset button is activated, THE Web Application SHALL populate the crucible slots with the preset values
5. THE Web Application SHALL provide at least three preset compositions representing different alloy types

### Requirement 6

**User Story:** As a player using the calculator, I want the alloy data to be accurate and up-to-date with the game, so that I can trust the results for in-game use

#### Acceptance Criteria

1. THE Web Application SHALL use alloy ratio data sourced from the official Vintage Story Wiki
2. THE Web Application SHALL include all nine standard alloys: Brass, Bismuth Bronze, Tin Bronze, Black Bronze, Molybdochalkos, Lead Solder, Silver Solder, Cupronickel, and Electrum
3. THE Web Application SHALL store alloy data as static TypeScript constants generated from wiki data
4. THE Web Application SHALL define percentage ranges with minimum and maximum values for each metal component
5. THE Web Application SHALL function entirely offline after initial page load

### Requirement 7

**User Story:** As a player on mobile or desktop, I want a responsive and accessible interface, so that I can use the calculator on any device

#### Acceptance Criteria

1. THE Web Application SHALL display a two-column layout on desktop viewports wider than 768 pixels
2. THE Web Application SHALL display a single-column stacked layout on mobile viewports 768 pixels or narrower
3. THE Web Application SHALL support keyboard navigation for all interactive controls
4. THE Web Application SHALL provide proper ARIA labels and semantic HTML for screen reader compatibility
5. THE Web Application SHALL use a dark theme with sufficient contrast ratios meeting WCAG AA standards

### Requirement 8

**User Story:** As a player evaluating alloy matches, I want to understand how close my composition is to valid alloys, so that I can make informed adjustments

#### Acceptance Criteria

1. WHEN evaluating alloy matches, THE Web Application SHALL calculate a deviation score for each alloy recipe
2. THE Web Application SHALL identify the best matching alloy as the one with the lowest deviation score
3. THE Web Application SHALL list all metal components that fall outside the required percentage ranges
4. THE Web Application SHALL display for each violation whether the metal percentage is too high or too low
5. THE Web Application SHALL allow a tolerance of 0.2 percentage points when determining exact matches
6. THE Web Application SHALL treat metals not in the recipe as contaminants if their percentage exceeds 0.5 percent

### Requirement 9

**User Story:** As a developer maintaining the application, I want clean TypeScript code with proper type definitions, so that the codebase remains maintainable

#### Acceptance Criteria

1. THE Web Application SHALL use TypeScript for all source code with strict type checking enabled
2. THE Web Application SHALL define explicit interfaces for CrucibleSlot, CrucibleState, Metal, AlloyRecipe, and AlloyComponent types
3. THE Web Application SHALL implement pure functions for all calculation logic without side effects
4. THE Web Application SHALL separate calculation logic from UI components in dedicated modules
5. THE Web Application SHALL use React functional components with hooks exclusively

### Requirement 10

**User Story:** As a player using a 1080p display, I want the calculator interface to fit vertically on my screen, so that I can use the application without scrolling

#### Acceptance Criteria

1. THE Web Application SHALL position crucible input controls above the composition display and result card
2. THE Web Application SHALL arrange the calculator layout to minimize vertical space usage on 1080-pixel-height displays
3. THE Web Application SHALL ensure all primary calculator controls are visible without scrolling on viewports with 1080 pixels vertical resolution
4. THE Web Application SHALL use a vertical stacking layout for the calculator tab content

### Requirement 11

**User Story:** As a player exploring alloy recipes, I want preset buttons for all nine standard alloys, so that I can quickly test any alloy composition

#### Acceptance Criteria

1. THE Web Application SHALL provide preset buttons for all nine standard alloys: Tin Bronze, Bismuth Bronze, Black Bronze, Brass, Molybdochalkos, Lead Solder, Silver Solder, Cupronickel, and Electrum
2. WHEN a preset button is activated, THE Web Application SHALL populate crucible slots with metal amounts that produce at least one ingot of the selected alloy
3. THE Web Application SHALL calculate preset amounts using the midpoint percentages of each alloy's component ranges
4. THE Web Application SHALL distribute metals across available slots to match the alloy recipe proportions

### Requirement 12

**User Story:** As a player selecting metals, I want to see only compatible metal options that form valid alloys, so that I can avoid invalid combinations

#### Acceptance Criteria

1. WHEN a single metal type is selected in any crucible slot, THE Web Application SHALL filter the metal selection options in other empty slots to show only metals that form valid alloys with the selected metal
2. WHEN multiple different metals are already selected, THE Web Application SHALL show all metal options in remaining empty slots
3. WHEN all crucible slots are empty, THE Web Application SHALL show all available metals in the selection dropdowns
4. THE Web Application SHALL determine metal compatibility by checking if any alloy recipe contains both metals as components

### Requirement 13

**User Story:** As a player adjusting a preset alloy composition, I want the other slot amounts to automatically adjust to maintain a valid alloy ratio, so that I can experiment with different total amounts while keeping the alloy valid

#### Acceptance Criteria

1. WHEN a preset has been loaded and a user modifies a slot's nugget amount, THE Web Application SHALL recalculate the other slot amounts to maintain the closest valid alloy ratio
2. THE Web Application SHALL adjust other slots proportionally based on the modified slot's new percentage
3. THE Web Application SHALL ensure adjusted amounts remain within the 0-128 nugget range per slot
4. THE Web Application SHALL prioritize maintaining the alloy's percentage ranges over exact proportional scaling
5. WHEN manual adjustments make it impossible to maintain a valid alloy within slot constraints, THE Web Application SHALL allow the invalid state and display appropriate feedback
