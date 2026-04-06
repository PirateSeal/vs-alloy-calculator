import { useState } from "react";
import { useTranslation } from "@/i18n";
import { X } from "lucide-react";

export function TranslationNotice() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const notice = t("app.translation_notice");
  if (!notice || dismissed) return null;

  return (
    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200">
      <span className="flex-1">{notice}</span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
        aria-label={t("common.close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
