import { CreditsDialog } from "./CreditsDialog";
import { PrivacyNote } from "./PrivacyNote";
import { useTranslation } from "@/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="animate-surface-in animate-delay-3 shrink-0 bg-background/70 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2" role="contentinfo">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t("footer.copyright")}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
            v{__APP_VERSION__}
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
          <CreditsDialog
            trigger={
              <button
                type="button"
                className="inline-flex min-h-10 items-center rounded-full px-2.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("footer.credits")}
              </button>
            }
          />
          <PrivacyNote
            trigger={
              <button
                type="button"
                className="inline-flex min-h-10 items-center rounded-full px-2.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("footer.privacy")}
              </button>
            }
          />
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-full px-2.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("footer.license")}
          </a>
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-full px-2.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("footer.github")}
          </a>
        </div>
      </div>
    </footer>
  );
}
