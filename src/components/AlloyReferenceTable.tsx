import type { AlloyRecipe } from "../types/alloys";
import { METALS } from "../data/alloys";
import { ExternalLink } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlloyReferenceTableProps {
  recipes: AlloyRecipe[];
}

export function AlloyReferenceTable({ recipes }: AlloyReferenceTableProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alloy Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <Table aria-label="Alloy recipes reference table" className="text-base">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="text-base">
                Alloy Name
              </TableHead>
              <TableHead scope="col" className="text-base">
                Components
              </TableHead>
              <TableHead scope="col" className="text-base text-right">
                Smelting Temp
              </TableHead>
              <TableHead scope="col" className="text-base text-center">
                Wiki
              </TableHead>
              <TableHead scope="col" className="text-base">
                Uses
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium text-base py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-white dark:bg-white flex items-center justify-center flex-shrink-0 p-1"
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
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.components.map((component) => {
                        const metal = getMetal(component.metalId);
                        return (
                          <Tooltip key={component.metalId}>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="font-mono cursor-help text-sm px-2.5 py-1"
                                style={{
                                  backgroundColor: metal?.color + "20",
                                  borderColor: metal?.color,
                                  color: "hsl(var(--foreground))",
                                  borderWidth: "1px",
                                }}
                              >
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
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-base py-4 text-right font-mono tabular-nums">
                  {recipe.meltTempC ? `${recipe.meltTempC}°C` : "—"}
                </TableCell>
                <TableCell className="py-4 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={getWikiUrl(recipe.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${recipe.name} on wiki`}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on wiki</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-base py-4 text-muted-foreground">
                  {recipe.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
