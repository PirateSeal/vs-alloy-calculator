import { memo } from "react";
import { Flame, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { clamp } from "@/features/metallurgy/lib/alloyLogic";
import { track } from "@/lib/analytics";
import { useTranslation } from "@/i18n";
import type { CrucibleSlot } from "@/features/metallurgy/types/crucible";
import type { Metal, MetalId } from "@/features/metallurgy/types/alloys";

interface CrucibleSlotRowProps {
  slot: CrucibleSlot;
  availableMetals: Metal[];
  onChange: (slotId: number, patch: Partial<CrucibleSlot>) => void;
  onNuggetChange?: (slotId: number, nuggets: number) => void;
  onClearSlot?: (slotId: number) => void;
}

export const CrucibleSlotRow = memo(function CrucibleSlotRow({
  slot,
  availableMetals,
  onChange,
  onNuggetChange,
  onClearSlot,
}: CrucibleSlotRowProps) {
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

    if (onNuggetChange) {
      onNuggetChange(slot.id, clamped);
    } else {
      onChange(slot.id, { nuggets: clamped });
    }
  };

  const selectedMetal = availableMetals.find((metal) => metal.id === slot.metalId);
  const hasMetal = Boolean(selectedMetal && slot.metalId);

  return (
    <div
      className={`surface-subtle animate-surface-in-soft group flex flex-col gap-4 rounded-[1.5rem] p-4 ring-1 ring-inset transition-[background-color,border-color,box-shadow] duration-200 focus-within:ring-primary/50 ${
        hasMetal ? "bg-background/40 ring-border/35" : "bg-background/24 ring-border/25"
      }`}
      style={
        selectedMetal
          ? {
              backgroundImage: `linear-gradient(145deg, ${selectedMetal.color}18, transparent 34%)`,
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="surface-chip inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {t("crucible.slot.label", { n: slot.id + 1 })}
          </span>
          {selectedMetal ? (
            <span className="text-xs font-medium text-muted-foreground">
              {getMetalShortLabel(selectedMetal.id)}
            </span>
          ) : null}
        </div>

        {hasMetal ? (
          <span className="rounded-full bg-background/72 px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-inset ring-border/25">
            {t("crucible.slot.nuggets_units", {
              nuggets: slot.nuggets,
              nuggetLabel: t(slot.nuggets === 1 ? "common.nugget" : "common.nuggets"),
              units,
              unitLabel: t(units === 1 ? "common.unit" : "common.units"),
            })}
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("crucible.slot.metal_type")}
          </span>
          {hasMetal && onClearSlot ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                onClearSlot(slot.id);
                track("slot-cleared", { slot: slot.id });
              }}
              className="rounded-full"
              aria-label={t("crucible.slot.clear_aria", { n: slot.id + 1 })}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <Select value={slot.metalId || "empty"} onValueChange={handleMetalChange}>
          <SelectTrigger
            id={`slot-${slot.id}-metal`}
            aria-label={t("crucible.slot.metal_aria", { n: slot.id + 1 })}
            className="h-13 rounded-[1rem] border-border/45 bg-background/70 text-sm"
          >
            <SelectValue>
              {selectedMetal ? (
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={selectedMetal.nuggetImage}
                    alt=""
                    className="image-outline h-8 w-8 rounded-xl bg-background/80 p-1 object-contain"
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
                    className="image-outline h-5 w-5 rounded-md bg-background/80 p-0.5 object-contain"
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
      </div>

      {hasMetal ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("crucible.slot.nugget_amount")}
              </span>
              <div className="font-mono text-2xl font-bold tabular-nums text-primary">
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
                className="w-full"
              />
            </div>
          </div>

          <div
            className="flex min-h-[44px] items-center"
            style={{ "--slider-color": selectedMetal?.color } as React.CSSProperties}
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

          <div className="grid grid-cols-4 gap-1.5">
            {([-10, -1, 1, 10] as const).map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleNuggetsChange(slot.nuggets + delta)}
                className="surface-chip h-10 rounded-[1rem] bg-background/50 text-xs font-bold text-muted-foreground ring-1 ring-inset ring-border/25 transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-primary/15 hover:text-primary active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:active:scale-100"
                aria-label={`${delta > 0 ? "Add" : "Remove"} ${Math.abs(delta)} nuggets`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
