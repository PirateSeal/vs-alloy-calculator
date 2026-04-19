import { type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Search } from "lucide-react";
import { METALS } from "@/features/metallurgy/data/alloys";
import type { Metal, MetalId } from "@/features/metallurgy/types/alloys";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortField = "name" | "meltTempC";
export type SortOrder = "asc" | "desc";

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

interface AlloySortControlsProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedMetals: MetalId[];
  onToggleMetal: (metalId: MetalId) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  metalById: Map<MetalId, Metal>;
}

export function AlloySortControls({
  searchQuery,
  onSearchQueryChange,
  selectedMetals,
  onToggleMetal,
  sortField,
  sortOrder,
  onSort,
  metalById,
}: AlloySortControlsProps) {
  const { t, getMetalLabel, getMetalShortLabel } = useTranslation();
  const activeFilterCount = selectedMetals.length;

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-11 gap-2 rounded-full border-border/50 bg-background/65 px-4 text-sm font-medium shadow-none",
        sortField === field && "border-primary/35 bg-primary/10 text-primary",
      )}
      onClick={() => onSort(field)}
      aria-pressed={sortField === field}
    >
      <span>{label}</span>
      <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
    </Button>
  );

  return (
    <>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t("reference.search_placeholder")}
            placeholder={t("reference.search_placeholder")}
            value={searchQuery}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchQueryChange(event.target.value)}
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
                    onCheckedChange={() => onToggleMetal(metal.id)}
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
    </>
  );
}
