import { memo } from "react";
import { BEAR_DATA, HIDE_DATA } from "@/features/leatherwork/lib/leather";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherWorkflow,
} from "@/features/leatherwork/types/leather";
import {
  ANIMAL_OPTIONS,
  BEAR_OPTIONS,
  HIDE_SIZE_OPTIONS,
} from "@/features/leatherwork/data/hideOptions";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { trackLeatherInputChange } from "@/lib/analytics";

interface OptionTileContentProps {
  assetPath: string;
  title: string;
  subtitle: string;
}

const OptionTileContent = memo(function OptionTileContent({
  assetPath,
  title,
  subtitle,
}: OptionTileContentProps) {
  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
          <img src={assetPath} alt="" aria-hidden="true" className="size-9 object-contain image-outline rounded" />
        </div>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
});

const tileItemClassName = cn(
  "flex h-auto min-h-[7.5rem] flex-col items-start justify-start gap-3 rounded-3xl border px-4 py-4 text-left",
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
  "active:scale-[0.98] motion-reduce:active:scale-100",
  "border-border/30 bg-background/50 text-muted-foreground",
  "hover:border-border/60 hover:bg-background/80 hover:text-foreground",
  "data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground",
  "data-[state=on]:shadow-[inset_0_0_0_1px_rgba(239,189,141,0.16)]",
);

function getHideSubtitle(
  workflow: LeatherWorkflow,
  option: (typeof HIDE_SIZE_OPTIONS)[number],
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  if (workflow === "leather") {
    return t("leather.option.leather_yield", { count: option.leatherYield });
  }

  if (option.peltFatCost >= 1) {
    return t("leather.option.fat_each", { count: option.peltFatCost });
  }

  return t("leather.option.per_fat", { count: 1 / option.peltFatCost });
}

function getAnimalSubtitle(
  option: (typeof ANIMAL_OPTIONS)[number],
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  return option.usesSmallHideWorkflow
    ? t("leather.option.small_hide_workflow")
    : t("leather.option.standard_small_hide");
}

function getBearSubtitle(
  workflow: LeatherWorkflow,
  bearVariant: BearVariant,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const bearData = BEAR_DATA[bearVariant];

  if (workflow === "leather") {
    return t("leather.option.bear_leather_hint", {
      hides: bearData.scrapedHugeHides,
      leather: bearData.scrapedHugeHides * HIDE_DATA.huge.leatherYield,
    });
  }

  return t(
    bearData.splitPeltCount === 1
      ? "leather.option.bear_pelt_hint_one"
      : "leather.option.bear_pelt_hint_other",
    {
      fat: bearData.peltFatCost,
      count: bearData.splitPeltCount,
      size: t(`leather.hide_size.${bearData.splitPeltSize}`),
    },
  );
}

interface HidePickerProps {
  workflow: LeatherWorkflow;
  size: HideSize;
  animalVariant: AnimalVariant;
  bearVariant: BearVariant | null;
  onSizeChange: (size: HideSize) => void;
  onAnimalChange: (variant: AnimalVariant) => void;
  onBearVariantChange: (variant: BearVariant | null) => void;
}

export function HidePicker({
  workflow,
  size,
  animalVariant,
  bearVariant,
  onSizeChange,
  onAnimalChange,
  onBearVariantChange,
}: HidePickerProps) {
  const { t } = useTranslation();
  const isBearSelection = bearVariant !== null;
  const familyValue: "standard" | "bear" = isBearSelection ? "bear" : "standard";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">{t("leather.inputs.hide_family")}</p>
        <ToggleGroup
          type="single"
          value={familyValue}
          onValueChange={(value) => {
            if (!value || value === familyValue) return;
            if (value === "standard") {
              trackLeatherInputChange("family", { value: "standard", workflow });
              onBearVariantChange(null);
            } else {
              trackLeatherInputChange("family", { value: "bear", workflow });
              onBearVariantChange(bearVariant ?? "sun");
            }
          }}
          className="grid grid-cols-2 gap-2"
        >
          <ToggleGroupItem
            value="standard"
            variant="outline"
            className="h-10 justify-start px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
          >
            {t("leather.family.standard")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bear"
            variant="outline"
            className="h-10 justify-start px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
          >
            {t("leather.family.bear")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isBearSelection ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.bear_type")}</p>
            <p className="text-xs text-muted-foreground">{t("leather.notes.bear_supported")}</p>
          </div>
          <ToggleGroup
            type="single"
            value={bearVariant ?? ""}
            onValueChange={(value) => {
              if (!value || value === bearVariant) return;
              const next = value as BearVariant;
              trackLeatherInputChange("bear_variant", { value: next, workflow });
              onBearVariantChange(next);
            }}
            className="grid grid-cols-2 gap-3 xl:grid-cols-3"
          >
            {BEAR_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.variant}
                value={option.variant}
                className={tileItemClassName}
              >
                <OptionTileContent
                  assetPath={option.assetPath}
                  title={t(`leather.bear.${option.variant}`)}
                  subtitle={getBearSubtitle(workflow, option.variant, t)}
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.hide_type")}</p>
            <ToggleGroup
              type="single"
              value={size}
              onValueChange={(value) => {
                if (!value || value === size) return;
                const next = value as HideSize;
                trackLeatherInputChange("hide_size", { value: next, workflow });
                onSizeChange(next);
              }}
              className="grid grid-cols-2 gap-3 xl:grid-cols-4"
            >
              {HIDE_SIZE_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.size}
                  value={option.size}
                  className={tileItemClassName}
                >
                  <OptionTileContent
                    assetPath={option.assetPath}
                    title={t(`leather.hide_size.${option.size}`)}
                    subtitle={getHideSubtitle(workflow, option, t)}
                  />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {size === "small" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{t("leather.inputs.animal")}</p>
                <p className="text-xs text-muted-foreground">{t("leather.notes.small_variants")}</p>
              </div>
              <ToggleGroup
                type="single"
                value={animalVariant}
                onValueChange={(value) => {
                  if (!value || value === animalVariant) return;
                  const next = value as AnimalVariant;
                  trackLeatherInputChange("animal_variant", { value: next, workflow });
                  onAnimalChange(next);
                }}
                className="grid grid-cols-2 gap-3 xl:grid-cols-4"
              >
                {ANIMAL_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.variant}
                    value={option.variant}
                    className={tileItemClassName}
                  >
                    <OptionTileContent
                      assetPath={option.assetPath}
                      title={t(`leather.animal.${option.variant}`)}
                      subtitle={getAnimalSubtitle(option, t)}
                    />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
