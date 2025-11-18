# Requirements Document

## Introduction

This feature adds an intelligent recipe optimization algorithm to the Vintage Story Alloy Calculator. The optimizer will calculate the optimal combination of metal nuggets to create a desired alloy based on user-specified goals: either maximizing the number of ingots produced or minimizing resource waste (economical mode). The system will analyze available metals, alloy recipes, and crucible constraints to provide users with actionable recommendations.

## Glossary

- **Alloy Calculator**: The web application that helps users calculate metal alloy compositions for the game Vintage Story
- **Crucible**: A container with 4 slots that holds metal nuggets for smelting into alloys
- **Nugget**: The base unit of metal; 1 nugget = 5 units
- **Unit**: The measurement used for alloy percentages; 100 units = 1 ingot
- **Ingot**: The output product; requires exactly 100 units (20 nuggets) of valid alloy composition
- **Recipe**: An alloy formula specifying required metal types and their percentage ranges
- **Optimizer**: The algorithm that calculates optimal nugget combinations based on user goals
- **Maximization Mode**: Optimization strategy that prioritizes producing the highest number of ingots
- **Economical Mode**: Optimization strategy that finds the most economical metal mix for a specified target ingot amount by minimizing rare metal usage
- **Very Common Metals**: Metals that are very easy to find (copper with surface deposits, lead in shallow veins)
- **Common Metals**: Deep alloy metals that are readily available with basic mining (zinc, bismuth)
- **Moderately Rare Metals**: Metals that are technically common but difficult to locate (tin)
- **Rare Metals**: Precious metals requiring specific conditions or advanced tools (gold, silver, nickel)
- **Metal Rarity Score**: A numeric value representing how difficult a metal is to obtain in the game world
- **Slot Constraint**: The limitation that each crucible slot can hold a maximum of 128 nuggets
- **Percentage Range**: The minimum and maximum percentage allowed for each metal component in a recipe
- **Valid Composition**: A metal combination where all components fall within their required percentage ranges

## Requirements

### Requirement 1

**User Story:** As a player, I want to specify my optimization goal (maximize ingots or be economical), so that the calculator provides recommendations aligned with my resource priorities.

#### Acceptance Criteria

1. WHEN a user selects an alloy recipe THEN the Optimizer SHALL display options for maximization mode and economical mode
2. WHEN a user selects maximization mode THEN the Optimizer SHALL prioritize calculating recipes that produce the highest number of ingots within crucible constraints
3. WHEN a user selects economical mode THEN the Optimizer SHALL calculate recipes that minimize rare metal usage for the target ingot amount displayed in the alloy result card
4. WHEN a user switches between modes THEN the Optimizer SHALL recalculate the optimal recipe and update the display immediately

### Requirement 2

**User Story:** As a player, I want the optimizer to calculate the maximum possible ingots for a recipe, so that I can understand the upper limit of production efficiency.

#### Acceptance Criteria

1. WHEN the Optimizer calculates for maximization mode THEN the Optimizer SHALL determine the maximum number of ingots achievable within the 4-slot crucible constraint
2. WHEN calculating maximum ingots THEN the Optimizer SHALL ensure all metal percentages remain within their required ranges
3. WHEN calculating maximum ingots THEN the Optimizer SHALL account for the 128-nugget-per-slot limitation
4. WHEN the maximum ingot calculation completes THEN the Optimizer SHALL return the exact nugget distribution across all four slots
5. WHEN no valid configuration exists for a recipe THEN the Optimizer SHALL return zero as the maximum ingot count

### Requirement 3

**User Story:** As a player, I want the optimizer to calculate the most economical recipe for a specific ingot amount, so that I can conserve rare metals and use common metals when possible.

#### Acceptance Criteria

1. WHEN the Optimizer calculates for economical mode THEN the Optimizer SHALL use the target ingot amount from the alloy result card as the fixed production goal
2. WHEN calculating economical recipes THEN the Optimizer SHALL assign rarity scores to each metal based on game world availability
3. WHEN calculating economical recipes THEN the Optimizer SHALL minimize the total rarity cost while maintaining valid alloy percentages for the target ingot amount
4. WHEN the economical calculation completes THEN the Optimizer SHALL return a recipe that produces exactly the target ingot amount using the minimum amount of rare metals
5. WHEN no valid recipe exists for the target ingot amount THEN the Optimizer SHALL return an error indicating the target cannot be achieved

### Requirement 4

