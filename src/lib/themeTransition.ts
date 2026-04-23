type ThemeMode = "light" | "dark";

export function applyTheme(next: ThemeMode): void {
  if (typeof document === "undefined") return;

  const apply = () => {
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof document.startViewTransition === "function" && !prefersReducedMotion) {
    document.startViewTransition(apply);
    return;
  }

  apply();
}
