import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METALS } from "@/data/alloys";
import type { MetalAmount } from "@/lib/alloyLogic";

interface CompositionCardProps {
  amounts: MetalAmount[];
  totalNuggets: number;
  totalUnits: number;
}

export function CompositionCard({
  amounts,
  totalNuggets,
  totalUnits,
}: CompositionCardProps) {
  // Empty state
  if (totalUnits === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle as="h2">Current Composition</CardTitle>
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

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle as="h2">Current Composition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total summary */}
        <div className="flex justify-between text-sm" role="status" aria-live="polite">
          <span className="font-medium">Total:</span>
          <span>
            {totalNuggets} nuggets ({totalUnits} units)
          </span>
        </div>

        {/* Metal breakdown */}
        <div className="space-y-2" role="list" aria-label="Metal composition breakdown">
          {amounts.map((amount) => {
            const metal = metalMap.get(amount.metalId);
            if (!metal) return null;

            return (
              <div key={amount.metalId} className="flex items-center gap-3 text-sm" role="listitem">
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: metal.color }}
                  aria-hidden="true"
                />

                {/* Metal name */}
                <span className="font-medium min-w-[80px]">{metal.label}</span>

                {/* Amounts */}
                <span className="text-muted-foreground flex-1">
                  {amount.nuggets} nuggets ({amount.units} units)
                </span>

                {/* Percentage */}
                <span className="font-mono font-medium min-w-[60px] text-right">
                  {amount.percent.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Stacked bar chart */}
        <div className="mt-4">
          <div
            className="flex h-8 rounded-md overflow-hidden border border-border"
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
                  className="flex items-center justify-center text-xs font-medium text-white transition-all hover:opacity-80"
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
        </div>
      </CardContent>
    </Card>
  );
}
