import { useState } from "react";
import { useTranslation } from "@/i18n";
import { X } from "lucide-react";

export function TranslationNotice() {
  const { t } = useTranslation();
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);

  const notice = t("app.translation_notice");
  const isDismissed = dismissedNotice === notice;

  if (!notice || isDismissed) return null;

  return (
    <div
      className="animate-surface-in flex w-full flex-col gap-3 border-b border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-800 sm:flex-row sm:items-start sm:px-4 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="min-w-0 flex-1 break-words">{notice}</span>
      <button
        type="button"
        onClick={() => setDismissedNotice(notice)}
        className="inline-flex h-11 w-11 shrink-0 self-end items-center justify-center rounded-md transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 sm:self-auto dark:hover:bg-amber-800 dark:focus-visible:ring-offset-amber-950"
        aria-label={t("common.close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
