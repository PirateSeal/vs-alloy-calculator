import { Amphora, Flame, Hammer, Package, Sprout, Warehouse } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { POTTERY_CATEGORY_BY_ID } from "@/features/pottery/data/recipes";
import type { ClayType, PotteryCategory, PotteryRecipe } from "@/features/pottery/types/pottery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<PotteryCategory, LucideIcon> = {
  cooking: Amphora,
  storage: Warehouse,
  agriculture: Sprout,
  building: Package,
  utility: Hammer,
  molds: Hammer,
};

function categoryMeta(category: PotteryCategory) {
  return POTTERY_CATEGORY_BY_ID[category];
}

export function CategoryPill({
  category,
  className,
}: {
  category: PotteryCategory;
  className?: string;
}) {
  const meta = categoryMeta(category);
  const { t } = useTranslation();
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", className)}
      style={{
        color: meta.color,
        borderColor: `${meta.color}55`,
        backgroundColor: `${meta.color}18`,
      }}
    >
      {t(`pottery.category.${category}`)}
    </Badge>
  );
}

export function ClayTypeBadge({ type, className }: { type: ClayType; className?: string }) {
  const fire = type === "fire";
  const { t } = useTranslation();
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        fire ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary",
        className,
      )}
    >
      {fire ? t("pottery.clay_type.fire") : t("pottery.clay_type.any")}
    </Badge>
  );
}

export function FiringBadge({ required, className }: { required: boolean; className?: string }) {
  const { t } = useTranslation();
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        required ? "border-primary/30 bg-primary/10 text-primary" : "border-success/30 bg-success/10 text-success",
        className,
      )}
    >
      {required ? t("pottery.firing.required") : t("pottery.firing.none")}
    </Badge>
  );
}

export function PotteryItemTile({
  recipe,
  className,
  imageClassName,
}: {
  recipe: PotteryRecipe;
  className?: string;
  imageClassName?: string;
}) {
  const meta = categoryMeta(recipe.category);
  const Icon = CATEGORY_ICONS[recipe.category];

  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border bg-background/65 p-1.5 surface-chip",
        className,
      )}
      style={{ borderColor: `${meta.color}40`, backgroundColor: `${meta.color}12` }}
      aria-hidden="true"
    >
      <img
        src={recipe.imageSrc}
        alt=""
        className={cn("image-outline max-h-full max-w-full rounded-[0.7rem] object-contain", imageClassName)}
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.nextElementSibling?.removeAttribute("hidden");
        }}
      />
      <span hidden>
        <Icon className="h-5 w-5" style={{ color: meta.color }} />
      </span>
    </span>
  );
}

export function NudgeRow({
  value,
  onChange,
  deltas = [-10, -1, 1, 10],
  min = 0,
  max = 9999,
}: {
  value: number;
  onChange: (value: number) => void;
  deltas?: number[];
  min?: number;
  max?: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {deltas.map((delta) => (
        <Button
          key={delta}
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-[1rem] font-mono text-xs transition-[background-color,color,transform] hover:bg-primary/15 hover:text-primary active:scale-[0.96]"
          onClick={() => onChange(Math.max(min, Math.min(max, value + delta)))}
        >
          {delta > 0 ? `+${delta}` : delta}
        </Button>
      ))}
    </div>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/85">
      {children}
    </p>
  );
}

export function FireIcon() {
  return <Flame data-icon="inline-start" />;
}
