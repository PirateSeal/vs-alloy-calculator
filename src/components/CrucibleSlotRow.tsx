import type { CrucibleSlot } from "../types/crucible";
import type { Metal, MetalId } from "../types/alloys";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { NumberInput } from "./ui/number-input";
import { clamp } from "../lib/alloyLogic";
import { track } from "../lib/analytics";
import { Flame, Trash2 } from "lucide-react";
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
  const hasMetal = Boolean(selectedMetal && slot.metalId);

  return (
    <div className={`animate-surface-in-soft group flex flex-col gap-3 rounded-[1.35rem] p-4 ring-1 ring-inset transition-colors duration-200 focus-within:ring-primary/50 ${
      hasMetal
        ? "bg-background/35 ring-border/35"
        : "bg-background/20 ring-border/25"
    }`}>
      {/* Slot label + clear */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {t("crucible.slot.label", { n: slot.id + 1 })}
        </span>
        {hasMetal && onClearSlot && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              onClearSlot(slot.id);
              track("slot-cleared", { slot: slot.id });
            }}
            className="h-7 w-7 rounded-full"
            aria-label={t("crucible.slot.clear_aria", { n: slot.id + 1 })}
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Metal selector — flat, no inner card */}
      <Select value={slot.metalId || "empty"} onValueChange={handleMetalChange}>
        <SelectTrigger
          id={`slot-${slot.id}-metal`}
          aria-label={t("crucible.slot.metal_aria", { n: slot.id + 1 })}
          className="h-12 rounded-xl border-border/40 bg-background/50 text-sm"
        >
          <SelectValue>
            {selectedMetal ? (
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={selectedMetal.nuggetImage}
                  alt=""
                  className="h-5 w-5 object-contain"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {t("crucible.slot.metal_option", {
                    label: getMetalLabel(selectedMetal.id),
                    short: getMetalShortLabel(selectedMetal.id),
                  })}
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{t("crucible.slot.empty")}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empty">{t("crucible.slot.empty")}</SelectItem>
          {availableMetals.map((metal) => (
            <SelectItem key={metal.id} value={metal.id}>
              <div className="flex items-center gap-2">
                <img
                  src={metal.nuggetImage}
                  alt=""
                  className="h-5 w-5 object-contain"
                  aria-hidden="true"
                />
                <span>
                  {t("crucible.slot.metal_option", {
                    label: getMetalLabel(metal.id),
                    short: getMetalShortLabel(metal.id),
                  })}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Nugget controls — flat, no inner card */}
      {hasMetal && (
        <>
          {/* Count + units */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("crucible.slot.nugget_amount")}
              </span>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-primary">
                {slot.nuggets}
                <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                  = {units} {t(units === 1 ? "common.unit" : "common.units")}
                </span>
              </div>
            </div>
            <div className="w-full max-w-[8.5rem]">
              <NumberInput
                value={slot.nuggets}
                onChange={handleNuggetsChange}
                min={0}
                max={128}
                step={1}
                aria-label={t("crucible.slot.input_aria", { n: slot.id + 1 })}
                className="h-11 w-full rounded-xl border-border/45 bg-background/55 shadow-none"
              />
            </div>
          </div>

          {/* Slider */}
          <div
            className="flex min-h-[44px] items-center"
            style={{
              // @ts-expect-error - CSS custom property
              "--slider-color": selectedMetal?.color,
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
              className="w-full touch-none [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-[var(--slider-color)] [&_span[data-orientation]>span:last-child]:bg-[var(--slider-color)]"
            />
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {([-10, -1, 1, 10] as const).map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleNuggetsChange(slot.nuggets + delta)}
                className="h-8 rounded-xl bg-background/40 text-xs font-bold text-muted-foreground ring-1 ring-inset ring-border/25 transition-colors hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                aria-label={`${delta > 0 ? "Add" : "Remove"} ${Math.abs(delta)} nuggets`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