**User Story:** As a player, I want to see the calculated recipe displayed in the crucible interface, so that I know exactly which metals and quantities to use.

#### Acceptance Criteria

1. WHEN the Optimizer completes a calculation THEN the Alloy Calculator SHALL display the optimized nugget distribution in the crucible slots
2. WHEN displaying optimized results THEN the Alloy Calculator SHALL show each metal type and nugget count per slot
3. WHEN displaying optimized results THEN the Alloy Calculator SHALL indicate the total number of ingots that will be produced via the ingot amount slider
4. WHEN displaying optimized results THEN the Alloy Calculator SHALL show the percentage composition for each metal in the composition card
5. WHEN the user adjusts the ingot amount slider with economical mode enabled THEN the Alloy Calculator SHALL automatically re-optimize the recipe for the new target amount

### Requirement 5

**User Story:** As a player, I want the optimizer to validate that calculated recipes are actually achievable, so that I don't receive impossible recommendations.

#### Acceptance Criteria

1. WHEN the Optimizer calculates a recipe THEN the Optimizer SHALL verify that the total number of slots required does not exceed four
2. WHEN the Optimizer calculates a recipe THEN the Optimizer SHALL verify that no single slot exceeds 128 nuggets
3. WHEN the Optimizer calculates a recipe THEN the Optimizer SHALL verify that all metal percentages fall within the recipe's required ranges
4. WHEN the Optimizer calculates a recipe THEN the Optimizer SHALL verify that the total units equal exactly 100 times the number of ingots
5. IF validation fails THEN the Optimizer SHALL return an error indicating why the recipe cannot be achieved

### Requirement 6

**User Story:** As a player, I want the optimizer to handle edge cases gracefully, so that the calculator remains reliable under all conditions.

#### Acceptance Criteria

1. WHEN a recipe has very narrow percentage ranges THEN the Optimizer SHALL still find valid solutions if they exist
2. WHEN a recipe requires three or more metal components THEN the Optimizer SHALL correctly distribute nuggets across all components
3. WHEN rounding causes percentage drift THEN the Optimizer SHALL adjust the final component to maintain exact total units
4. WHEN a recipe cannot fit in four slots even at minimum THEN the Optimizer SHALL report that the recipe is impossible
5. WHEN percentage constraints conflict with slot constraints THEN the Optimizer SHALL prioritize percentage validity over slot optimization
6. WHEN calculating economical mode for a recipe with only common metals THEN the Optimizer SHALL still produce exactly the target ingot amount
7. WHEN calculating economical mode for a recipe with only rare metals THEN the Optimizer SHALL produce exactly the target ingot amount while minimizing total rarity cost

### Requirement 7

**User Story:** As a player, I want the system to understand metal rarity based on Vintage Story game mechanics, so that economical mode provides realistic recommendations.

#### Acceptance Criteria

1. WHEN the system assigns rarity scores THEN copper SHALL have the lowest rarity score as it is the most common metal with surface deposits and panning availability
2. WHEN the system assigns rarity scores THEN lead SHALL have a very low rarity score as it is very common in shallow underground deposits
3. WHEN the system assigns rarity scores THEN zinc and bismuth SHALL have low-moderate rarity scores as common deep alloy metals
4. WHEN the system assigns rarity scores THEN tin SHALL have a moderate rarity score as it is notoriously difficult to locate despite being technically common
5. WHEN the system assigns rarity scores THEN gold and silver SHALL have high rarity scores as precious metals found only in quartz or galena deposits
6. WHEN the system assigns rarity scores THEN nickel SHALL have the highest rarity score among calculator metals as it requires deep mining with tier 4 tools
7. WHEN calculating rarity cost THEN the system SHALL multiply each metal's nugget count by its rarity score and sum the results

### Requirement 8

**User Story:** As a developer, I want the optimizer algorithm to be testable and maintainable, so that I can verify correctness and extend functionality.

#### Acceptance Criteria

1. WHEN the Optimizer is implemented THEN the Optimizer SHALL expose pure functions that accept recipe and mode parameters
2. WHEN the Optimizer calculates results THEN the Optimizer SHALL return structured data including nugget distributions and metadata
3. WHEN the Optimizer encounters errors THEN the Optimizer SHALL return descriptive error messages rather than throwing exceptions
4. WHEN the Optimizer is called THEN the Optimizer SHALL not modify any global state or input parameters
5. WHEN the Optimizer completes THEN the Optimizer SHALL execute in less than 100 milliseconds for any single recipe calculation
