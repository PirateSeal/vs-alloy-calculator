import type { CrucibleSlot } from "../types/crucible";
import type { Metal, MetalId } from "../types/alloys";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { NumberInput } from "./ui/number-input";
import { Button } from "./ui/button";
import { clamp } from "../lib/alloyLogic";
import { track } from "../lib/analytics";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n";

interface CrucibleSlotRowProps {
  slot: CrucibleSlot;
  availableMetals: Metal[];
  onChange: (slotId: number, patch: Partial<CrucibleSlot>) => void;
  onNuggetChange?: (slotId: number, nuggets: number) => void;
  onClearSlot?: (slotId: number) => void;
}

export function CrucibleSlotRow({ slot, availableMetals, onChange, onNuggetChange, onClearSlot }: CrucibleSlotRowProps) {
  const { t, getMetalLabel, getMetalShortLabel } = useTranslation();
  const units = slot.nuggets * 5;

  const handleMetalChange = (value: string) => {
    if (value === "empty") {
      onChange(slot.id, { metalId: null, nuggets: 0 });
    } else {
      onChange(slot.id, { metalId: value as MetalId });
      track("metal-selected", { slot: slot.id, metal: value });
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
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`slot-${slot.id}-metal`} className="text-xs font-medium">
            {t("crucible.slot.label", { n: slot.id + 1 })}
          </Label>
          <span className="text-[10px] text-muted-foreground transition-all duration-300">
            {t("crucible.slot.nuggets_units", {
              nuggets: slot.nuggets,
              nuggetLabel: t(slot.nuggets === 1 ? "common.nugget" : "common.nuggets"),
              units,
              unitLabel: t("common.units"),
            })}
          </span>
        </div>

        {/* Clear slot button - only show if slot has metal */}
        {slot.metalId && onClearSlot && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => { onClearSlot(slot.id); track("slot-cleared", { slot: slot.id }); }}
            className="h-6 w-6 p-0 flex-shrink-0"
            aria-label={t("crucible.slot.clear_aria", { n: slot.id + 1 })}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`slot-${slot.id}-metal`} className="text-[10px] text-muted-foreground">
          {t("crucible.slot.metal_type")}
        </Label>
        <Select
          value={slot.metalId || "empty"}
          onValueChange={handleMetalChange}
        >
          <SelectTrigger id={`slot-${slot.id}-metal`} aria-label={t("crucible.slot.metal_aria", { n: slot.id + 1 })} className="h-10 text-sm">
            <SelectValue placeholder={t("crucible.slot.empty")}>
              {selectedMetal && (
                <div className="flex items-center gap-2">
                  <img
                    src={selectedMetal.nuggetImage}
                    alt=""
                    className="w-5 h-5 object-contain"
                    aria-hidden="true"
                  />
                  <span>{t("crucible.slot.metal_option", { label: getMetalLabel(selectedMetal.id), short: getMetalShortLabel(selectedMetal.id) })}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empty">{t("crucible.slot.empty")}</SelectItem>
            {availableMetals.map(metal => (
              <SelectItem key={metal.id} value={metal.id}>
                <div className="flex items-center gap-2">
                  <img
                    src={metal.nuggetImage}
                    alt=""
                    className="w-5 h-5 object-contain"
                    aria-hidden="true"
                  />
                  <span>{t("crucible.slot.metal_option", { label: getMetalLabel(metal.id), short: getMetalShortLabel(metal.id) })}</span>
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
          {t("crucible.slot.nugget_amount")}
        </Label>
        <div className="flex items-center gap-2">
          <div
            className="flex-[8] flex items-center min-h-[44px]"
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
              aria-label={t("crucible.slot.slider_aria", { n: slot.id + 1 })}
              className="w-full [&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 touch-none"
              disabled={!slot.metalId}
            />
          </div>
          <NumberInput
            id={`slot-${slot.id}-input`}
            min={0}
            max={128}
            value={slot.nuggets}
            onChange={handleNuggetsChange}
            aria-label={t("crucible.slot.input_aria", { n: slot.id + 1 })}
            className="flex-[2] h-8"
            disabled={!slot.metalId}
          />
        </div>
      </div>
    </div>
  );
}
