import { METALS } from "../data/alloys";
import { aggregateCrucible } from "../lib/alloyLogic";
import { calculateRarityCost } from "../lib/metalRarity";
import type { AlloyRecipe, MetalId, MetalNuggetAmount } from "../types/alloys";
import type { CrucibleState } from "../types/crucible";
import type {
  BatchPlan,
  BatchRun,
  CraftableRecipeResult,
  InventoryState,
  PlannerInsights,
  RecipePlannerResult,
  ScarcityMode,
} from "../types/planner";
import {
  NUGGETS_PER_INGOT,
  PERCENTAGE_TOLERANCE,
  UNITS_PER_INGOT,
  UNITS_PER_NUGGET,
} from "./constants";
import { amountsToCrucible, countSlotsUsed } from "./shared/crucibleAllocation";
import { validateRecipe } from "./recipeValidator";

interface RunCandidate {
  crucible: CrucibleState;
  consumed: InventoryState;
  ingotsProduced: number;
  rarityCost: number;
  copperUsed: number;
  slotsUsed: number;
  midpointDeviation: number;
}

const runCandidateCache = new Map<string, RunCandidate | null>();

function emptyInventory(): InventoryState {
  return METALS.reduce((inventory, metal) => {
    inventory[metal.id] = 0;
    return inventory;
  }, {} as InventoryState);
}

export function normalizeInventoryState(input?: Partial<Record<MetalId, number>>): InventoryState {
  const inventory = emptyInventory();

  for (const metal of METALS) {
    const value = input?.[metal.id] ?? 0;
    inventory[metal.id] = value > 0 ? Math.floor(value) : 0;
  }

  return inventory;
}

export function getInventoryTotalNuggets(inventory: InventoryState): number {
  return Object.values(inventory).reduce((sum, nuggets) => sum + nuggets, 0);
}

export function hasInventoryForCost(inventory: InventoryState, cost: InventoryState): boolean {
  return METALS.every((metal) => inventory[metal.id] >= cost[metal.id]);
}

export function subtractInventory(inventory: InventoryState, cost: InventoryState): InventoryState {
  const remaining = emptyInventory();

  for (const metal of METALS) {
    remaining[metal.id] = Math.max(0, inventory[metal.id] - cost[metal.id]);
  }

  return remaining;
}

function addInventory(a: InventoryState, b: InventoryState): InventoryState {
  const combined = emptyInventory();

  for (const metal of METALS) {
    combined[metal.id] = a[metal.id] + b[metal.id];
  }

  return combined;
}

function calculateUpperBound(recipe: AlloyRecipe, inventory: InventoryState): number {
  const totalRelevantNuggets = recipe.components.reduce((sum, component) => sum + inventory[component.metalId], 0);
  return Math.floor(totalRelevantNuggets / 20);
}

function createInventoryFromAmounts(amounts: MetalNuggetAmount[]): InventoryState {
  const inventory = emptyInventory();
  for (const amount of amounts) {
    inventory[amount.metalId] = amount.nuggets;
  }
  return inventory;
}

function compareRunCandidates(left: RunCandidate, right: RunCandidate, mode: ScarcityMode): number {
  if (mode === "economical") {
    return (
      left.rarityCost - right.rarityCost ||
      left.slotsUsed - right.slotsUsed ||
      left.midpointDeviation - right.midpointDeviation ||
      left.copperUsed - right.copperUsed
    );
  }

  if (mode === "preserve-copper") {
    return (
      left.copperUsed - right.copperUsed ||
      left.rarityCost - right.rarityCost ||
      left.slotsUsed - right.slotsUsed ||
      left.midpointDeviation - right.midpointDeviation
    );
  }

  if (mode === "max-output") {
    return (
      left.slotsUsed - right.slotsUsed ||
      left.rarityCost - right.rarityCost ||
      left.midpointDeviation - right.midpointDeviation ||
      left.copperUsed - right.copperUsed
    );
  }

  return (
    left.midpointDeviation - right.midpointDeviation ||
    left.rarityCost - right.rarityCost ||
    left.copperUsed - right.copperUsed ||
    left.slotsUsed - right.slotsUsed
  );
}

function getRunCandidateCacheKey(recipe: AlloyRecipe, targetIngots: number, mode: ScarcityMode): string {
  return `${recipe.id}:${targetIngots}:${mode}`;
}

