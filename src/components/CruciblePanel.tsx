import type { CrucibleState } from "../types/crucible";
import type { Metal, AlloyRecipe } from "../types/alloys";
import { createEmptyCrucible, getAvailableMetals, adjustCrucibleForAlloy } from "../lib/alloyLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CrucibleSlotRow } from "./CrucibleSlotRow";
import { Lock, Unlock, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CruciblePanelProps {
  crucible: CrucibleState;
  onCrucibleChange: (crucible: CrucibleState) => void;
  allMetals: Metal[];
  recipes: AlloyRecipe[];
  selectedRecipe: AlloyRecipe | null;
  ratioLocked: boolean;
  onRatioLockedChange: (locked: boolean) => void;
}

export function CruciblePanel({ crucible, onCrucibleChange, allMetals, recipes, selectedRecipe, ratioLocked, onRatioLockedChange }: CruciblePanelProps) {
  const handleSlotChange = (slotId: number, patch: Partial<typeof crucible.slots[0]>) => {
    const newSlots = crucible.slots.map(slot =>
      slot.id === slotId ? { ...slot, ...patch } : slot
    );
    onCrucibleChange({ slots: newSlots });
  };

  // Calculate available metals for each slot individually
  // For each slot, we consider the metals in OTHER slots (excluding the current slot)
  const getAvailableMetalsForSlot = (slotId: number): Metal[] => {
    // Create a temporary crucible state excluding the current slot's metal
    const otherSlots = crucible.slots.map(slot =>
      slot.id === slotId ? { ...slot, metalId: null } : slot
    );
    const tempCrucible: CrucibleState = { slots: otherSlots };

    return getAvailableMetals(tempCrucible, allMetals, recipes);
  };

  const handleClear = () => {
    onCrucibleChange(createEmptyCrucible());
  };

  const handleNuggetChange = (slotId: number, nuggets: number) => {
    // If we have a selected recipe and ratio is locked, adjust other slots to maintain ratio
    if (selectedRecipe && ratioLocked) {
      // First update the changed slot
      const updatedCrucible: CrucibleState = {
        slots: crucible.slots.map(slot =>
          slot.id === slotId ? { ...slot, nuggets } : slot
        ),
      };

      // Then adjust other slots to maintain the alloy ratio
      const adjustedCrucible = adjustCrucibleForAlloy(updatedCrucible, slotId, selectedRecipe);
      onCrucibleChange(adjustedCrucible);
    } else {
      // No selected recipe or ratio not locked, just update the slot normally
      handleSlotChange(slotId, { nuggets });
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Crucible Inputs</CardTitle>
        <CardDescription>
          Add metals to your crucible. Each slot can hold 0-128 nuggets of a single metal type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Crucible slots">
          {crucible.slots.map(slot => (
            <CrucibleSlotRow
              key={slot.id}
              slot={slot}
              availableMetals={getAvailableMetalsForSlot(slot.id)}
              onChange={handleSlotChange}
              onNuggetChange={handleNuggetChange}
            />
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ratio-lock"
                  checked={ratioLocked}
                  onCheckedChange={(checked: boolean) => onRatioLockedChange(checked === true)}
                  disabled={!selectedRecipe}
                />
                <Label
                  htmlFor="ratio-lock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  {ratioLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  Lock Ratio
                  {selectedRecipe && <span className="text-xs text-muted-foreground">({selectedRecipe.name})</span>}
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Keep the current alloy percentage split and scale the total amount when adjusting nugget counts.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              aria-label="Clear all crucible slots"
            >
              Clear Crucible
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
