import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { POTTERY_CATEGORIES, POTTERY_CATEGORY_ORDER, POTTERY_RECIPES } from "@/features/pottery/data/recipes";
import type { ClayType, PotteryCategory, PotteryRecipe } from "@/features/pottery/types/pottery";
import { CategoryPill, ClayTypeBadge, FiringBadge, PotteryItemTile } from "@/features/pottery/components/PotteryUi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

type ClayFilter = "all" | ClayType;
type SortField = "name" | "category" | "clay" | "output" | "perItem" | "type" | "firing";
type SortDir = "asc" | "desc";

function sortRecipes(
  recipes: PotteryRecipe[],
  field: SortField,
  dir: SortDir,
  getRecipeName: (recipe: PotteryRecipe) => string,
) {
  return [...recipes].sort((a, b) => {
    let av: string | number | boolean;
    let bv: string | number | boolean;
    if (field === "name") {
      av = getRecipeName(a);
      bv = getRecipeName(b);
    } else if (field === "category") {
      av = POTTERY_CATEGORY_ORDER.indexOf(a.category);
      bv = POTTERY_CATEGORY_ORDER.indexOf(b.category);
    } else if (field === "clay") {
      av = a.clayCost;
      bv = b.clayCost;
    } else if (field === "output") {
      av = a.outputCount;
      bv = b.outputCount;
    } else if (field === "perItem") {
      av = a.clayPerItem;
      bv = b.clayPerItem;
    } else if (field === "type") {
      av = a.clayType;
      bv = b.clayType;
    } else {
      av = a.requiresFiring;
      bv = b.requiresFiring;
    }

    const result = typeof av === "string" ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
    return dir === "asc" ? result : -result;
  });
}