export function getRunCandidate(recipe: AlloyRecipe, targetIngots: number, mode: ScarcityMode): RunCandidate | null {
  if (targetIngots <= 0) {
    return null;
  }

  const cacheKey = getRunCandidateCacheKey(recipe, targetIngots, mode);
  const cached = runCandidateCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const targetUnits = targetIngots * UNITS_PER_INGOT;
  const targetNuggets = targetIngots * NUGGETS_PER_INGOT;
  const components = recipe.components;
  let bestCandidate: RunCandidate | null = null;

  function solve(index: number, currentNuggets: number, currentAmounts: MetalNuggetAmount[]) {
    if (index === components.length) {
      if (currentNuggets !== targetNuggets || countSlotsUsed(currentAmounts) > 4) {
        return;
      }

      const crucible = amountsToCrucible(currentAmounts);
      if (!validateRecipe(crucible, recipe, targetIngots).valid) {
        return;
      }

      const consumed = createInventoryFromAmounts(currentAmounts);
      const rarityCost = calculateRarityCost(currentAmounts);
      const copperUsed = consumed.copper;
      const slotsUsed = countSlotsUsed(currentAmounts);
      const midpointDeviation = recipe.components.reduce((sum, component) => {
        const amount = currentAmounts.find((entry) => entry.metalId === component.metalId)?.nuggets ?? 0;
        const percent = ((amount * UNITS_PER_NUGGET) / targetUnits) * 100;
        return sum + Math.abs(percent - ((component.minPercent + component.maxPercent) / 2));
      }, 0);

      const candidate: RunCandidate = {
        crucible,
        consumed,
        ingotsProduced: targetIngots,
        rarityCost,
        copperUsed,
        slotsUsed,
        midpointDeviation,
      };

      if (!bestCandidate || compareRunCandidates(candidate, bestCandidate, mode) < 0) {
        bestCandidate = candidate;
      }

      return;
    }

    const component = components[index];
    const minNuggets = Math.ceil((((component.minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits - 0.000001) / UNITS_PER_NUGGET);
    const maxNuggets = Math.floor((((component.maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits + 0.000001) / UNITS_PER_NUGGET);

    let minRemaining = 0;
    let maxRemaining = 0;
    for (let nextIndex = index + 1; nextIndex < components.length; nextIndex++) {
      const nextComponent = components[nextIndex];
      minRemaining += Math.ceil((((nextComponent.minPercent - PERCENTAGE_TOLERANCE) / 100) * targetUnits - 0.000001) / UNITS_PER_NUGGET);
      maxRemaining += Math.floor((((nextComponent.maxPercent + PERCENTAGE_TOLERANCE) / 100) * targetUnits + 0.000001) / UNITS_PER_NUGGET);
    }

    const lowerBound = Math.max(minNuggets, targetNuggets - currentNuggets - maxRemaining);
    const upperBound = Math.min(maxNuggets, targetNuggets - currentNuggets - minRemaining);

    for (let nuggets = lowerBound; nuggets <= upperBound; nuggets++) {
      const amounts = [...currentAmounts, { metalId: component.metalId, nuggets }];
      if (countSlotsUsed(amounts) > 4) {
        continue;
      }
      solve(index + 1, currentNuggets + nuggets, amounts);
    }
  }

  solve(0, 0, []);
  runCandidateCache.set(cacheKey, bestCandidate);
  return bestCandidate;
}

function buildStateKey(recipe: AlloyRecipe, inventory: InventoryState, remainingIngots: number): string {
  const relevantCounts = recipe.components.map((component) => inventory[component.metalId]).join(":");
  return `${recipe.id}:${remainingIngots}:${relevantCounts}`;
}

function buildPlanForTarget(
  recipe: AlloyRecipe,
  inventory: InventoryState,
  mode: ScarcityMode,
  targetIngots: number,
  maxSingleRunIngots: number,
): BatchPlan | null {
  const memo = new Map<string, BatchRun[] | null>();

  function solve(remainingInventory: InventoryState, remainingIngots: number): BatchRun[] | null {
    if (remainingIngots === 0) {
      return [];
    }

    const stateKey = buildStateKey(recipe, remainingInventory, remainingIngots);
    if (memo.has(stateKey)) {
      return memo.get(stateKey) ?? null;
    }

    for (let runIngots = Math.min(maxSingleRunIngots, remainingIngots); runIngots >= 1; runIngots--) {
      const candidate = getRunCandidate(recipe, runIngots, mode);
      if (!candidate || !hasInventoryForCost(remainingInventory, candidate.consumed)) {
        continue;
      }

      const nextInventory = subtractInventory(remainingInventory, candidate.consumed);
      const nextRuns = solve(nextInventory, remainingIngots - runIngots);

      if (nextRuns) {
        const runNumber = targetIngots - remainingIngots + 1;
        const currentRun: BatchRun = {
          runNumber,
          ingotsProduced: candidate.ingotsProduced,
          crucible: candidate.crucible,
          consumed: candidate.consumed,
          inventoryAfter: nextInventory,
        };
        const runs = [currentRun, ...nextRuns];
        memo.set(stateKey, runs);
        return runs;
      }
    }

    memo.set(stateKey, null);
    return null;
  }

  const runs = solve(inventory, targetIngots);
  if (!runs) {
    return null;
  }

  const consumed = runs.reduce((total, run) => addInventory(total, run.consumed), emptyInventory());
  const inventoryAfter = subtractInventory(inventory, consumed);

  return {
    recipeId: recipe.id,
    totalIngots: targetIngots,
    runs: runs.map((run, index) => ({
      ...run,
      runNumber: index + 1,
      inventoryAfter: subtractInventory(
        inventory,
        runs.slice(0, index + 1).reduce((total, current) => addInventory(total, current.consumed), emptyInventory()),
      ),
    })),
    inventoryBefore: inventory,
    inventoryAfter,
    leftovers: inventoryAfter,
    scarcityMode: mode,
    maxCraftableIngots: targetIngots,
  };
}

export function findMaxCraftableIngots(recipe: AlloyRecipe, inventory: InventoryState, mode: ScarcityMode): number {
  const normalizedInventory = normalizeInventoryState(inventory);
  const upperBound = calculateUpperBound(recipe, normalizedInventory);
  const maxRunCandidate = getMaxSingleRunIngots(recipe, mode);

  if (maxRunCandidate === 0) {
    return 0;
  }

  for (let total = upperBound; total >= 1; total--) {
    const plan = buildPlanForTarget(recipe, normalizedInventory, mode, total, maxRunCandidate);
    if (plan) {
      return total;
    }
  }

  return 0;
}

function getMaxSingleRunIngots(recipe: AlloyRecipe, mode: ScarcityMode): number {
  for (let count = 50; count >= 1; count--) {
    if (getRunCandidate(recipe, count, mode)) {
      return count;
    }
  }

  return 0;
}

export function buildBatchPlan(
  recipe: AlloyRecipe,
  inventory: InventoryState,
  mode: ScarcityMode,
  targetIngots: number,
): BatchPlan | null {
  const normalizedInventory = normalizeInventoryState(inventory);
  const maxSingleRunIngots = getMaxSingleRunIngots(recipe, mode);
  if (maxSingleRunIngots === 0) {
    return null;
  }

  const plan = buildPlanForTarget(recipe, normalizedInventory, mode, targetIngots, maxSingleRunIngots);
  if (!plan) {
    return null;
  }

  return {
    ...plan,
    maxCraftableIngots: findMaxCraftableIngots(recipe, normalizedInventory, mode),
  };
}

export function getPlannerInsights(
  recipe: AlloyRecipe,
  inventory: InventoryState,
  mode: ScarcityMode,
  requestedTargetIngots: number,
): PlannerInsights {
  const normalizedInventory = normalizeInventoryState(inventory);
  const upperBound = calculateUpperBound(recipe, normalizedInventory);
  const maxSingleRunIngots = getMaxSingleRunIngots(recipe, mode);
  let minimumValidIngots: number | null = null;
  let previousValidIngots: number | null = null;
  let nextValidIngots: number | null = null;

  for (let target = 1; target <= upperBound; target++) {
    if (buildPlanForTarget(recipe, normalizedInventory, mode, target, maxSingleRunIngots)) {
      minimumValidIngots = target;
      break;
    }
  }

  if (requestedTargetIngots > 0) {
    for (let target = Math.min(requestedTargetIngots, upperBound); target >= 1; target--) {
      if (buildPlanForTarget(recipe, normalizedInventory, mode, target, maxSingleRunIngots)) {
        previousValidIngots = target;
        break;
      }
    }

    for (let target = requestedTargetIngots + 1; target <= upperBound; target++) {
      if (buildPlanForTarget(recipe, normalizedInventory, mode, target, maxSingleRunIngots)) {
        nextValidIngots = target;
        break;
      }
    }
  }

  let limitingMetalId: MetalId | null = null;
  let smallestRatio = Number.POSITIVE_INFINITY;
  for (const component of recipe.components) {
    const midpointPercent = (component.minPercent + component.maxPercent) / 2;
    const midpointNuggets = (midpointPercent / 100) * 20;
    if (midpointNuggets <= 0) {
      continue;
    }

    const supportedIngots = normalizedInventory[component.metalId] / midpointNuggets;
    if (supportedIngots < smallestRatio) {
      smallestRatio = supportedIngots;
      limitingMetalId = component.metalId;
    }
  }

  return {
    minimumValidIngots,
    previousValidIngots,
    nextValidIngots,
    limitingMetalId,
  };
}

function getScarcityScore(plan: BatchPlan, mode: ScarcityMode): number {
  const consumedAmounts = METALS
    .map((metal) => ({ metalId: metal.id, nuggets: plan.inventoryBefore[metal.id] - plan.inventoryAfter[metal.id] }))
    .filter((amount) => amount.nuggets > 0);
  const rarityCost = calculateRarityCost(consumedAmounts);
  const copperUsed = plan.inventoryBefore.copper - plan.inventoryAfter.copper;

  if (mode === "economical") {
    return rarityCost;
  }

  if (mode === "preserve-copper") {
    return copperUsed;
  }

  if (mode === "max-output") {
    return -plan.totalIngots;
  }

  return rarityCost + (plan.runs.length * 8);
}

export function findCraftableRecipes(
  inventory: InventoryState,
  recipes: AlloyRecipe[],
  mode: ScarcityMode,
): CraftableRecipeResult[] {
  const normalizedInventory = normalizeInventoryState(inventory);

  const results = recipes.flatMap((recipe) => {
    const maxCraftableIngots = findMaxCraftableIngots(recipe, normalizedInventory, mode);
    if (maxCraftableIngots <= 0) {
      return [];
    }

    const plan = buildBatchPlan(recipe, normalizedInventory, mode, maxCraftableIngots);
    if (!plan) {
      return [];
    }

    const consumed = subtractInventory(plan.inventoryBefore, plan.inventoryAfter);
    const rarityCost = calculateRarityCost(
      METALS.map((metal) => ({ metalId: metal.id, nuggets: consumed[metal.id] })).filter((amount) => amount.nuggets > 0),
    );
    const insights = getPlannerInsights(recipe, normalizedInventory, mode, maxCraftableIngots);

    return [{
      recipeId: recipe.id,
      totalIngots: maxCraftableIngots,
      consumed,
      leftovers: plan.leftovers,
      scarcityScore: getScarcityScore(plan, mode),
      rarityCost,
      copperUsed: consumed.copper,
      limitingMetalId: insights.limitingMetalId,
      plan,
    }];
  });

  return results.sort((left, right) => {
    if (mode === "max-output") {
      return (
        right.totalIngots - left.totalIngots ||
        left.plan.runs.length - right.plan.runs.length ||
        left.scarcityScore - right.scarcityScore
      );
    }

    return (
      left.scarcityScore - right.scarcityScore ||
      right.totalIngots - left.totalIngots ||
      left.plan.runs.length - right.plan.runs.length
    );
  });
}

export function planRecipeFromInventory(
  recipe: AlloyRecipe,
  inventory: InventoryState,
  mode: ScarcityMode,
  requestedTargetIngots: number,
): RecipePlannerResult {
  const normalizedInventory = normalizeInventoryState(inventory);
  const maxCraftableIngots = findMaxCraftableIngots(recipe, normalizedInventory, mode);
  const insights = getPlannerInsights(recipe, normalizedInventory, mode, requestedTargetIngots);

  if (maxCraftableIngots === 0) {
    return {
      maxCraftableIngots: 0,
      requestedTargetIngots,
      selectedTargetIngots: null,
      plan: null,
      insights,
    };
  }

  const normalizedTarget = Math.min(Math.max(requestedTargetIngots, 1), maxCraftableIngots);
  const plan = buildBatchPlan(recipe, normalizedInventory, mode, normalizedTarget);

  return {
    maxCraftableIngots,
    requestedTargetIngots,
    selectedTargetIngots: plan ? normalizedTarget : null,
    plan,
    insights,
  };
}

export function getCrucibleInventory(crucible: CrucibleState): InventoryState {
  const inventory = emptyInventory();
  for (const amount of aggregateCrucible(crucible)) {
    inventory[amount.metalId] = amount.nuggets;
  }
  return inventory;
}
