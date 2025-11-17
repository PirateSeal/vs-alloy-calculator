import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { METALS } from "@/data/alloys";
import type { EvaluationResult } from "@/lib/alloyLogic";
import type { AlloyRecipe } from "@/types/alloys";

interface ResultCardProps {
  evaluation: EvaluationResult;
  recipes: AlloyRecipe[];
  onLoadPreset: (recipe: AlloyRecipe, ingotAmount: number) => void;
}

export function ResultCard({ evaluation, recipes, onLoadPreset }: ResultCardProps) {
  const { totalUnits, bestMatch } = evaluation;
  const [ingotAmount, setIngotAmount] = useState(1);

  // Maximum ingots: 4 slots * 128 nuggets / 20 nuggets per ingot = 25.6 ingots
  const MAX_INGOTS = 25;

  // Create a map for quick metal lookup
  const metalMap = new Map(METALS.map((m) => [m.id, m]));

  // Helper to get ingot image path
  const getIngotImage = (recipeId: string) => {
    return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
  };

  const handlePresetChange = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      onLoadPreset(recipe, ingotAmount);
    }
  };

  // Render preset selector
  const renderPresetSelector = (label: string) => (
    <div className="space-y-3">
      <label htmlFor="preset-select" className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-3 items-center">
        <div className="flex-[2]">
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger id="preset-select" aria-label="Select alloy preset" className="h-12">
              <SelectValue placeholder="Choose an alloy..." />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id} className="py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={getIngotImage(recipe.id)}
                      alt=""
                      className="w-8 h-8 object-contain"
                      aria-hidden="true"
                    />
                    <span className="text-base">{recipe.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Amount</span>
            <span className="font-medium text-foreground">{ingotAmount} ingot{ingotAmount !== 1 ? 's' : ''}</span>
          </div>
          <Slider
            value={[ingotAmount]}
            onValueChange={(value) => setIngotAmount(value[0])}
            min={1}
            max={MAX_INGOTS}
            step={1}
            aria-label="Ingot amount"
          />
        </div>
      </div>
    </div>
  );

  // Empty state
  if (totalUnits === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle as="h2">Alloy Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert role="status" aria-live="polite">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Add metals to the crucible to see alloy results
            </AlertDescription>
          </Alert>

          {renderPresetSelector("Load Preset:")}
        </CardContent>
      </Card>
    );
  }

  // No match state
  if (!bestMatch) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle as="h2">Alloy Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              No known alloy from this composition
            </AlertDescription>
          </Alert>

          {renderPresetSelector("Load Preset:")}
        </CardContent>
      </Card>
    );
  }

  // Exact match state
  if (bestMatch.isExact) {
    return (
      <Card className="border-green-500/50 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle as="h2" className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              {bestMatch.recipe.name}
            </CardTitle>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              Exact alloy
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-500/50 bg-green-500/10" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              This composition creates a valid {bestMatch.recipe.name} alloy!
            </AlertDescription>
          </Alert>

          {renderPresetSelector("Load Different Preset:")}

          <div>
            <h3 className="text-sm font-medium mb-2">Composition Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Metal</TableHead>
                  <TableHead scope="col">Required</TableHead>
                  <TableHead scope="col" className="text-right">Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestMatch.recipe.components.map((component) => {
                  const metal = metalMap.get(component.metalId);
                  const actualAmount = evaluation.amounts.find(
                    (a) => a.metalId === component.metalId
                  );
                  const actualPercent = actualAmount?.percent || 0;

                  return (
                    <TableRow key={component.metalId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metal?.color }}
                            aria-hidden="true"
                          />
                          {metal?.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.minPercent}% - {component.maxPercent}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {actualPercent.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Close match state (not exact)
  return (
    <Card className="border-orange-500/50 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h2" className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
            Closest alloy: {bestMatch.recipe.name}
          </CardTitle>
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Not valid yet
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-500/50 bg-orange-500/10" role="status" aria-live="polite">
          <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Your composition is close to {bestMatch.recipe.name}, but some
            percentages are outside the required ranges.
          </AlertDescription>
        </Alert>

        {renderPresetSelector("Load Different Preset:")}

        <div>
          <h3 className="text-sm font-medium mb-2">Adjustments Needed</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Metal</TableHead>
                <TableHead scope="col">Required</TableHead>
                <TableHead scope="col" className="text-right">Actual</TableHead>
                <TableHead scope="col" className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestMatch.recipe.components.map((component) => {
                const metal = metalMap.get(component.metalId);
                const actualAmount = evaluation.amounts.find(
                  (a) => a.metalId === component.metalId
                );
                const actualPercent = actualAmount?.percent || 0;

                const violation = bestMatch.violations.find(
                  (v) => v.metalId === component.metalId
                );

                const isValid = !violation;
                const isTooLow =
                  violation && actualPercent < (violation.requiredMin || 0);
                const isTooHigh =
                  violation && actualPercent > (violation.requiredMax || 100);

                return (
                  <TableRow key={component.metalId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: metal?.color }}
                          aria-hidden="true"
                        />
                        {metal?.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      {component.minPercent}% - {component.maxPercent}%
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        isValid
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {actualPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {isValid && (
                        <span className="text-green-600 dark:text-green-400" aria-label="Status: OK">
                          ✓ OK
                        </span>
                      )}
                      {isTooLow && (
                        <span className="text-red-600 dark:text-red-400" aria-label="Status: Too low">
                          Too low
                        </span>
                      )}
                      {isTooHigh && (
                        <span className="text-orange-600 dark:text-orange-400" aria-label="Status: Too high">
                          Too high
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Show contamination if present */}
        {bestMatch.violations.some((v) => !v.requiredMin && !v.requiredMax) && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Contamination detected:</strong> This alloy contains metals
              that shouldn't be present:{" "}
              {bestMatch.violations
                .filter((v) => !v.requiredMin && !v.requiredMax)
                .map((v) => metalMap.get(v.metalId)?.label)
                .join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
