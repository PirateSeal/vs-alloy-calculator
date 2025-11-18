# Implementation Plan

- [x] 1. Set up metal rarity system

  - Create `src/lib/metalRarity.ts` with rarity score definitions
  - Define rarity scores for all 8 metals (copper: 1.0, lead: 1.2, zinc: 2.0, bismuth: 2.0, tin: 3.0, gold: 5.0, silver: 5.0, nickel: 8.0)
  - Implement `getRarityScore(metalId: MetalId): number` function
  - Implement `calculateRarityCost(amounts: MetalAmount[]): number` function
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 1.1 Write property test for rarity cost calculation

  - **Property 8: Rarity cost calculation**
  - **Validates: Requirements 7.7**

- [x] 2. Create recipe validation module

  - Create `src/lib/recipeValidator.ts` with validation functions
  - Implement `validateSlotCount(crucible: CrucibleState): boolean` - checks ≤ 4 slots
  - Implement `validateSlotCapacity(crucible: CrucibleState): boolean` - checks ≤ 128 nuggets per slot
  - Implement `validatePercentages(amounts: MetalAmount[], recipe: AlloyRecipe): boolean` - checks percentage ranges
  - Implement `validateTotalUnits(amounts: MetalAmount[], ingotCount: number): boolean` - checks units = ingots × 100
  - Implement `validateComponentPresence(amounts: MetalAmount[], recipe: AlloyRecipe): boolean` - checks all metals present
  - Implement main `validateRecipe(crucible: CrucibleState, recipe: AlloyRecipe, ingotCount: number): RecipeValidationResult`
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4, 6.2_

- [x] 2.1 Write property test for slot count constraint

  - **Property 3: Slot count constraint**
  - **Validates: Requirements 2.1, 5.1**

- [x] 2.2 Write property test for percentage validity invariant

  - **Property 4: Percentage validity invariant**
  - **Validates: Requirements 2.2, 5.3, 6.5**

- [x] 2.3 Write property test for slot capacity constraint

  - **Property 5: Slot capacity constraint**
  - **Validates: Requirements 2.3, 5.2**

- [x] 2.4 Write property test for total units invariant

  - **Property 6: Total units invariant**
  - **Validates: Requirements 5.4, 6.3**

- [x] 2.5 Write property test for multi-component distribution

  - **Property 7: Multi-component distribution**
  - **Validates: Requirements 6.2**

- [x] 2.6 Write unit tests for validation edge cases

  - Test empty recipes
  - Test single-component recipes
  - Test recipes at constraint boundaries (exactly 4 slots, exactly 128 nuggets)
  - Test invalid recipes (conflicting percentages, too many metals)
  - _Requirements: 6.1, 6.4_

- [x] 3. Implement maximization strategy

  - Create `src/lib/maximizationStrategy.ts`
  - Implement binary search algorithm for finding maximum ingots
  - Implement recipe generation for N ingots with optimal nugget distribution
  - Implement slot distribution algorithm (prefer 128, 96, 64, 32, 16 multiples)
  - Handle edge cases: narrow percentage ranges, impossible configurations
  - Return `OptimizerResult` with success/error states
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.4_

- [x] 3.1 Write property test for maximization produces maximum ingots

  - **Property 1: Maximization produces maximum ingots**
  - **Validates: Requirements 1.2**

- [x] 3.2 Write unit tests for maximization edge cases

  - Test recipe with very narrow percentage ranges
  - Test recipe that cannot fit in 4 slots
  - Test single-ingot recipes
  - Test recipes with 2, 3, and 4 components
  - _Requirements: 2.5, 6.1, 6.4_

- [x] 4. Implement economical strategy

  - Create `src/lib/economicalStrategy.ts`
  - Implement rarity cost minimization algorithm for a specified target ingot amount
  - Bias nugget distribution toward common metals within percentage constraints
  - Search across valid recipe configurations for the target ingot count to find minimum rarity cost
  - Handle edge cases: all common metals, all rare metals
  - Validate that target ingot amount is provided and achievable
  - Return `OptimizerResult` with rarity cost metadata
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 6.6, 6.7_

- [x] 4.1 Write property test for economical mode minimizes rarity cost

  - **Property 2: Economical mode minimizes rarity cost**
  - **Validates: Requirements 1.3, 3.1, 3.3, 3.4**

- [x] 4.2 Write unit tests for economical edge cases

  - Test recipe with only common metals for target ingot amount
  - Test recipe with only rare metals for target ingot amount
  - Test different valid configurations for same target ingot amount
  - Test recipes with different metal combinations
  - Test error handling when target ingot amount is not achievable
  - _Requirements: 3.5, 6.6, 6.7_

- [x] 5. Create main optimizer engine

  - Create `src/lib/recipeOptimizer.ts` as main entry point
  - Define `OptimizerInput` and `OptimizerResult` interfaces (with optional targetIngots for economical mode)
  - Implement `optimizeRecipe(input: OptimizerInput): OptimizerResult` function
  - Dispatch to maximization or economical strategy based on mode
  - Validate that targetIngots is provided when mode is 'economical'
  - Run validation on results before returning
  - Handle errors and return descriptive error messages
  - Ensure input immutability (don't modify recipe object)
  - _Requirements: 1.1, 1.2, 1.3, 5.5, 8.1, 8.2, 8.3, 8.4_

- [x] 5.1 Write property test for input immutability

  - **Property 9: Input immutability**
  - **Validates: Requirements 8.4**

- [x] 5.2 Write unit tests for optimizer engine

  - Test mode dispatching (maximize vs economical)
  - Test error handling for invalid recipes
  - Test result structure and metadata
  - Test with all real alloy recipes from the game
  - _Requirements: 5.5, 8.2, 8.3_

- [x] 6. Integrate optimizer with UI

  - Update `src/components/ResultCard.tsx` to add optimization controls
  - Add mode selector (Switch component for maximize/economical)
  - Add "Maximize" button (icon button next to slider) to trigger maximization
  - Add "Economical optimize" button (wand icon) to manually trigger economical optimization
  - For economical mode, use the ingot amount from the slider as the target
  - Display optimization results in crucible slots via onCrucibleChange callback
  - Show ingot count via slider value
  - Economical mode automatically re-optimizes when slider moves
  - Existing validation system provides user-friendly feedback
  - _Requirements: 1.1, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_
