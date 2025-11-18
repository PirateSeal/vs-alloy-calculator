import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METALS } from "@/data/alloys";
import type { MetalAmount, AlloyMatchDetail } from "@/lib/alloyLogic";
import { getRarityScore } from "@/lib/metalRarity";
import CountUp from "@/components/ui/count-up";
import { ArrowUp, ArrowDown, Check } from "lucide-react";

interface CompositionCardProps {
  amounts: MetalAmount[];
  totalNuggets: number;
  totalUnits: number;
  bestMatch: AlloyMatchDetail | null;
}

export function CompositionCard({
  amounts,
  totalNuggets,
  totalUnits,
  bestMatch,
}: CompositionCardProps) {
  // Empty state
  if (totalUnits === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Current Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Empty crucible
          </p>
        </CardContent>
      </Card>
    );
  }

  // Create a map for quick metal lookup
  const metalMap = new Map(METALS.map((m) => [m.id, m]));

  // Calculate total rarity cost
  const totalRarityCost = amounts.reduce(
    (total, amount) => total + (amount.nuggets * getRarityScore(amount.metalId)),
    0
  );

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Current Composition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total summary */}
        <div className="grid grid-cols-2 gap-4 text-base" role="status" aria-live="polite">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="font-semibold">
              <CountUp to={totalNuggets} duration={0.2} /> nuggets (<CountUp to={totalUnits} duration={0.2} /> units)
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Rarity Cost</span>
            <span className="font-semibold font-mono">
              <CountUp to={parseFloat(totalRarityCost.toFixed(1))} duration={0.2} />
            </span>
          </div>
        </div>

        {/* Stacked bar chart */}
        <div className="mt-4 space-y-3">
          <div
            className="flex h-10 rounded-md overflow-hidden border border-border"
            role="img"
            aria-label={`Composition bar chart: ${amounts.map(a => {
              const metal = metalMap.get(a.metalId);
              return `${metal?.label} ${a.percent.toFixed(1)}%`;
            }).join(', ')}`}
          >
            {amounts.map((amount) => {
              const metal = metalMap.get(amount.metalId);
              if (!metal) return null;

              return (
                <div
                  key={amount.metalId}
                  className="flex items-center justify-center text-sm font-medium text-white transition-all hover:opacity-80"
                  style={{
                    backgroundColor: metal.color,
                    width: `${amount.percent}%`,
                  }}
                  title={`${metal.label}: ${amount.percent.toFixed(1)}%`}
                  aria-hidden="true"
                >
                  {amount.percent >= 10 && (
                    <span className="drop-shadow-md">{metal.shortLabel}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sweet spot zones - only show if we have a bestMatch */}
          {bestMatch && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Sweet Spot Zones for {bestMatch.recipe.name}:
              </div>
              {bestMatch.recipe.components.map((component) => {
                const metal = metalMap.get(component.metalId);
                const actualAmount = amounts.find((a) => a.metalId === component.metalId);
                const actualPercent = actualAmount?.percent || 0;

                // Check if within range
                const isValid = actualPercent >= component.minPercent && actualPercent <= component.maxPercent;
                const isTooLow = actualPercent < component.minPercent;

                return (
                  <div key={component.metalId} className="flex items-center gap-2 text-sm">
                    {/* Metal indicator */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <img
                        src={metal?.nuggetImage}
                        alt=""
                        className="w-5 h-5 object-contain"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{metal?.label}</span>
                    </div>

                    {/* Visual range indicator */}
                    <div className="flex-1 relative h-6 bg-muted rounded-md overflow-hidden">
                      {/* Sweet spot zone */}
                      <div
                        className="absolute h-full bg-green-500/20 border-x-2 border-green-500"
                        style={{
                          left: `${component.minPercent}%`,
                          width: `${component.maxPercent - component.minPercent}%`,
                        }}
                      />

                      {/* Current position marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 transition-all"
                        style={{
                          left: `${Math.min(100, actualPercent)}%`,
                          backgroundColor: isValid ? '#22c55e' : isTooLow ? '#ef4444' : '#f97316',
                        }}
                      >
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background"
                          style={{
                            backgroundColor: isValid ? '#22c55e' : isTooLow ? '#ef4444' : '#f97316',
                          }}
                        />
                      </div>

                      {/* Range labels */}
                      <div className="absolute inset-0 flex items-center justify-between px-1 text-xs font-mono text-muted-foreground pointer-events-none">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Status indicator with arrow */}
                    <div className="flex items-center gap-1 min-w-[100px]">
                      {isValid ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="h-4 w-4" />
                          <span className="text-xs font-medium">Valid</span>
                        </div>
                      ) : isTooLow ? (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <ArrowUp className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            +{(component.minPercent - actualPercent).toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <ArrowDown className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            -{(actualPercent - component.maxPercent).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        ({component.minPercent}-{component.maxPercent}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
