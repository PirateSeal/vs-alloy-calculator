import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { METALS } from "../data/alloys";
import type { AlloyRecipe, Metal, MetalId } from "../types/alloys";
import { useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlloyReferenceTableProps {
  recipes: AlloyRecipe[];
}

type SortField = "name" | "meltTempC";
type SortOrder = "asc" | "desc";

const WIKI_PAGES: Record<string, string> = {
  "tin-bronze": "Tin_Bronze",
  "bismuth-bronze": "Bismuth_Bronze",
  "black-bronze": "Black_Bronze",
  brass: "Brass",
  molybdochalkos: "Molybdochalkos",
  "lead-solder": "Lead_Solder",
  "silver-solder": "Silver_Solder",
  cupronickel: "Cupronickel",
  electrum: "Electrum",
};

function SortIcon({
  field,
  sortField,
  sortOrder,
}: {
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
}) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4" aria-hidden="true" />;
  }

  return sortOrder === "asc" ? (
    <ArrowUp className="h-4 w-4" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-4 w-4" aria-hidden="true" />
  );
}

function getWikiUrl(recipeId: string) {
  return `https://wiki.vintagestory.at/index.php/${WIKI_PAGES[recipeId] ?? recipeId}`;
}

function getIngotImage(recipeId: string) {
  return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
}

function getCompositionWidth(componentMinPercent: number, componentMaxPercent: number) {
  return (componentMinPercent + componentMaxPercent) / 2;
}

function getTemperatureLabel(temperature: number | null) {
  return temperature ? `${temperature}°C` : "—";
}

