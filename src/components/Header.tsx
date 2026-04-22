import { useTranslation } from "@/i18n";
import type { AppNavTarget } from "@/types/app";

interface HeaderProps {
  activeTab: AppNavTarget;
}

export function Header({ activeTab }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className="animate-surface-in sticky top-0 z-30 border-b border-border/20 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72"
      role="banner"
    >
      <div className="mx-auto flex w-full max-w-[1680px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/gamelogo-vintagestory-square.webp"
            alt={t("header.logo_alt")}
            className="image-outline h-11 w-11 shrink-0 rounded-2xl bg-card/80 object-contain p-1.5"
          />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                {t("header.title")}
              </p>
              <span className="surface-chip inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {t(`header.nav.${activeTab}`)}
              </span>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block" data-pretty-text>
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
