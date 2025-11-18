import type { CrucibleState } from "../types/crucible";
import type { Metal, AlloyRecipe } from "../types/alloys";
import { createEmptyCrucible, getAvailableMetals } from "../lib/alloyLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrucibleSlotRow } from "./CrucibleSlotRow";
import { Trash2 } from "lucide-react";


interface CruciblePanelProps {
  crucible: CrucibleState;
  onCrucibleChange: (crucible: CrucibleState) => void;
  allMetals: Metal[];
  recipes: AlloyRecipe[];
  selectedRecipe: AlloyRecipe | null;
}

export function CruciblePanel({ crucible, onCrucibleChange, allMetals, recipes, selectedRecipe }: CruciblePanelProps) {
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

  const handleClearSlot = (slotId: number) => {
    handleSlotChange(slotId, { metalId: null, nuggets: 0 });
  };

  const handleNuggetChange = (slotId: number, nuggets: number) => {
    handleSlotChange(slotId, { nuggets });
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle>Crucible Inputs</CardTitle>
            <CardDescription>
              Add metals to your crucible. Each slot can hold 0-128 nuggets of a single metal type.
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            aria-label="Clear all crucible slots"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Crucible slots">
          {crucible.slots.map(slot => (
            <CrucibleSlotRow
              key={slot.id}
              slot={slot}
              availableMetals={getAvailableMetalsForSlot(slot.id)}
              onChange={handleSlotChange}
              onNuggetChange={handleNuggetChange}
              onClearSlot={handleClearSlot}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
