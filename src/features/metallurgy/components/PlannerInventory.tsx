import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METALS } from "@/features/metallurgy/data/alloys";
import type { MetalId } from "@/features/metallurgy/types/alloys";
import type { ScarcityMode } from "@/features/metallurgy/types/planner";
import { useTranslation } from "@/i18n";

interface PlannerInventoryProps {
  inventory: Record<MetalId, number>;
  totalNuggets: number;
  scarcityMode: ScarcityMode;
  onMetalChange: (metalId: MetalId, nuggets: number) => void;
  onScarcityModeChange: (mode: ScarcityMode) => void;
  onClear: () => void;
}

export function PlannerInventory({
  inventory,
  totalNuggets,
  scarcityMode,
  onMetalChange,
  onScarcityModeChange,
  onClear,
}: PlannerInventoryProps) {
  const { t, getMetalLabel, getMetalShortLabel } = useTranslation();

  return (
    <Card className="surface-panel rounded-[1.9rem] border-border/30 bg-card/92">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{t("planner.inventory.title")}</CardTitle>
          <CardDescription>{t("planner.inventory.description")}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="surface-chip h-9 rounded-full bg-primary/12 px-3 text-xs font-semibold text-foreground">
            {t("planner.discovery.label")}
          </Badge>
          <div className="min-w-[12rem]">
            <Select value={scarcityMode} onValueChange={(value) => onScarcityModeChange(value as ScarcityMode)}>
              <SelectTrigger className="h-9 rounded-full border-border/45 bg-background/70 text-xs">
                <SelectValue placeholder={t("planner.mode.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">{t("planner.mode.balanced")}</SelectItem>
                <SelectItem value="economical">{t("planner.mode.economical")}</SelectItem>
                <SelectItem value="preserve-copper">{t("planner.mode.preserve_copper")}</SelectItem>
                <SelectItem value="max-output">{t("planner.mode.max_output")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClear}>
            {t("planner.inventory.clear")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {METALS.map((metal) => (
            <div key={metal.id} className="surface-subtle rounded-[1.4rem] border border-border/35 bg-background/45 p-3">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={metal.nuggetImage}
                  alt=""
                  className="image-outline h-10 w-10 rounded-xl bg-background/70 p-1 object-contain ring-1 ring-inset ring-border/25"
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
          <Badge variant="secondary" className="surface-chip rounded-full px-3 py-1.5 text-xs font-semibold">
            {t("planner.inventory.total_nuggets", { n: totalNuggets })}
          </Badge>
          <Badge variant="secondary" className="surface-chip rounded-full px-3 py-1.5 text-xs font-semibold">
            {t("planner.inventory.total_ingots", { n: Math.floor(totalNuggets / 20) })}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
