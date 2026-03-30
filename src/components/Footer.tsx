import { CreditsDialog } from "./CreditsDialog";

export function Footer() {
  return (
    <footer className="bg-card border-t shrink-0" role="contentinfo">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Game assets &amp; data &copy; Anego Studios / Vintage Story</span>
        <div className="flex items-center gap-4">
          <CreditsDialog
            trigger={
              <button className="hover:text-foreground transition-colors cursor-pointer">
                Credits
              </button>
            }
          />
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            MIT License
          </a>
          <a
            href="https://github.com/PirateSeal/vs-alloy-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
