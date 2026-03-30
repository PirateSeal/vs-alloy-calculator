import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PrivacyNoteProps {
  trigger: React.ReactNode;
}

export function PrivacyNote({ trigger }: PrivacyNoteProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Privacy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
            <p className="text-muted-foreground">
              This site uses{" "}
              <a
                href="https://umami.is"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Umami
              </a>
              , a privacy-friendly analytics tool. It collects only anonymous
              page view counts — no cookies, no personal data, no IP addresses,
              and no cross-site tracking.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-1">No Cookies</h3>
            <p className="text-muted-foreground">
              This site does not use cookies for tracking or advertising. The
              only browser storage used is <code className="text-xs bg-muted px-1 rounded">localStorage</code> to
              remember whether you dismissed the mobile screen-size notice.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-1">Compliance</h3>
            <p className="text-muted-foreground">
              Because no personal data is collected, this site is compliant with
              GDPR, CCPA, and the ePrivacy Directive without requiring a cookie
              consent banner.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
