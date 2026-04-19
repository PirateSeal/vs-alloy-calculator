import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScarcityMode } from "@/features/metallurgy/types/planner";
import { useTranslation } from "@/i18n";

interface PlannerRecipeSelectorProps {
  scarcityMode: ScarcityMode;
  onScarcityModeChange: (mode: ScarcityMode) => void;
}

export function PlannerRecipeSelector({
  scarcityMode,
  onScarcityModeChange,
}: PlannerRecipeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-[1.9rem] border border-border/30 bg-card/90 shadow-sm ring-1 ring-inset ring-border/20">
      <div className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,189,141,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(133,180,255,0.12),transparent_38%)]" />
        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
              {t("header.domain.metallurgy")}
            </p>
            <CardTitle id="planner-title" className="text-3xl font-semibold tracking-tight sm:text-[2.35rem]">
              {t("planner.title")}
            </CardTitle>
            <CardDescription className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("planner.description")}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="h-11 rounded-full bg-primary/12 px-4 text-sm font-semibold text-foreground">
              {t("planner.discovery.label")}
            </Badge>

            <div className="min-w-[15rem]">
              <Select value={scarcityMode} onValueChange={(value) => onScarcityModeChange(value as ScarcityMode)}>
                <SelectTrigger className="h-11 rounded-full border-border/45 bg-background/70">
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
          </div>
        </div>
      </div>
    </div>
  );
}
