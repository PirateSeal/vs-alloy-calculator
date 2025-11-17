import type { CrucibleSlot } from "../types/crucible";
import type { Metal, MetalId } from "../types/alloys";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { clamp } from "../lib/alloyLogic";

interface CrucibleSlotRowProps {
  slot: CrucibleSlot;
  availableMetals: Metal[];
  onChange: (slotId: number, patch: Partial<CrucibleSlot>) => void;
}

export function CrucibleSlotRow({ slot, availableMetals, onChange }: CrucibleSlotRowProps) {
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
    onChange(slot.id, { nuggets: clamped });
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`slot-${slot.id}-metal`} className="text-xs font-medium">
          Slot {slot.id + 1}
        </Label>
        <span className="text-[10px] text-muted-foreground">
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
          <SelectTrigger id={`slot-${slot.id}-metal`} aria-label={`Select metal for slot ${slot.id + 1}`} className="h-8 text-xs">
            <SelectValue placeholder="Empty slot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empty">Empty slot</SelectItem>
            {availableMetals.map(metal => (
              <SelectItem key={metal.id} value={metal.id}>
                {metal.label} ({metal.shortLabel})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {slot.metalId && (
        <div className="space-y-1.5">
          <Label htmlFor={`slot-${slot.id}-slider`} className="text-[10px] text-muted-foreground">
            Nugget Amount
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              id={`slot-${slot.id}-slider`}
              min={0}
              max={128}
              step={1}
              value={[slot.nuggets]}
              onValueChange={(values) => handleNuggetsChange(values[0])}
              aria-label={`Nugget amount for slot ${slot.id + 1}`}
              className="flex-1"
            />
            <Input
              id={`slot-${slot.id}-input`}
              type="number"
              min={0}
              max={128}
              value={slot.nuggets}
              onChange={(e) => handleNuggetsChange(Number(e.target.value))}
              aria-label={`Nugget input for slot ${slot.id + 1}`}
              className="w-14 h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
