import { CreditsDialog } from "./CreditsDialog";
import { PrivacyNote } from "./PrivacyNote";
import { useTranslation } from "@/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t shrink-0" role="contentinfo">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t("footer.copyright")}
          <span className="ml-3 opacity-50">v{__APP_VERSION__}</span>
        </span>
        <div className="flex items-center gap-4">
          <CreditsDialog
            trigger={
              <button className="hover:text-foreground transition-colors cursor-pointer">
                {t("footer.credits")}
              </button>
            }
          />
          <PrivacyNote
            trigger={
              <button className="hover:text-foreground transition-colors cursor-pointer">
                {t("footer.privacy")}
              </button>
            }
          />
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {t("footer.license")}
          </a>
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {t("footer.github")}
          </a>
        </div>
      </div>
    </footer>
  );
}
