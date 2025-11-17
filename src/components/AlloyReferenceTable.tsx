import type { AlloyRecipe } from "../types/alloys";
import { METALS } from "../data/alloys";
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

interface AlloyReferenceTableProps {
  recipes: AlloyRecipe[];
}

export function AlloyReferenceTable({ recipes }: AlloyReferenceTableProps) {
  // Helper function to get metal label from metalId
  const getMetalLabel = (metalId: string) => {
    const metal = METALS.find((m) => m.id === metalId);
    return metal?.label || metalId;
  };

  // Format components as "Metal: min-max%"
  const formatComponents = (recipe: AlloyRecipe) => {
    return recipe.components
      .map((component) => {
        const metalLabel = getMetalLabel(component.metalId);
        return `${metalLabel}: ${component.minPercent}-${component.maxPercent}%`;
      })
      .join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Alloy Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <Table aria-label="Alloy recipes reference table">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Alloy Name</TableHead>
              <TableHead scope="col">Components</TableHead>
              <TableHead scope="col">Smelting Temp</TableHead>
              <TableHead scope="col">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.name}</TableCell>
                <TableCell>{formatComponents(recipe)}</TableCell>
                <TableCell>
                  {recipe.meltTempC ? `${recipe.meltTempC}°C` : "—"}
                </TableCell>
                <TableCell>{recipe.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
