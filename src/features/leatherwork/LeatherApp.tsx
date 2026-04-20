import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSelectedHideProfile } from "@/features/leatherwork/lib/leather";
import { useLeatherCalculation } from "@/features/leatherwork/lib/useLeatherCalculation";
import { LeatherInputsCard } from "@/features/leatherwork/components/LeatherInputsCard";
import { LeatherSummaryCard } from "@/features/leatherwork/components/LeatherSummaryCard";
import { Pipeline } from "@/features/leatherwork/components/Pipeline";
import { ShoppingList } from "@/features/leatherwork/components/ShoppingList";
import { useLeatherInputs } from "@/features/leatherwork/store/useLeatherInputs";
import { useLeatherUrlSync } from "@/features/leatherwork/store/useLeatherUrlSync";
import type {
  AnimalVariant,
  BearVariant,
  HideSize,
} from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";

function getSelectionLabel(
  t: ReturnType<typeof useTranslation>["t"],
  size: HideSize,
  animalVariant: AnimalVariant,
  bearVariant: BearVariant | null,
) {
  if (bearVariant) {
    return t(`leather.bear.${bearVariant}`);
  }

  if (size === "small" && animalVariant !== "generic") {
    return t(`leather.animal.${animalVariant}`);
  }

  return t(`leather.hide_size.${size}`);
}

export function LeatherApp() {
  const { t } = useTranslation();
  const inputs = useLeatherInputs();
  useLeatherUrlSync();

  const {
    workflow,
    mode,
    size,
    animalVariant,
    bearVariant,
    hideCount,
    targetLeather,
    solvent,
    updateInputs,
  } = inputs;

  const calculation = useLeatherCalculation(inputs);
  const selectionLabel = getSelectionLabel(t, size, animalVariant, bearVariant);
  const inputProfile = getSelectedHideProfile({
    t,
    size,
    animalVariant,
    bearVariant,
    rawHideCount: hideCount,
  });

  return (
    <div className="animate-surface-in space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(20rem,0.88fr)_minmax(0,1.12fr)] xl:items-stretch">
        <section className="flex flex-col gap-4">
          <LeatherInputsCard
            workflow={workflow}
            mode={mode}
            size={size}
            animalVariant={animalVariant}
            bearVariant={bearVariant}
            hideCount={hideCount}
            targetLeather={targetLeather}
            solvent={solvent}
            onUpdate={updateInputs}
          />
        </section>

        <section className="flex flex-col gap-4">
          <LeatherSummaryCard
            calculation={calculation}
            inputProfile={inputProfile}
            selectionLabel={selectionLabel}
            workflow={workflow}
            bearVariant={bearVariant}
          />
        </section>
      </div>

      {bearVariant ? (
        <section>
          <Alert className="border-border/20 bg-card/70">
            <Info className="h-4 w-4" />
            <AlertTitle>{t("leather.notes.bear_title")}</AlertTitle>
            <AlertDescription>
              {workflow === "leather"
                ? t("leather.notes.bear_supported_leather")
                : t("leather.notes.bear_supported_pelt")}
            </AlertDescription>
          </Alert>
        </section>
      ) : null}

      <section>
        <ShoppingList calculation={calculation} />
      </section>

      <section>
        <Pipeline calculation={calculation} />
      </section>
    </div>
  );
}
