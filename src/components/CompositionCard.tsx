import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METALS } from "@/data/alloys";
import type { MetalAmount } from "@/lib/alloyLogic";
import CountUp from "@/components/ui/count-up";

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

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Current Composition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total summary */}
        <div className="flex justify-between text-base" role="status" aria-live="polite">
          <span className="font-medium">Total:</span>
          <span>
            <CountUp to={totalNuggets} duration={0.2} /> nuggets (<CountUp to={totalUnits} duration={0.2} /> units)
          </span>
        </div>

        {/* Metal breakdown */}
        <div className="space-y-3" role="list" aria-label="Metal composition breakdown">
          {amounts.map((amount) => {
            const metal = metalMap.get(amount.metalId);
            if (!metal) return null;

            return (
              <div key={amount.metalId} className="flex items-center gap-3 text-base" role="listitem">
                {/* Nugget image */}
                <img
                  src={metal.nuggetImage}
                  alt=""
                  className="w-10 h-10 object-contain flex-shrink-0"
                  aria-hidden="true"
                />

                {/* Metal name */}
                <span className="font-medium min-w-[80px]">{metal.label}</span>

                {/* Amounts */}
                <span className="text-muted-foreground flex-1">
                  <CountUp to={amount.nuggets} duration={0.2} /> nuggets (<CountUp to={amount.units} duration={0.2} /> units)
                </span>

                {/* Percentage */}
                <span className="font-mono font-medium min-w-[60px] text-right">
                  <CountUp to={Math.round(amount.percent)} duration={0.2} />%
                </span>
              </div>
            );
          })}
        </div>

        {/* Stacked bar chart */}
        <div className="mt-4">
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
        </div>
      </CardContent>
    </Card>
  );
}
