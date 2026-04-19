import { useCallback, useMemo } from "react";
import {
  findCraftableRecipes,
  getInventoryTotalNuggets,
  normalizeInventoryState,
  planRecipeFromInventory,
} from "../lib/planner";
import type { AlloyRecipe, MetalId } from "../types/alloys";
import type { CraftableRecipeResult, PlannerState, ScarcityMode } from "../types/planner";
import { PlannerInventory } from "./PlannerInventory";
import { PlannerOutput } from "./PlannerOutput";
import { PlannerRecipeSelector } from "./PlannerRecipeSelector";

interface PlannerViewProps {
  recipes: AlloyRecipe[];
  state: PlannerState;
  onStateChange: React.Dispatch<React.SetStateAction<PlannerState>>;
}

export function PlannerView({ recipes, state, onStateChange }: PlannerViewProps) {
  const inventory = useMemo(() => normalizeInventoryState(state.inventory), [state.inventory]);
  const totalInventoryNuggets = useMemo(() => getInventoryTotalNuggets(inventory), [inventory]);
  const resultList = useMemo(
    () => findCraftableRecipes(inventory, recipes, state.scarcityMode),
    [inventory, recipes, state.scarcityMode],
  );
  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === state.recipeId) ?? null,
    [recipes, state.recipeId],
  );
  const selectedPlan = useMemo(
    () =>
      selectedRecipe
        ? planRecipeFromInventory(selectedRecipe, inventory, state.scarcityMode, state.targetIngots)
        : null,
    [inventory, selectedRecipe, state.scarcityMode, state.targetIngots],
  );

  const updateInventory = useCallback(
    (metalId: MetalId, nuggets: number) => {
      onStateChange((current) => ({
        ...current,
        inventory: { ...current.inventory, [metalId]: nuggets },
      }));
    },
    [onStateChange],
  );

  const clearInventory = useCallback(() => {
    onStateChange((current) => ({
      ...current,
      inventory: normalizeInventoryState(),
      recipeId: null,
      targetIngots: 1,
    }));
  }, [onStateChange]);

  const setScarcityMode = useCallback(
    (mode: ScarcityMode) => {
      onStateChange((current) => ({ ...current, scarcityMode: mode }));
    },
    [onStateChange],
  );

  const toggleExpand = useCallback(
    (result: CraftableRecipeResult) => {
      onStateChange((current) => ({
        ...current,
        recipeId: current.recipeId === result.recipeId ? null : result.recipeId,
        targetIngots:
          current.recipeId === result.recipeId ? current.targetIngots : result.totalIngots,
      }));
    },
    [onStateChange],
  );

  const setTargetIngots = useCallback(
    (value: number) => {
      onStateChange((current) => ({ ...current, targetIngots: value }));
    },
    [onStateChange],
  );

  return (
    <section className="animate-surface-in space-y-4" aria-labelledby="planner-title">
      <PlannerRecipeSelector
        scarcityMode={state.scarcityMode}
        onScarcityModeChange={setScarcityMode}
      />

      <PlannerInventory
        inventory={inventory}
        totalNuggets={totalInventoryNuggets}
        onMetalChange={updateInventory}
        onClear={clearInventory}
      />

      <PlannerOutput
        recipes={recipes}
        resultList={resultList}
        scarcityMode={state.scarcityMode}
        expandedRecipeId={state.recipeId}
        targetIngots={state.targetIngots}
        selectedPlan={selectedPlan}
        onToggleExpand={toggleExpand}
        onTargetIngotsChange={setTargetIngots}
      />
    </section>
  );
}
