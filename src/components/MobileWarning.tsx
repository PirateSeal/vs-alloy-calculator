import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MobileWarningProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function MobileWarning({ isOpen, onDismiss }: MobileWarningProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onDismiss}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Mobile Experience Notice
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-2">
            <p>
              This calculator was designed for desktop use and may not work optimally on mobile devices.
            </p>
            <p className="text-sm text-muted-foreground">
              For the best experience, please use a desktop or tablet with a larger screen.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
