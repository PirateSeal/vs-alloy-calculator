import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  if (savedTheme) return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const { t } = useTranslation();
  const label = t(theme === "light" ? "theme.toggle_to_dark" : "theme.toggle_to_light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Suppress all CSS transitions while the theme class is applied so text,
    // icons, and backgrounds all flip together instead of at different rates.
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", newTheme === "dark");
    // Force a synchronous reflow so the class changes are flushed before we
    // remove the suppression flag.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    root.offsetHeight;
    root.classList.remove("theme-switching");

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    track("theme-toggled", { theme: newTheme });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
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
          className={`absolute h-5 w-5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
      {showLabel && <span className="truncate">{label}</span>}
    </button>
  );
}
