import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  if (savedTheme) return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-11 h-11 rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun
          className={`absolute h-5 w-5 transition-all duration-300 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
