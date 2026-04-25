import { POTTERY_CATEGORIES, POTTERY_RECIPES } from "@/features/pottery/data/recipes";
import type { PotteryRecipe } from "@/features/pottery/types/pottery";
import { PotteryItemTile } from "@/features/pottery/components/PotteryUi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export function PotteryItemPicker({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string | null;
  onChange: (recipeId: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const placeholderText = placeholder ?? t("pottery.picker.placeholder");

  return (
    <Select value={value ?? ""} onValueChange={(next) => onChange(next || null)}>
      <SelectTrigger
        className={cn(
          "h-14 rounded-[1rem] border-border/45 bg-background/70 text-sm shadow-none",
          className,
        )}
      >
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent className="rounded-[1rem] border-border/30 bg-popover/98">
        {POTTERY_CATEGORIES.map((category) => (
          <SelectGroup key={category.id}>
            <SelectLabel className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t(`pottery.category.${category.id}`)}
            </SelectLabel>
            {POTTERY_RECIPES.filter((recipe) => recipe.category === category.id).map((recipe: PotteryRecipe) => (
              <SelectItem key={recipe.id} value={recipe.id} className="gap-2 rounded-xl">
                <span className="flex min-w-0 items-center gap-2">
                  <PotteryItemTile recipe={recipe} className="size-8 rounded-xl p-1" imageClassName="rounded-lg" />
                  <span className="truncate">{t(`pottery.recipe.${recipe.id}`)}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
