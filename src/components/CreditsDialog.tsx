import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreditsDialogProps {
  trigger: React.ReactNode;
}

export function CreditsDialog({ trigger }: CreditsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Credits & Licenses</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          <section>
            <h3 className="font-semibold text-foreground mb-1">Game Assets & Data</h3>
            <p className="text-muted-foreground">
              All game images (ingots, nuggets, logo, anvil icon) and alloy recipe data are
              the intellectual property of{" "}
              <a
                href="https://www.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Anego Studios
              </a>{" "}
              / Vintage Story. Used here for fan/community purposes with attribution.
              Alloy data sourced from the{" "}
              <a
                href="https://wiki.vintagestory.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Vintage Story Wiki
              </a>
              .
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">Fonts</h3>
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
                — SIL Open Font License 1.1
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
                — SIL Open Font License 1.1
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">Open Source Libraries</h3>
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
                — MIT License
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
                — MIT License
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
                — MIT License
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
                — MIT License
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
                — MIT License
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
                — ISC License
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
                — Apache-2.0 License
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">This Project</h3>
            <p className="text-muted-foreground">
              Source code licensed under the{" "}
              <a
                href="https://github.com/PirateSeal/vs-alloy-calculator/blob/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                MIT License
              </a>
              . Not affiliated with Anego Studios.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
