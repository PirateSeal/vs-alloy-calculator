import { useTranslation } from "@/i18n";

export function PlannerRecipeSelector() {
  const { t } = useTranslation();

  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
      <h1 id="planner-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
        {t("planner.title")}
      </h1>
      <p className="text-sm text-muted-foreground" data-pretty-text>
        {t("planner.description")}
      </p>
    </header>
  );
}
