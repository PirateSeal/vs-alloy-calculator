# Design Document: Recipe Optimizer

## Overview

The Recipe Optimizer is an algorithm that calculates optimal metal nugget distributions for creating alloys in the Vintage Story Alloy Calculator. It supports two optimization modes:

1. **Maximization Mode**: Calculates the recipe that produces the maximum number of ingots within crucible constraints (4 slots, 128 nuggets per slot)
2. **Economical Mode**: Calculates the most economical recipe for a specified target ingot amount by minimizing the use of rare/valuable metals, prioritizing common metals like copper and lead over precious metals like gold, silver, and nickel

The optimizer takes an alloy recipe and (for economical mode) a target ingot amount as input, and returns a complete crucible configuration with exact nugget distributions across all slots, ensuring all percentage constraints are satisfied.

## Architecture

### Core Components

1. **Optimizer Engine** (`recipeOptimizer.ts`)
   - Main entry point for optimization calculations
   - Dispatches to appropriate optimization strategy based on mode
   - Validates results before returning

2. **Maximization Strategy** (`maximizationStrategy.ts`)
   - Implements the algorithm for finding maximum ingot production
   - Uses binary search to efficiently find the highest valid ingot count
   - Distributes nuggets across slots optimally

3. **Economical Strategy** (`economicalStrategy.ts`)
   - Implements the algorithm for minimizing rare metal usage
   - Assigns rarity scores to metals based on game world availability
   - Searches for valid recipes that minimize total rarity cost

4. **Metal Rarity System** (`metalRarity.ts`)
   - Defines rarity scores for each metal based on Vintage Story game mechanics
   - Provides utilities for calculating total rarity cost

5. **Validation Module** (`recipeValidator.ts`)
   - Validates that calculated recipes meet all constraints
   - Checks slot limits, percentage ranges, and total units

### Data Flow

```
User selects alloy + mode
         ↓
   Optimizer Engine
         ↓
    ┌────┴────┐
    ↓         ↓
Maximize   Economical
Strategy   Strategy
    ↓         ↓
    └────┬────┘
         ↓
   Validator
         ↓
  Crucible State
```

## Components and Interfaces

### OptimizerInput

```typescript
interface OptimizerInput {
  recipe: AlloyRecipe;
  mode: 'maximize' | 'economical';
  targetIngots?: number; // Required for economical mode
}
```

### OptimizerResult

```typescript
interface OptimizerResult {
  success: boolean;
  crucible: CrucibleState | null;
  ingotCount: number;
  rarityCost?: number;
  error?: string;
  metadata: {
    mode: 'maximize' | 'economical';
    recipe: AlloyRecipe;
    totalNuggets: number;
    percentages: Record<MetalId, number>;
  };
}
```

### MetalRarityScore

```typescript
interface MetalRarityScore {
  metalId: MetalId;
  score: number;
  tier: 'very-common' | 'common' | 'moderate' | 'rare';
}
```

### RecipeValidationResult

