import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShellMobileNav, ShellNavigationRail } from "@/components/ShellNavigation";
import { TranslationNotice } from "@/components/TranslationNotice";
import type { AppDomain, AppNavTarget } from "@/types/app";

interface AppShellLayoutProps {
  activeDomain: AppDomain;
  activeView: AppNavTarget;
  railCollapsed: boolean;
  onRailCollapsedChange: (collapsed: boolean) => void;
  onNavigate: (target: AppNavTarget) => void;
  children: ReactNode;
  mainClassName?: string;
}

export function AppShellLayout({
  activeDomain,
  activeView,
  railCollapsed,
  onRailCollapsedChange,
  onNavigate,
  children,
  mainClassName,
}: AppShellLayoutProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ShellNavigationRail
        activeView={activeView}
        activeDomain={activeDomain}
        collapsed={railCollapsed}
        onCollapseChange={onRailCollapsedChange}
        onTabChange={onNavigate}
      />

      <div
        className={cn(
          "flex min-h-dvh min-w-0 flex-col overflow-x-clip transition-[padding-left] duration-300",
          railCollapsed ? "lg:pl-[6rem]" : "lg:pl-[18rem]",
        )}
      >
        <div className="lg:hidden">
          <Header activeTab={activeView} />
        </div>
        <TranslationNotice />
        <main
          className={cn(
            "mx-auto w-full max-w-[1680px] flex-1 px-4 pb-36 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-5",
            mainClassName,
          )}
          role="main"
        >
          {children}
        </main>
        <Footer />
      </div>

      <ShellMobileNav activeView={activeView} onTabChange={onNavigate} />
    </div>
  );
}
