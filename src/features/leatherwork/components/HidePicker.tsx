import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherWorkflow,
} from "@/features/leatherwork/types/leather";
import { getHideAssetPath } from "@/features/leatherwork/lib/leather";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

const HIDE_SIZE_OPTIONS: Array<{
  size: HideSize;
  assetPath: string;
  leatherYield: string;
  peltHint: string;
}> = [
  { size: "small", assetPath: getHideAssetPath("raw", "small"), leatherYield: "1 leather", peltHint: "4 per fat" },
  { size: "medium", assetPath: getHideAssetPath("raw", "medium"), leatherYield: "2 leather", peltHint: "2 per fat" },
  { size: "large", assetPath: getHideAssetPath("raw", "large"), leatherYield: "3 leather", peltHint: "1 per fat" },
  { size: "huge", assetPath: getHideAssetPath("raw", "huge"), leatherYield: "5 leather", peltHint: "2 fat each" },
];

const ANIMAL_OPTIONS: Array<{ variant: AnimalVariant; assetPath: string; note: string }> = [
  { variant: "generic", assetPath: getHideAssetPath("raw", "small"), note: "Standard small hide" },
  { variant: "fox", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
  { variant: "arctic-fox", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
  { variant: "raccoon", assetPath: getHideAssetPath("raw", "small"), note: "Scrapes to 1 small hide" },
];

const BEAR_OPTIONS: Array<{
  variant: BearVariant;
  assetPath: string;
  leatherHint: string;
  peltHint: string;
}> = [
  { variant: "sun", assetPath: getHideAssetPath("raw", "large"), leatherHint: "2 huge hides -> 10 leather", peltHint: "1 fat -> 1 medium pelt + head" },
  { variant: "panda", assetPath: getHideAssetPath("raw", "large"), leatherHint: "2 huge hides -> 10 leather", peltHint: "1 fat -> 1 large pelt + head" },
  { variant: "black", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "2 huge hides -> 10 leather", peltHint: "2 fat -> 2 large pelts + head" },
  { variant: "brown", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "3 huge hides -> 15 leather", peltHint: "2 fat -> 2 huge pelts + head" },
  { variant: "polar", assetPath: getHideAssetPath("raw", "huge"), leatherHint: "3 huge hides -> 15 leather", peltHint: "2 fat -> 3 huge pelts + head" },
];

function OptionTile({
  active,
  assetPath,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  assetPath: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[7.5rem] flex-col gap-3 rounded-3xl border px-4 py-4 text-left transition-all",
        active
          ? "border-primary/40 bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_rgba(239,189,141,0.16)]"
          : "border-border/30 bg-background/50 text-muted-foreground hover:border-border/60 hover:bg-background/80 hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
          <img src={assetPath} alt="" aria-hidden="true" className="size-9 object-contain" />
        </div>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </button>
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">{t("leather.inputs.hide_family")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant={isBearSelection ? "outline" : "default"}
            className="justify-start"
            onClick={() => onBearVariantChange(null)}
          >
            {t("leather.family.standard")}
          </Button>
          <Button
            type="button"
            variant={isBearSelection ? "default" : "outline"}
            className="justify-start"
            onClick={() => onBearVariantChange(bearVariant ?? "sun")}
          >
            {t("leather.family.bear")}
          </Button>
        </div>
      </div>

      {isBearSelection ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.bear_type")}</p>
            <p className="text-xs text-muted-foreground">{t("leather.notes.bear_supported")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BEAR_OPTIONS.map((option) => (
              <OptionTile
                key={option.variant}
                active={bearVariant === option.variant}
                assetPath={option.assetPath}
                title={t(`leather.bear.${option.variant}`)}
                subtitle={workflow === "leather" ? option.leatherHint : option.peltHint}
                onClick={() => onBearVariantChange(option.variant)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.hide_type")}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {HIDE_SIZE_OPTIONS.map((option) => (
                <OptionTile
                  key={option.size}
                  active={size === option.size}
                  assetPath={option.assetPath}
                  title={t(`leather.hide_size.${option.size}`)}
                  subtitle={workflow === "leather" ? option.leatherYield : option.peltHint}
                  onClick={() => onSizeChange(option.size)}
                />
              ))}
            </div>
          </div>

          {size === "small" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{t("leather.inputs.animal")}</p>
                <p className="text-xs text-muted-foreground">{t("leather.notes.small_variants")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ANIMAL_OPTIONS.map((option) => (
                  <OptionTile
                    key={option.variant}
                    active={animalVariant === option.variant}
                    assetPath={option.assetPath}
                    title={t(`leather.animal.${option.variant}`)}
                    subtitle={option.note}
                    onClick={() => onAnimalChange(option.variant)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
