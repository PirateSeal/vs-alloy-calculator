import { Amphora, BookOpen, Hammer } from "lucide-react";
import type { AlloyRecipe } from "@/features/metallurgy/types/alloys";
import { useTranslation } from "@/i18n";
import type { ReferenceTab } from "@/types/app";
import { LeatherReferencePanel } from "@/components/LeatherReferencePanel";
import { AlloyReferenceTable } from "@/features/metallurgy/components/AlloyReferenceTable";
import { PotteryReference } from "@/features/pottery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackReferenceTabChange } from "@/lib/analytics";

interface SharedReferencePageProps {
  recipes: AlloyRecipe[];
  activeTab: ReferenceTab;
  onTabChange: (tab: ReferenceTab) => void;
}

export function SharedReferencePage({
  recipes,
  activeTab,
  onTabChange,
}: SharedReferencePageProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <Card className="animate-surface-in rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-inset ring-border/35">
        <CardHeader className="space-y-3 bg-background/25">
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("reference.shared.title")}
          </CardTitle>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
            {t("reference.shared.description")}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              const nextTab = value as ReferenceTab;
              if (nextTab !== activeTab) {
                trackReferenceTabChange(nextTab, { source: "tabs" });
              }
              onTabChange(nextTab);
            }}
            className="space-y-4"
          >
            <TabsList className="h-auto flex-wrap gap-2 rounded-[1.5rem] bg-background/55 p-2">
              <TabsTrigger
                value="metallurgy"
                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary"
              >
                <BookOpen data-icon="inline-start" />
                {t("header.domain.metallurgy")}
              </TabsTrigger>
              <TabsTrigger
                value="leather"
                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary"
              >
                <Hammer data-icon="inline-start" />
                {t("header.domain.leather")}
              </TabsTrigger>
              <TabsTrigger
                value="pottery"
                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary"
              >
                <Amphora data-icon="inline-start" />
                {t("header.domain.pottery")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="metallurgy" className="mt-0">
              <AlloyReferenceTable recipes={recipes} />
            </TabsContent>
            <TabsContent value="leather" className="mt-0">
              <LeatherReferencePanel />
            </TabsContent>
            <TabsContent value="pottery" className="mt-0">
              <PotteryReference />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
