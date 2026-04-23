import { Moon, Sun } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/useTheme";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const label = t(theme === "light" ? "theme.toggle_to_dark" : "theme.toggle_to_light");

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex h-11 w-full items-center transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        showLabel
          ? "gap-3 rounded-2xl px-3 text-sm font-semibold text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          : "justify-center rounded-2xl px-0 text-muted-foreground/70 hover:bg-accent/40 hover:text-foreground",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <span
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/45"
      >
        <Sun
          className={cn(
            "absolute h-5 w-5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0",
          )}
        />
        <Moon
          className={cn(
            "absolute h-5 w-5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </span>
      {showLabel && <span className="truncate">{label}</span>}
    </button>
  );
}
