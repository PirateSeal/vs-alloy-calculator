import type { CrucibleSlot } from "../types/crucible";
import type { Metal, MetalId } from "../types/alloys";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { NumberInput } from "./ui/number-input";
import { clamp } from "../lib/alloyLogic";

interface CrucibleSlotRowProps {
  slot: CrucibleSlot;
  availableMetals: Metal[];
  onChange: (slotId: number, patch: Partial<CrucibleSlot>) => void;
  onNuggetChange?: (slotId: number, nuggets: number) => void;
}

export function CrucibleSlotRow({ slot, availableMetals, onChange, onNuggetChange }: CrucibleSlotRowProps) {
  const units = slot.nuggets * 5;

  const handleMetalChange = (value: string) => {
    if (value === "empty") {
      onChange(slot.id, { metalId: null, nuggets: 0 });
    } else {
      onChange(slot.id, { metalId: value as MetalId });
    }
  };

  const handleNuggetsChange = (value: number) => {
    const clamped = clamp(Math.round(value), 0, 128);

    // If onNuggetChange is provided, use it (for ratio adjustment)
    // Otherwise, use the regular onChange
    if (onNuggetChange) {
      onNuggetChange(slot.id, clamped);
    } else {
      onChange(slot.id, { nuggets: clamped });
    }
  };

  const selectedMetal = availableMetals.find(m => m.id === slot.metalId);

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3 overflow-hidden">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`slot-${slot.id}-metal`} className="text-xs font-medium">
          Slot {slot.id + 1}
        </Label>
        <span className="text-[10px] text-muted-foreground transition-all duration-300">
          {slot.nuggets} nuggets ({units} units)
        </span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`slot-${slot.id}-metal`} className="text-[10px] text-muted-foreground">
          Metal Type
        </Label>
        <Select
          value={slot.metalId || "empty"}
          onValueChange={handleMetalChange}
        >
          <SelectTrigger id={`slot-${slot.id}-metal`} aria-label={`Select metal for slot ${slot.id + 1}`} className="h-10 text-sm">
            <SelectValue placeholder="Empty slot">
              {selectedMetal && (
                <div className="flex items-center gap-2">
                  <img
                    src={selectedMetal.nuggetImage}
                    alt=""
                    className="w-5 h-5 object-contain"
                    aria-hidden="true"
                  />
                  <span>{selectedMetal.label} ({selectedMetal.shortLabel})</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empty">Empty slot</SelectItem>
            {availableMetals.map(metal => (
              <SelectItem key={metal.id} value={metal.id}>
                <div className="flex items-center gap-2">
                  <img
                    src={metal.nuggetImage}
                    alt=""
                    className="w-5 h-5 object-contain"
                    aria-hidden="true"
                  />
                  <span>{metal.label} ({metal.shortLabel})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`space-y-1.5 transition-all duration-300 ease-out overflow-hidden ${
          slot.metalId
            ? 'max-h-24 opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2'
        }`}
      >
        <Label htmlFor={`slot-${slot.id}-slider`} className="text-[10px] text-muted-foreground">
          Nugget Amount
        </Label>
        <div className="flex items-center gap-2">
          <div
            className="flex-[8]"
            style={{
              // @ts-expect-error - CSS custom property
              '--slider-color': selectedMetal?.color
            }}
          >
            <Slider
              id={`slot-${slot.id}-slider`}
              min={0}
              max={128}
              step={1}
              value={[slot.nuggets]}
              onValueChange={(values) => handleNuggetsChange(values[0])}
              aria-label={`Nugget amount for slot ${slot.id + 1}`}
              className="[&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)]"
              disabled={!slot.metalId}
            />
          </div>
          <NumberInput
            id={`slot-${slot.id}-input`}
            min={0}
            max={128}
            value={slot.nuggets}
            onChange={handleNuggetsChange}
            aria-label={`Nugget input for slot ${slot.id + 1}`}
            className="flex-[2] h-8"
            disabled={!slot.metalId}
          />
        </div>
      </div>
    </div>
  );
}
