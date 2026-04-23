import type { LeatherworkCalculation } from "@/features/leatherwork/types/leather";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShoppingListProps {
  calculation: LeatherworkCalculation;
}

export function ShoppingList({ calculation }: ShoppingListProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/20 bg-card/70 shadow-sm ring-1 ring-inset ring-border/20">
      <CardHeader className="pb-4">
        <CardTitle>{t("leather.shopping.title")}</CardTitle>
        <CardDescription>{t("leather.shopping.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="stagger-surface-children flex flex-col gap-3">
          {calculation.shoppingList.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-2xl border border-border/20 bg-background/50 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="flex items-center gap-3">
                {item.assetPath ? (
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-card/90 ring-1 ring-inset ring-border/20">
                    <img src={item.assetPath} alt="" aria-hidden="true" className="size-8 object-contain image-outline rounded" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  {item.hint ? <p className="text-xs text-muted-foreground">{item.hint}</p> : null}
                </div>
              </div>
              <div className="flex items-center justify-start text-left sm:justify-end sm:text-right">
                <p className="text-base font-semibold text-foreground tabular-nums">{item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
