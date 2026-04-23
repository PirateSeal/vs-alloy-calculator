import { memo } from "react";
import { ExternalLink } from "lucide-react";
import { getIngotImage, getWikiUrl } from "@/features/metallurgy/data/recipeAssets";
import type { AlloyRecipe, Metal, MetalId } from "@/features/metallurgy/types/alloys";
import { useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getCompositionWidth(minPercent: number, maxPercent: number) {
  return (minPercent + maxPercent) / 2;
}

function getTemperatureLabel(temperature: number | null) {
  return temperature ? `${temperature}°C` : "—";
}

interface AlloyCompositionProps {
  recipe: AlloyRecipe;
  metalById: Map<MetalId, Metal>;
  compact: boolean;
}

function AlloyComposition({ recipe, metalById, compact }: AlloyCompositionProps) {
  const { t, getMetalLabel, getMetalShortLabel } = useTranslation();

  return (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/45">
        {recipe.components.map((component) => {
          const metal = metalById.get(component.metalId);
          const width = getCompositionWidth(component.minPercent, component.maxPercent);

          return (
            <div
              key={component.metalId}
              className="h-full"
              style={{ width: `${width}%`, backgroundColor: metal?.color }}
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
                  style={metal ? { backgroundColor: `${metal.color}18`, color: metal.color } : undefined}
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
}

interface AlloyTableRowProps {
  recipe: AlloyRecipe;
  metalById: Map<MetalId, Metal>;
}

export const AlloyTableRow = memo(function AlloyTableRow({ recipe, metalById }: AlloyTableRowProps) {
  const { t, getRecipeName, getRecipeNotes } = useTranslation();
  const notes = getRecipeNotes(recipe.id);
  const temperature = getTemperatureLabel(recipe.meltTempC ?? null);

  return (
    <article className="animate-surface-in-soft group overflow-hidden rounded-3xl bg-background/60 ring-1 ring-inset ring-border/25 transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-background/75 hover:ring-border/35">
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)_minmax(7.5rem,auto)_4rem] md:items-start md:gap-4 md:p-5">
        <div className="flex min-w-0 gap-3 md:items-start">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/70 p-1 ring-1 ring-inset ring-border/30"
            aria-hidden="true"
          >
            <img src={getIngotImage(recipe.id)} alt="" className="h-full w-full object-contain image-outline rounded" />
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
            {notes ? <p className="max-w-prose text-sm leading-6 text-muted-foreground">{notes}</p> : null}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="md:hidden">
            <AlloyComposition recipe={recipe} metalById={metalById} compact />
          </div>
          <div className="hidden md:block">
            <AlloyComposition recipe={recipe} metalById={metalById} compact={false} />
          </div>
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
                  aria-label={t("reference.wiki_aria", { alloy: getRecipeName(recipe.id) })}
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
});
