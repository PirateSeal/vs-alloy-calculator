import { useEffect, useState } from "react";
import { I18nProvider } from "./i18n";
import { MetallurgyApp } from "./features/metallurgy";

function App() {
  const [railCollapsed, setRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("shell-rail-collapsed") === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("shell-rail-collapsed", String(railCollapsed));
  }, [railCollapsed]);

  return (
    <I18nProvider>
      <MetallurgyApp railCollapsed={railCollapsed} onRailCollapsedChange={setRailCollapsed} />
    </I18nProvider>
  );
}

export default App;
