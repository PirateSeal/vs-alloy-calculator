import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HidePicker } from "@/features/leatherwork/components/HidePicker";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
  LeatherMode,
  LeatherState,
  LeatherWorkflow,
  Solvent,
} from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";
import { trackLeatherInputChange } from "@/lib/analytics";

interface LeatherInputsCardProps {
  workflow: LeatherWorkflow;
  mode: LeatherMode;
  size: HideSize;
  animalVariant: AnimalVariant;
  bearVariant: BearVariant | null;
  hideCount: number;
  targetLeather: number;
  solvent: Solvent;
  onUpdate: (update: Partial<LeatherState>) => void;
}

export function LeatherInputsCard({
  workflow,
  mode,
  size,
  animalVariant,
  bearVariant,
  hideCount,
  targetLeather,
  solvent,
  onUpdate,
}: LeatherInputsCardProps) {
  const { t } = useTranslation();
  const isLeatherMode = workflow === "leather" && mode === "leather";
  const quantityLabel = isLeatherMode
    ? t("leather.inputs.target_leather")
    : t("leather.inputs.hide_count");

  return (
    <Card className="h-full border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{t("leather.inputs.workflow")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant={workflow === "leather" ? "default" : "outline"}
              onClick={() => {
                if (workflow !== "leather") {
                  trackLeatherInputChange("workflow", { value: "leather" });
                }
                onUpdate({ workflow: "leather" });
              }}
            >
              {t("leather.workflow.leather")}
            </Button>
            <Button
              type="button"
              variant={workflow === "pelt" ? "default" : "outline"}
              onClick={() => {
                if (workflow !== "pelt") {
                  trackLeatherInputChange("workflow", { value: "pelt" });
                }
                onUpdate({ workflow: "pelt" });
              }}
            >
              {t("leather.workflow.pelt")}
            </Button>
          </div>
        </div>

        {workflow === "leather" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.mode")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={mode === "hides" ? "default" : "outline"}
                onClick={() => {
                  if (mode !== "hides") {
                    trackLeatherInputChange("mode", { value: "hides", workflow });
                  }
                  onUpdate({ mode: "hides" });
                }}
              >
                {t("leather.mode.hides")}
              </Button>
              <Button
                type="button"
                variant={mode === "leather" ? "default" : "outline"}
                onClick={() => {
                  if (mode !== "leather") {
                    trackLeatherInputChange("mode", { value: "leather", workflow });
                  }
                  onUpdate({ mode: "leather" });
                }}
              >
                {t("leather.mode.leather")}
              </Button>
            </div>
          </div>
        ) : (
          <Alert className="border-border/20 bg-background/55">
            <Info className="h-4 w-4" />
            <AlertTitle>{t("leather.notes.pelt_mode_title")}</AlertTitle>
            <AlertDescription>{t("leather.notes.pelt_mode")}</AlertDescription>
          </Alert>
        )}

        <HidePicker
          workflow={workflow}
          size={size}
          animalVariant={animalVariant}
          bearVariant={bearVariant}
          onSizeChange={(nextSize) => onUpdate({ size: nextSize, bearVariant: null })}
          onAnimalChange={(nextAnimal) => onUpdate({ animalVariant: nextAnimal, bearVariant: null })}
          onBearVariantChange={(nextBear) => onUpdate({ bearVariant: nextBear })}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{quantityLabel}</p>
          <NumberInput
            value={isLeatherMode ? targetLeather : hideCount}
            onChange={(value) => {
              const previousValue = isLeatherMode ? targetLeather : hideCount;
              if (value !== previousValue) {
                trackLeatherInputChange(isLeatherMode ? "target_leather" : "hide_count", {
                  value,
                  workflow,
                  mode,
                });
              }
              if (isLeatherMode) {
                onUpdate({ targetLeather: value });
                return;
              }
              onUpdate({ hideCount: value });
            }}
            min={1}
            max={999}
            className="w-full"
            aria-label={quantityLabel}
          />
        </div>

        {workflow === "leather" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{t("leather.inputs.solvent")}</p>
            <Select
              value={solvent}
              onValueChange={(value) => {
                if (value !== solvent) {
                  trackLeatherInputChange("solvent", { value, workflow, mode });
                }
                onUpdate({ solvent: value as Solvent });
              }}
            >
              <SelectTrigger aria-label={t("leather.inputs.solvent")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lime">{t("leather.solvent.lime")}</SelectItem>
                <SelectItem value="borax">{t("leather.solvent.borax")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("leather.notes.solvent")}</p>
          </div>
        ) : null}

        <Alert className="border-border/20 bg-background/55">
          <Info className="h-4 w-4" />
          <AlertTitle>{t("leather.notes.mixing_title")}</AlertTitle>
          <AlertDescription>
            {workflow === "leather" ? t("leather.notes.mixing") : t("leather.notes.pelt_storage")}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
