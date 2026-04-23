import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";

interface PrivacyNoteProps {
  trigger: React.ReactNode;
}

export function PrivacyNote({ trigger }: PrivacyNoteProps) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t("common.close")} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("privacy.title")}</DialogTitle>
        </DialogHeader>
        <div className="stagger-surface-children space-y-4 text-sm" data-pretty-text>
          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("privacy.analytics.title")}</h3>
            <p className="text-muted-foreground">
              {t("privacy.analytics.body_before")}{" "}
              <a
                href="https://umami.is"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Umami
              </a>
              {t("privacy.analytics.body_after")}
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("privacy.storage.title")}</h3>
            <p className="text-muted-foreground">
              {t("privacy.storage.body_before")} <code className="text-xs bg-muted px-1 rounded">localStorage</code> {t("privacy.storage.body_after")}
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("privacy.compliance.title")}</h3>
            <p className="text-muted-foreground">
              {t("privacy.compliance.body")}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
