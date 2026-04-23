import type { CrucibleState } from "@/features/metallurgy/types/crucible";
import type { Metal, AlloyRecipe } from "@/features/metallurgy/types/alloys";
import { createEmptyCrucible, getAvailableMetals } from "@/features/metallurgy/lib/alloyLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrucibleSlotRow } from "./CrucibleSlotRow";
import { FlameKindling, RotateCcw } from "lucide-react";
import { useTranslation } from "@/i18n";


interface CruciblePanelProps {
  crucible: CrucibleState;
  onCrucibleChange: (crucible: CrucibleState) => void;
  allMetals: Metal[];
  recipes: AlloyRecipe[];
}

export function CruciblePanel({ crucible, onCrucibleChange, allMetals, recipes }: CruciblePanelProps) {
  const { t } = useTranslation();
  const occupiedSlots = crucible.slots.filter((slot) => slot.metalId).length;
  const filledNuggets = crucible.slots.reduce((total, slot) => total + slot.nuggets, 0);

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
    <Card className="surface-panel overflow-hidden rounded-[1.9rem] border border-border/35 bg-card/92">
      <CardHeader className="border-b border-border/30 bg-background/20 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FlameKindling className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <CardTitle className="text-lg sm:text-xl">{t("crucible.title")}</CardTitle>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground" data-pretty-text>
                {t("crucible.description")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              aria-label={t("crucible.clear_all")}
              className="rounded-full border-border/60 bg-background/72 px-3 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("crucible.clear_all")}
            </Button>
          </div>

          {occupiedSlots > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="surface-chip inline-flex items-center rounded-full bg-background/60 px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ring-border/30">
                {occupiedSlots}/{crucible.slots.length} slots
              </span>
              <span className="surface-chip inline-flex items-center rounded-full bg-background/60 px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ring-border/30 font-mono tabular-nums">
                {filledNuggets} {t(filledNuggets === 1 ? "common.nugget" : "common.nuggets")}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-5 sm:p-6 sm:pt-5">
        <div
          className="stagger-surface-children grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:gap-5"
          role="group"
          aria-label={t("crucible.aria_group")}
        >
          {crucible.slots.map(slot => (
            <CrucibleSlotRow
              key={`${slot.id}-${slot.metalId ? "filled" : "empty"}`}
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
