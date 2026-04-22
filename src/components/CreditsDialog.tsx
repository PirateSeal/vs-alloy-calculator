import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";

interface CreditsDialogProps {
  trigger: React.ReactNode;
}

export function CreditsDialog({ trigger }: CreditsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t("common.close")} className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("credits.title")}</DialogTitle>
        </DialogHeader>
        <div className="stagger-surface-children space-y-5 text-sm" data-pretty-text>
          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("credits.assets.title")}</h3>
            <p className="text-muted-foreground">
              {t("credits.assets.body_before")}{" "}
              <a
                href="https://www.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Anego Studios
              </a>{" "}
              {t("credits.assets.body_middle")}{" "}
              <a
                href="https://wiki.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Vintage Story Wiki
              </a>
              {t("credits.assets.body_after")}
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("credits.fonts.title")}</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <a
                  href="https://fonts.google.com/specimen/Nunito"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Nunito
                </a>{" "}
                {t("credits.fonts.license")}
              </li>
              <li>
                <a
                  href="https://fonts.google.com/specimen/JetBrains+Mono"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  JetBrains Mono
                </a>{" "}
                {t("credits.fonts.license")}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("credits.opensource.title")}</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  React
                </a>{" "}
                {t("credits.opensource.mit")}
              </li>
              <li>
                <a
                  href="https://www.radix-ui.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Radix UI
                </a>{" "}
                {t("credits.opensource.mit")}
              </li>
              <li>
                <a
                  href="https://ui.shadcn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  shadcn/ui
                </a>{" "}
                {t("credits.opensource.mit")}
              </li>
              <li>
                <a
                  href="https://tailwindcss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Tailwind CSS
                </a>{" "}
                {t("credits.opensource.mit")}
              </li>
              <li>
                <a
                  href="https://www.framer.com/motion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Framer Motion
                </a>{" "}
                {t("credits.opensource.mit")}
              </li>
              <li>
                <a
                  href="https://lucide.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Lucide
                </a>{" "}
                {t("credits.opensource.isc")}
              </li>
              <li>
                <a
                  href="https://cva.style"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  class-variance-authority
                </a>{" "}
                {t("credits.opensource.apache")}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">{t("credits.project.title")}</h3>
            <p className="text-muted-foreground">
              {t("credits.project.body_before")}{" "}
              <a
                href="https://github.com/PirateSeal/vs-alloy-calculator/blob/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                MIT License
              </a>
              {t("credits.project.body_after")}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
