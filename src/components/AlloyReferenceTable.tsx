import { useState, useMemo } from "react";
import type { AlloyRecipe } from "../types/alloys";
import { METALS } from "../data/alloys";
import { ExternalLink, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) {
  if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  );
}

export function AlloyReferenceTable({ recipes }: AlloyReferenceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);

  // Get metal data from metalId
  const getMetal = (metalId: string) => {
    return METALS.find((m) => m.id === metalId);
  };

  // Get wiki URL for alloy
  const getWikiUrl = (alloyName: string) => {
    const formattedName = alloyName.replace(/ /g, "_");
    return `https://wiki.vintagestory.at/index.php/${formattedName}`;
  };

  // Get ingot image path for alloy
  const getIngotImage = (recipeId: string) => {
    return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleMetalFilter = (metalId: string) => {
    setSelectedMetals((prev) =>
      prev.includes(metalId)
        ? prev.filter((id) => id !== metalId)
        : [...prev, metalId]
    );
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...recipes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((recipe) =>
        recipe.name.toLowerCase().includes(query)
      );
    }

    // Filter by selected metals
    if (selectedMetals.length > 0) {
      result = result.filter((recipe) =>
        selectedMetals.every((metalId) =>
          recipe.components.some((c) => c.metalId === metalId)
        )
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "meltTempC") {
        const tempA = a.meltTempC || 0;
        const tempB = b.meltTempC || 0;
        comparison = tempA - tempB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [recipes, searchQuery, sortField, sortOrder, selectedMetals]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Alloy Reference</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alloys..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel>Filter by Metal</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {METALS.map((metal) => (
                  <DropdownMenuCheckboxItem
                    key={metal.id}
                    checked={selectedMetals.includes(metal.id)}
                    onCheckedChange={() => toggleMetalFilter(metal.id)}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2 inline-block"
                      style={{ backgroundColor: metal.color }}
                    />
                    {metal.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table aria-label="Alloy recipes reference table" className="text-base">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="-ml-4 h-8 data-[state=open]:bg-accent"
                >
                  Alloy Name
                  <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                </Button>
              </TableHead>
              <TableHead scope="col" className="min-w-[300px]">
                Components
              </TableHead>
              <TableHead scope="col" className="text-right w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("meltTempC")}
                  className="-mr-4 h-8 data-[state=open]:bg-accent"
                >
                  Smelting Temp
                  <SortIcon field="meltTempC" sortField={sortField} sortOrder={sortOrder} />
                </Button>
              </TableHead>
              <TableHead scope="col" className="text-center w-[80px]">
                Wiki
              </TableHead>
              <TableHead scope="col">
                Uses
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRecipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium text-base py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-white dark:bg-white flex items-center justify-center flex-shrink-0 p-1 border shadow-sm"
                        aria-hidden="true"
                      >
                        <img
                          src={getIngotImage(recipe.id)}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span>{recipe.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-base py-4">
                    <TooltipProvider>
                      <div className="flex flex-col gap-2">
                        {/* Visual Bar Representation */}
                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-secondary/20">
                          {recipe.components.map((component) => {
                            const metal = getMetal(component.metalId);
                            // Use average of min/max for visual width
                            const width = (component.minPercent + component.maxPercent) / 2;
                            return (
                              <div
                                key={component.metalId}
                                className="h-full"
                                style={{
                                  width: `${width}%`,
                                  backgroundColor: metal?.color,
                                }}
                                title={`${metal?.label}: ${component.minPercent}-${component.maxPercent}%`}
                              />
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {recipe.components.map((component) => {
                            const metal = getMetal(component.metalId);
                            return (
                              <Tooltip key={component.metalId}>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="font-mono cursor-help text-xs px-2 py-0.5 border"
                                    style={{
                                      backgroundColor: metal?.color + "15",
                                      borderColor: metal?.color + "40",
                                      color: "hsl(var(--foreground))",
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block"
                                      style={{ backgroundColor: metal?.color }}
                                    />
                                    {metal?.shortLabel || component.metalId}{" "}
                                    {component.minPercent}-{component.maxPercent}%
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{metal?.label || component.metalId}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-base py-4 text-right font-mono tabular-nums">
                    {recipe.meltTempC ? (
                      <span className={recipe.meltTempC > 1300 ? "text-orange-500" : ""}>
                        {recipe.meltTempC}°C
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <a
                            href={getWikiUrl(recipe.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${recipe.name} on wiki`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on wiki</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-base py-4 text-muted-foreground text-sm">
                    {recipe.notes || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
