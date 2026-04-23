import { useState } from "react";
import { useTranslation } from "@/i18n";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function TranslationNotice() {
  const { t } = useTranslation();
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);

  const notice = t("app.translation_notice");
  const isDismissed = dismissedNotice === notice;

  if (!notice || isDismissed) return null;

  return (
    <Alert
      variant="warning"
      aria-live="polite"
      aria-atomic="true"
      className="animate-surface-in flex w-full flex-col gap-3 rounded-none border-0 border-b px-3 py-3 leading-relaxed sm:flex-row sm:items-start sm:px-4"
    >
      <AlertDescription className="min-w-0 flex-1 break-words">
        {notice}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDismissedNotice(notice)}
        aria-label={t("common.close")}
        className="shrink-0 self-end text-amber-800 hover:bg-amber-200 sm:self-auto dark:text-amber-200 dark:hover:bg-amber-800"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