export function PotteryReference() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PotteryCategory | "all">("all");
  const [clayType, setClayType] = useState<ClayFilter>("all");
  const [grouped, setGrouped] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return POTTERY_RECIPES.filter((recipe) => {
      if (query && !t(`pottery.recipe.${recipe.id}`).toLowerCase().includes(query)) return false;
      if (category !== "all" && recipe.category !== category) return false;
      if (clayType !== "all" && recipe.clayType !== clayType) return false;
      return true;
    });
  }, [category, clayType, search, t]);

  const sorted = useMemo(
    () => sortRecipes(filtered, sortField, sortDir, (recipe) => t(`pottery.recipe.${recipe.id}`)),
    [filtered, sortDir, sortField, t],
  );
  const groupedRecipes = useMemo(
    () => POTTERY_CATEGORY_ORDER.map((categoryId) => ({
      category: categoryId,
      recipes: sorted.filter((recipe) => recipe.category === categoryId),
    })).filter((group) => group.recipes.length > 0),
    [sorted],
  );

  const onSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <Card className="rounded-[1.9rem] border-border/35 bg-card/92 surface-panel">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">{t("pottery.reference.title")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pottery.reference.description")}
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={grouped ? "grouped" : "flat"}
            onValueChange={(value) => {
              if (value) setGrouped(value === "grouped");
            }}
            className="rounded-full bg-background/55 p-1"
            aria-label={t("pottery.reference.layout_aria")}
          >
            <ToggleGroupItem value="grouped" className="rounded-full px-3 text-xs">{t("pottery.reference.grouped")}</ToggleGroupItem>
            <ToggleGroupItem value="flat" className="rounded-full px-3 text-xs">{t("pottery.reference.flat")}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative max-w-sm">
            <Label htmlFor="pottery-reference-search" className="sr-only">{t("pottery.reference.search_label")}</Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="pottery-reference-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("pottery.reference.search_placeholder")}
              className="h-11 rounded-[1rem] bg-background/70 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === "all"} onClick={() => setCategory("all")}>{t("pottery.reference.all_categories")}</FilterButton>
            {POTTERY_CATEGORIES.map((item) => (
              <FilterButton
                key={item.id}
                active={category === item.id}
                color={item.color}
                onClick={() => setCategory((current) => current === item.id ? "all" : item.id)}
              >
                {t(`pottery.category.${item.id}`)}
              </FilterButton>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={clayType === "all"} onClick={() => setClayType("all")}>{t("pottery.reference.any_type")}</FilterButton>
            <FilterButton active={clayType === "any"} onClick={() => setClayType("any")} color="#efbd8d">{t("pottery.clay_type.any")}</FilterButton>
            <FilterButton active={clayType === "fire"} onClick={() => setClayType("fire")} color="#a05b4f">{t("pottery.clay_type.fire")}</FilterButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("pottery.reference.count", { count: filtered.length, total: POTTERY_RECIPES.length })}</span>
        </div>
        {filtered.length === 0 ? (
          <Empty className="min-h-56 border border-border/25 bg-background/25">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>{t("pottery.reference.no_results_title")}</EmptyTitle>
              <EmptyDescription>{t("pottery.reference.no_results_description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : grouped ? (
          <div className="flex flex-col gap-6">
            {groupedRecipes.map((group) => {
              const meta = POTTERY_CATEGORIES.find((item) => item.id === group.category);
              return (
                <section key={group.category} className="animate-surface-in-soft">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full" style={{ backgroundColor: meta?.color }} />
                    <h3 className="text-sm font-semibold">{t(`pottery.category.${group.category}`)}</h3>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{group.recipes.length}</span>
                  </div>
                  <PotteryRecipeTable recipes={group.recipes} sortField={sortField} sortDir={sortDir} onSort={onSort} />
                </section>
              );
            })}
          </div>
        ) : (
          <PotteryRecipeTable recipes={sorted} sortField={sortField} sortDir={sortDir} onSort={onSort} />
        )}
      </CardContent>
    </Card>
  );
}

function FilterButton({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9 rounded-full border-border/35 px-3 text-xs", active && "bg-primary/10 text-primary")}
      style={active && color ? { borderColor: `${color}66`, backgroundColor: `${color}18`, color } : undefined}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function PotteryRecipeTable({
  recipes,
  sortField,
  sortDir,
  onSort,
}: {
  recipes: PotteryRecipe[];
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-border/30 bg-background/25">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SortHead field="name" active={sortField === "name"} dir={sortDir} onSort={onSort}>{t("pottery.table.item")}</SortHead>
            <SortHead field="category" active={sortField === "category"} dir={sortDir} onSort={onSort}>{t("pottery.table.category")}</SortHead>
            <SortHead field="clay" active={sortField === "clay"} dir={sortDir} onSort={onSort}>{t("pottery.table.clay")}</SortHead>
            <SortHead field="output" active={sortField === "output"} dir={sortDir} onSort={onSort}>{t("pottery.table.output")}</SortHead>
            <SortHead field="perItem" active={sortField === "perItem"} dir={sortDir} onSort={onSort}>{t("pottery.table.clay_per_item")}</SortHead>
            <SortHead field="type" active={sortField === "type"} dir={sortDir} onSort={onSort}>{t("pottery.table.clay_type")}</SortHead>
            <SortHead field="firing" active={sortField === "firing"} dir={sortDir} onSort={onSort}>{t("pottery.table.firing")}</SortHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("pottery.table.batch_recipe")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => {
            const recipeName = t(`pottery.recipe.${recipe.id}`);
            return (
            <TableRow key={recipe.id} className="hover:bg-accent/30">
              <TableCell>
                <div className="flex min-w-52 items-center gap-3">
                  <PotteryItemTile recipe={recipe} className="size-10 rounded-[0.9rem]" />
                  <span className="font-semibold">{recipeName}</span>
                </div>
              </TableCell>
              <TableCell><CategoryPill category={recipe.category} /></TableCell>
              <TableCell className="font-mono font-semibold tabular-nums">{recipe.clayCost}</TableCell>
              <TableCell className="font-mono tabular-nums">{recipe.outputCount}</TableCell>
              <TableCell className={cn(
                "font-mono font-semibold tabular-nums",
                recipe.clayPerItem <= 5 ? "text-success" : recipe.clayPerItem > 20 ? "text-destructive" : "text-foreground",
              )}>
                {Number.isInteger(recipe.clayPerItem) ? recipe.clayPerItem : recipe.clayPerItem.toFixed(2)}
              </TableCell>
              <TableCell><ClayTypeBadge type={recipe.clayType} /></TableCell>
              <TableCell><FiringBadge required={recipe.requiresFiring} /></TableCell>
              <TableCell className="min-w-40 text-sm text-muted-foreground">
                {recipe.batchRecipe
                  ? t("pottery.table.batch_recipe_value", {
                    clayCost: recipe.batchRecipe.clayCost,
                    outputCount: recipe.batchRecipe.outputCount,
                  })
                  : "-"}
              </TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function SortHead({
  field,
  active,
  dir,
  onSort,
  children,
}: {
  field: SortField;
  active: boolean;
  dir: SortDir;
  onSort: (field: SortField) => void;
  children: ReactNode;
}) {
  return (
    <TableHead className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-1 rounded-md transition-colors hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {children}
        {active ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />
        ) : null}
      </button>
    </TableHead>
  );
}
