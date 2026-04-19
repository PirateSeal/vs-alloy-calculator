import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { METALS } from "@/features/metallurgy/data/alloys";
import type { MetalId } from "@/features/metallurgy/types/alloys";
import { useTranslation } from "@/i18n";

interface PlannerInventoryProps {
  inventory: Record<MetalId, number>;
  totalNuggets: number;
  onMetalChange: (metalId: MetalId, nuggets: number) => void;
  onClear: () => void;
}

export function PlannerInventory({
  inventory,
  totalNuggets,
  onMetalChange,
  onClear,
}: PlannerInventoryProps) {
  const { t, getMetalLabel, getMetalShortLabel } = useTranslation();

  return (
    <Card className="rounded-[1.75rem] border-border/30 bg-card/90 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{t("planner.inventory.title")}</CardTitle>
          <CardDescription>{t("planner.inventory.description")}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClear}>
          {t("planner.inventory.clear")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {METALS.map((metal) => (
            <div key={metal.id} className="rounded-2xl border border-border/35 bg-background/45 p-3">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={metal.nuggetImage}
                  alt=""
                  className="h-10 w-10 rounded-xl bg-background/70 p-1 object-contain ring-1 ring-inset ring-border/25"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{getMetalLabel(metal.id)}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {getMetalShortLabel(metal.id)}
                  </p>
                </div>
              </div>
              <NumberInput
                value={inventory[metal.id]}
                onChange={(value) => onMetalChange(metal.id, value)}
                min={0}
                max={9999}
                className="w-full"
                aria-label={t("planner.inventory.metal_aria", { metal: getMetalLabel(metal.id) })}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-semibold">
            {t("planner.inventory.total_nuggets", { n: totalNuggets })}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-semibold">
            {t("planner.inventory.total_ingots", { n: Math.floor(totalNuggets / 20) })}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