```typescript
interface RecipeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Data Models

### Metal Rarity Scores

Based on Vintage Story game mechanics and metal availability:

| Metal   | Rarity Score | Tier          | Reasoning                                           |
|---------|--------------|---------------|-----------------------------------------------------|
| Copper  | 1.0          | Very Common   | Surface deposits, panning, most common metal        |
| Lead    | 1.2          | Very Common   | Very common shallow underground deposits            |
| Zinc    | 2.0          | Common        | Common deep alloy metal, readily available          |
| Bismuth | 2.0          | Common        | Common deep alloy metal, readily available          |
| Tin     | 3.0          | Moderate      | Technically common but notoriously hard to locate   |
| Gold    | 5.0          | Rare          | Precious metal, only in quartz deposits             |
| Silver  | 5.0          | Rare          | Precious metal, only in quartz/galena deposits      |
| Nickel  | 8.0          | Rare          | Deep mining required, needs tier 4 tools            |

### Crucible Constraints

- **Maximum slots**: 4
- **Maximum nuggets per slot**: 128
- **Nuggets per ingot**: 20
- **Units per nugget**: 5
- **Units per ingot**: 100

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Maximization produces maximum ingots

*For any* alloy recipe, when optimizing in maximization mode, the returned ingot count should be the highest number achievable while satisfying all percentage constraints and crucible limitations (4 slots, 128 nuggets per slot).

**Validates: Requirements 1.2**

### Property 2: Economical mode minimizes rarity cost for target ingots

*For any* alloy recipe with at least one rare metal component and a specified target ingot amount, when optimizing in economical mode, the returned recipe should produce exactly the target ingot amount and have a rarity cost less than or equal to any other valid recipe configuration that produces the same number of ingots.

**Validates: Requirements 1.3, 3.1, 3.3, 3.4**

### Property 3: Slot count constraint

*For any* optimized recipe regardless of mode, the number of non-empty crucible slots should not exceed 4.

**Validates: Requirements 2.1, 5.1**

### Property 4: Percentage validity invariant

*For any* optimized recipe regardless of mode, every metal component's percentage should fall within its required minimum and maximum range (with tolerance of 0.01% for floating point precision).

**Validates: Requirements 2.2, 5.3, 6.5**

### Property 5: Slot capacity constraint

*For any* optimized recipe regardless of mode, no individual crucible slot should contain more than 128 nuggets.

**Validates: Requirements 2.3, 5.2**

### Property 6: Total units invariant

*For any* optimized recipe regardless of mode, the total units (sum of all nuggets × 5) should equal exactly 100 times the reported ingot count.

**Validates: Requirements 5.4, 6.3**

### Property 7: Multi-component distribution

*For any* alloy recipe with three or more metal components, when optimized in either mode, the resulting crucible should contain at least one nugget of each required metal component.

**Validates: Requirements 6.2**

### Property 8: Rarity cost calculation

*For any* optimized recipe in economical mode, the reported rarity cost should equal the sum of (nugget count × rarity score) for each metal component.

**Validates: Requirements 7.7**

### Property 9: Input immutability

*For any* optimizer call with a given recipe and mode, the input recipe object should remain unchanged after the optimization completes.

**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **Invalid Recipe Errors**
   - Recipe has no components
   - Recipe has conflicting percentage constraints (min > max)
   - Recipe requires more than 4 distinct metals

2. **Impossible Configuration Errors**
   - No valid distribution exists that satisfies percentage constraints within 4 slots
   - Minimum required nuggets exceed 4 × 128 = 512 nuggets

3. **Validation Errors**
   - Calculated recipe violates percentage constraints
   - Calculated recipe exceeds slot or capacity limits
   - Total units don't match ingot count

### Error Response Format

All errors return an `OptimizerResult` with:
- `success: false`
- `crucible: null`
- `ingotCount: 0`
- `error: string` - descriptive error message
- `metadata` - partial metadata with input information

### Error Recovery

The optimizer does not attempt automatic recovery. When an error occurs:
1. Return immediately with error result
2. Log error details for debugging
3. Allow caller to handle error appropriately (e.g., show user message, try different recipe)

## Testing Strategy

### Unit Testing

Unit tests will cover:
- **Metal rarity system**: Verify rarity scores are correctly assigned
- **Validation module**: Test all validation rules with valid and invalid inputs
- **Helper functions**: Test nugget distribution, percentage calculation utilities
- **Error handling**: Verify proper error messages for all error categories
- **Edge cases**: Empty recipes, single-component recipes, recipes at constraint boundaries

### Property-Based Testing

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) to verify correctness properties across randomly generated inputs.

**Test Configuration:**
- Minimum 100 iterations per property test
- Custom generators for:
  - Valid alloy recipes with 2-4 components
  - Percentage ranges (ensuring min ≤ max)
  - Metal combinations from available metals
  - Edge case recipes (narrow ranges, extreme percentages)

**Property Test Coverage:**
- Property 1: Maximization produces maximum ingots
- Property 2: Economical mode minimizes rarity cost
- Property 3: Slot count constraint
- Property 4: Percentage validity invariant
- Property 5: Slot capacity constraint
- Property 6: Total units invariant
- Property 7: Multi-component distribution
- Property 8: Rarity cost calculation
- Property 9: Input immutability

Each property test will be tagged with a comment referencing the design document property number.

### Integration Testing

Integration tests will verify:
- End-to-end optimization flow for real alloy recipes from the game
- UI integration with optimizer results
- Mode switching behavior
- Performance benchmarks (< 100ms per optimization)

## Algorithms

### Maximization Algorithm

The maximization strategy uses binary search to efficiently find the maximum number of ingots:

1. **Initialize bounds**: `low = 1`, `high = 50` (reasonable upper bound)
2. **Binary search loop**:
   - Calculate `mid = floor((low + high) / 2)`
   - Attempt to create a valid recipe for `mid` ingots
   - If valid and fits in 4 slots: `maxValid = mid`, `low = mid + 1`
   - If invalid or doesn't fit: `high = mid - 1`
3. **Return** the highest valid ingot count found

**Recipe Creation for N Ingots:**
1. Calculate target total: `targetNuggets = 20 * N`, `targetUnits = 100 * N`
2. For each component except the last:
   - Calculate target based on midpoint percentage
   - Find optimal nuggets within min/max percentage constraints
   - Prefer round numbers (128, 96, 64, 32, 16) for efficient slot usage
3. Assign remaining nuggets to last component
4. Validate all percentages are within range
5. Distribute across slots (max 128 per slot)
6. Verify total slots ≤ 4

**Time Complexity:** O(log N × C) where N is max ingots, C is number of components

### Economical Algorithm

The economical strategy finds the recipe with minimum rarity cost for a specified target ingot amount:

1. **Input validation**: Verify target ingot amount is provided and valid (> 0)
2. **Calculate rarity cost function**: `cost(recipe) = Σ(nuggets[i] × rarityScore[metal[i]])`
3. **Search strategy for target ingot count**:
   - Generate all valid recipe configurations for the target ingot amount
   - For each valid configuration:
     - Calculate rarity cost
     - Track minimum cost recipe
4. **Optimization**: Bias nugget distribution toward common metals
   - When distributing nuggets, prefer allocating more to low-rarity metals
   - Adjust within percentage constraints to minimize rare metal usage
   - Explore different valid distributions that produce exactly the target ingots
5. **Return** recipe with lowest rarity cost that produces exactly the target ingot amount

**Error handling:** If no valid recipe exists for the target ingot amount (due to slot or percentage constraints), return an error.

**Time Complexity:** O(D × C) where D is number of valid distributions for target ingots, C is number of components

### Validation Algorithm

Validation checks are performed after optimization:

1. **Slot count check**: Count non-empty slots ≤ 4
2. **Slot capacity check**: All slots have nuggets ≤ 128
3. **Percentage check**: For each component:
   - Calculate actual percentage: `(nuggets × 5 / totalUnits) × 100`
   - Verify: `minPercent - 0.01 ≤ actual ≤ maxPercent + 0.01`
4. **Total units check**: `totalUnits === ingotCount × 100`
5. **Component presence check**: All required metals present with nuggets > 0

**Time Complexity:** O(C) where C is number of components

## Performance Considerations

### Optimization Targets

- **Maximization mode**: < 50ms for any recipe
- **Economical mode**: < 100ms for any recipe
- **Validation**: < 1ms

### Optimization Techniques

1. **Binary search** for maximization reduces search space from O(N) to O(log N)
2. **Early termination** when impossible configurations detected
3. **Memoization** of rarity scores (computed once, reused)
4. **Efficient slot distribution** using greedy algorithm
5. **Minimal object allocation** during search

### Scalability

The optimizer is designed for the current set of 8 metals and ~9 alloy recipes. If the game expands:
- Algorithm complexity remains manageable (logarithmic/linear)
- Rarity scores can be easily extended
- No architectural changes needed for additional metals/recipes

## UI Integration

### Optimizer Trigger Points

1. **Recipe selection with preset load**: When user selects an alloy from dropdown and loads a preset
2. **Ingot amount slider**: When user adjusts the slider with economical mode enabled, automatically re-optimizes
3. **Maximize button**: Clicking the maximize button (next to slider) triggers maximization mode
4. **Economical optimize button**: Clicking the wand icon when economical mode is enabled optimizes for current ingot amount
5. **Economical mode toggle**: Switch control enables/disables economical optimization on slider changes

### Result Display

The UI displays optimizer results in the ResultCard component:
- **Crucible slots**: Each slot shows metal type, nugget count (via CruciblePanel)
- **Composition card**: Shows percentage breakdown for each metal and total units
- **Ingot amount slider**: Displays and controls the target ingot count (1 to max)
- **Maximize button**: Icon button next to slider for quick maximization
- **Economical switch**: Toggle to enable/disable economical optimization mode
- **Economical optimize button**: Wand icon button to manually trigger economical optimization

### User Feedback

- **Immediate updates**: Optimization happens instantly when slider moves (if economical mode enabled)
- **Visual feedback**: Slider color matches the selected alloy's color
- **Mode indicators**: Switch clearly shows when economical mode is active
- **Tooltips**: Hover tooltips explain the economical optimize button functionality
- **Validation feedback**: Existing validation system shows if composition is valid

## Future Enhancements

### Potential Extensions

1. **Multi-objective optimization**: Balance between ingot count and rarity cost
2. **Inventory-aware optimization**: Consider available metals in player inventory
3. **Batch optimization**: Optimize for multiple alloys simultaneously
4. **Custom rarity weights**: Allow users to adjust metal rarity preferences
5. **Preset library**: Save and load optimized recipes
6. **Optimization history**: Track and compare different optimization results

### Extensibility Points

- **Strategy pattern**: Easy to add new optimization modes
- **Pluggable rarity system**: Rarity scores can be externalized to configuration
- **Custom validators**: Additional validation rules can be added modularly
- **Algorithm swapping**: Maximization/economical algorithms can be replaced independently
