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
import { trackPlannerInputChange, trackPlannerPlanToggle } from "@/lib/analytics";

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
      onStateChange((current) => {
        if (current.inventory[metalId] !== nuggets) {
          trackPlannerInputChange("inventory", { metal: metalId, nuggets });
        }

        return {
          ...current,
          inventory: { ...current.inventory, [metalId]: nuggets },
        };
      });
    },
    [onStateChange],
  );

  const clearInventory = useCallback(() => {
    onStateChange((current) => {
      const totalNuggets = getInventoryTotalNuggets(normalizeInventoryState(current.inventory));
      if (totalNuggets > 0 || current.recipeId !== null || current.targetIngots !== 1) {
        trackPlannerInputChange("clear_inventory", { total_nuggets: totalNuggets });
      }

      return {
        ...current,
        inventory: normalizeInventoryState(),
        recipeId: null,
        targetIngots: 1,
      };
    });
  }, [onStateChange]);

  const setScarcityMode = useCallback(
    (mode: ScarcityMode) => {
      onStateChange((current) => {
        if (current.scarcityMode !== mode) {
          trackPlannerInputChange("scarcity_mode", { mode });
        }
        return { ...current, scarcityMode: mode };
      });
    },
    [onStateChange],
  );

  const toggleExpand = useCallback(
    (result: CraftableRecipeResult) => {
      onStateChange((current) => {
        const isClosing = current.recipeId === result.recipeId;
        trackPlannerPlanToggle({
          recipe: result.recipeId,
          action: isClosing ? "close" : "open",
          total_ingots: result.totalIngots,
        });

        return {
          ...current,
          recipeId: isClosing ? null : result.recipeId,
          targetIngots: isClosing ? current.targetIngots : result.totalIngots,
        };
      });
    },
    [onStateChange],
  );

  const setTargetIngots = useCallback(
    (value: number) => {
      onStateChange((current) => {
        if (current.targetIngots !== value) {
          trackPlannerInputChange("target_ingots", {
            value,
            recipe: current.recipeId,
          });
        }
        return { ...current, targetIngots: value };
      });
    },
    [onStateChange],
  );

  return (
    <section className="animate-surface-in stagger-surface-children space-y-4" aria-labelledby="planner-title">
      <PlannerRecipeSelector />

      <PlannerInventory
        inventory={inventory}
        totalNuggets={totalInventoryNuggets}
        scarcityMode={state.scarcityMode}
        onMetalChange={updateInventory}
        onScarcityModeChange={setScarcityMode}
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