export function AlloyReferenceTable({ recipes }: AlloyReferenceTableProps) {
  const { t, getMetalLabel, getMetalShortLabel, getRecipeName, getRecipeNotes } =
    useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedMetals, setSelectedMetals] = useState<MetalId[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const metalById = useMemo(() => {
    return new Map<MetalId, Metal>(METALS.map((metal) => [metal.id, metal]));
  }, []);

  useEffect(() => {
    if (!searchQuery) return;

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      track("reference-searched", { query: searchQuery });
    }, 1000);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("asc");
  };

  const toggleMetalFilter = (metalId: MetalId) => {
    setSelectedMetals((current) =>
      current.includes(metalId)
        ? current.filter((id) => id !== metalId)
        : [...current, metalId],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMetals([]);
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...recipes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((recipe) => {
        const name = getRecipeName(recipe.id).toLowerCase();
        const notes = getRecipeNotes(recipe.id).toLowerCase();
        return name.includes(query) || notes.includes(query);
      });
    }

    if (selectedMetals.length > 0) {
      result = result.filter((recipe) =>
        selectedMetals.every((metalId) =>
          recipe.components.some((component) => component.metalId === metalId),
        ),
      );
    }

    result.sort((a, b) => {
      if (sortField === "name") {
        const comparison = getRecipeName(a.id).localeCompare(getRecipeName(b.id));
        return sortOrder === "asc" ? comparison : -comparison;
      }

      const tempA = a.meltTempC ?? 0;
      const tempB = b.meltTempC ?? 0;
      const comparison = tempA - tempB;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [getRecipeName, getRecipeNotes, recipes, searchQuery, selectedMetals, sortField, sortOrder]);

  const activeFilterCount = selectedMetals.length;
  const hasQuery = searchQuery.trim().length > 0;
  const hasFilters = hasQuery || activeFilterCount > 0;
  const visibleCount = filteredAndSortedRecipes.length;

  const renderComposition = (recipe: AlloyRecipe, compact: boolean) => (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/45">
        {recipe.components.map((component) => {
          const metal = metalById.get(component.metalId);
          const width = getCompositionWidth(component.minPercent, component.maxPercent);

          return (
            <div
              key={component.metalId}
              className="h-full"
              style={{
                width: `${width}%`,
                backgroundColor: metal?.color,
              }}
              title={t("reference.component_range_title", {
                metal: metal ? getMetalLabel(metal.id) : component.metalId,
                min: component.minPercent,
                max: component.maxPercent,
              })}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {recipe.components.map((component) => {
          const metal = metalById.get(component.metalId);

          return (
            <Tooltip key={component.metalId}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-7 cursor-help rounded-full border border-border/50 px-2.5 text-[11px] font-semibold",
                    compact && "h-6 px-2 text-[10px]",
                  )}
                  style={
                    metal
                      ? {
                          backgroundColor: `${metal.color}18`,
                          color: metal.color,
                        }
                      : undefined
                  }
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={metal ? { backgroundColor: metal.color } : undefined}
                    aria-hidden="true"
                  />
                  {metal ? getMetalShortLabel(metal.id) : component.metalId} {component.minPercent}-
                  {component.maxPercent}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {metal ? getMetalLabel(metal.id) : component.metalId}: {component.minPercent}-
                  {component.maxPercent}%
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-11 gap-2 rounded-full border-border/50 bg-background/65 px-4 text-sm font-medium shadow-none",
        sortField === field && "border-primary/35 bg-primary/10 text-primary",
      )}
      onClick={() => handleSort(field)}
      aria-pressed={sortField === field}
    >
      <span>{label}</span>
      <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
    </Button>
  );

  return (
    <TooltipProvider>
      <Card className="animate-surface-in flex h-full flex-col overflow-hidden rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-4 bg-background/25 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("reference.title")}
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
                {t("header.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="h-9 rounded-full border border-border/45 bg-background/55 px-3 text-xs font-semibold text-foreground"
                aria-label={`${visibleCount} of ${recipes.length}`}
              >
                {visibleCount}/{recipes.length}
              </Badge>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 rounded-full px-3 text-muted-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  {t("common.close")}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("reference.search_placeholder")}
                placeholder={t("reference.search_placeholder")}
                value={searchQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                className="h-12 rounded-2xl border-border/45 bg-background/70 pl-9 pr-3 text-sm shadow-none placeholder:text-muted-foreground/80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 gap-2 rounded-full border-border/50 bg-background/65 px-4 text-left shadow-none"
                    aria-label={t("reference.filter_aria")}
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    <span>{t("reference.filter_by_metal")}</span>
                    {activeFilterCount > 0 ? (
                      <Badge variant="secondary" className="ml-1 h-5 rounded-full px-2 text-[11px]">
                        {activeFilterCount}
                      </Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 rounded-2xl border border-border/40 bg-popover/95 p-2 shadow-md backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t("reference.filter_by_metal")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {METALS.map((metal) => {
                    const checked = selectedMetals.includes(metal.id);

                    return (
                      <DropdownMenuCheckboxItem
                        key={metal.id}
                        checked={checked}
                        onCheckedChange={() => toggleMetalFilter(metal.id)}
                        className="py-2.5 text-sm"
                      >
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: metal.color }}
                          aria-hidden="true"
                        />
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate">{getMetalLabel(metal.id)}</span>
                          <span className="text-xs text-muted-foreground">{getMetalShortLabel(metal.id)}</span>
                        </span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {renderSortButton("name", t("reference.col.alloy_name"))}
              {renderSortButton("meltTempC", t("reference.col.smelting_temp"))}
            </div>
          </div>

          {selectedMetals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedMetals.map((metalId) => {
                const metal = metalById.get(metalId);

                return (
                  <Badge
                    key={metalId}
                    variant="outline"
                    className="h-9 rounded-full border-border/50 bg-background/60 px-3 text-xs"
                    style={metal ? { color: metal.color } : undefined}
                  >
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={metal ? { backgroundColor: metal.color } : undefined}
                      aria-hidden="true"
                    />
                    <span className="truncate">{metal ? getMetalLabel(metal.id) : metalId}</span>
                  </Badge>
                );
              })}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <div className="border-y border-border/35 bg-background/25 px-4 py-3 sm:px-5">
            <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)_minmax(7.5rem,auto)_4rem] items-center gap-4 md:grid">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("reference.col.alloy_name")}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("reference.col.components")}
              </div>
              <div className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("reference.col.smelting_temp")}
              </div>
              <div className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("reference.col.wiki")}
              </div>
            </div>
          </div>

          {filteredAndSortedRecipes.length === 0 ? (
            <div className="px-4 py-10 sm:px-5 sm:py-12">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-background/40 px-5 py-8 text-center ring-1 ring-inset ring-border/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{t("reference.no_results")}</p>
              </div>
            </div>
          ) : (
            <div className="stagger-surface-children space-y-3 p-3 sm:p-4">
              {filteredAndSortedRecipes.map((recipe) => {
                const notes = getRecipeNotes(recipe.id);
                const temperature = getTemperatureLabel(recipe.meltTempC ?? null);

                return (
                  <article
                    key={recipe.id}
                    className="animate-surface-in-soft group overflow-hidden rounded-3xl bg-background/60 ring-1 ring-inset ring-border/25 transition-colors hover:bg-background/75 hover:ring-border/35"
                  >
                    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)_minmax(7.5rem,auto)_4rem] md:items-start md:gap-4 md:p-5">
                      <div className="flex min-w-0 gap-3 md:items-start">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/70 p-1 ring-1 ring-inset ring-border/30"
                          aria-hidden="true"
                        >
                          <img src={getIngotImage(recipe.id)} alt="" className="h-full w-full object-contain" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
                              {getRecipeName(recipe.id)}
                            </h3>
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                              {recipe.id}
                            </span>
                          </div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {t("reference.col.components")}
                          </p>
                          {notes ? (
                            <p className="max-w-prose text-sm leading-6 text-muted-foreground">{notes}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="min-w-0 space-y-3">
                        <div className="md:hidden">{renderComposition(recipe, true)}</div>
                        <div className="hidden md:block">{renderComposition(recipe, false)}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:justify-start">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-9 rounded-full border-border/50 px-3 text-xs font-semibold",
                            recipe.meltTempC && recipe.meltTempC > 1300 && "text-orange-400",
                          )}
                        >
                          {t("reference.col.smelting_temp")}:{" "}
                          <span className="ml-1 font-mono tabular-nums">{temperature}</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="h-9 rounded-full border border-border/45 bg-background/55 px-3 text-xs font-semibold"
                        >
                          {recipe.components.length} {t("reference.col.components")}
                        </Badge>
                      </div>

                      <div className="flex items-start md:justify-center md:pt-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              asChild
                              className="h-11 w-11 rounded-full"
                            >
                              <a
                                href={getWikiUrl(recipe.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("reference.wiki_aria", {
                                  alloy: getRecipeName(recipe.id),
                                })}
                                onClick={() => track("reference-wiki-opened", { alloy: recipe.id })}
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("reference.view_on_wiki")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
