import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { METALS } from "@/features/metallurgy/data/alloys";
import type { AlloyRecipe, Metal, MetalId } from "@/features/metallurgy/types/alloys";
import { useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AlloySortControls,
  type SortField,
  type SortOrder,
} from "@/features/metallurgy/components/AlloySortControls";
import { AlloyTableRow } from "@/features/metallurgy/components/AlloyTableRow";

interface AlloyReferenceTableProps {
  recipes: AlloyRecipe[];
}

export function AlloyReferenceTable({ recipes }: AlloyReferenceTableProps) {
  const { t, getRecipeName, getRecipeNotes } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedMetals, setSelectedMetals] = useState<MetalId[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const metalById = useMemo(
    () => new Map<MetalId, Metal>(METALS.map((metal) => [metal.id, metal])),
    [],
  );

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

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
        return currentField;
      }
      setSortOrder("asc");
      return field;
    });
  }, []);

  const toggleMetalFilter = useCallback((metalId: MetalId) => {
    setSelectedMetals((current) =>
      current.includes(metalId) ? current.filter((id) => id !== metalId) : [...current, metalId],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedMetals([]);
  }, []);

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

  const hasQuery = searchQuery.trim().length > 0;
  const hasFilters = hasQuery || selectedMetals.length > 0;
  const visibleCount = filteredAndSortedRecipes.length;

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

          <AlloySortControls
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedMetals={selectedMetals}
            onToggleMetal={toggleMetalFilter}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            metalById={metalById}
          />
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
              {filteredAndSortedRecipes.map((recipe) => (
                <AlloyTableRow key={recipe.id} recipe={recipe} metalById={metalById} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
