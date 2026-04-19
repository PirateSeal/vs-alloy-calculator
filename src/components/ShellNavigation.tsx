import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Globe,
  Calculator,
  Hammer,
  Info,
  Languages,
  Link,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { AppDomain, AppNavTarget } from "@/types/app";
import { LOCALE_OPTIONS, useTranslation } from "@/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ShellNavigationProps {
  activeDomain: AppDomain;
  activeView: AppNavTarget;
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  onTabChange: (tab: AppNavTarget) => void;
}

function DomainNavigationMenu({
  activeDomain,
  activeView,
  collapsed,
  onExpandRail,
  onSelect,
}: {
  activeDomain: AppDomain;
  activeView: AppNavTarget;
  collapsed: boolean;
  onExpandRail: () => void;
  onSelect: (tab: AppNavTarget) => void;
}) {
  const { t } = useTranslation();
  const [openDomains, setOpenDomains] = useState<Record<AppDomain, boolean>>({
    metallurgy: activeDomain === "metallurgy",
    leather: activeDomain === "leather",
  });

  const items: Array<{
    domain: AppDomain;
    label: string;
    icon: LucideIcon;
    tools: Array<{ tab: AppNavTarget; label: string; description: string; icon: LucideIcon }>;
  }> = [
    {
      domain: "metallurgy",
      label: t("header.domain.metallurgy"),
      icon: Calculator,
      tools: [
        {
          tab: "calculator",
          label: t("header.nav.calculator"),
          description: t("header.nav.calculator_desc"),
          icon: Calculator,
        },
        {
          tab: "planner",
          label: t("header.nav.planner"),
          description: t("header.nav.planner_desc"),
          icon: Compass,
        },
      ],
    },
    {
      domain: "leather",
      label: t("header.domain.leather"),
      icon: Hammer,
      tools: [
        {
          tab: "leather",
          label: t("header.domain.leather"),
          description: t("header.nav.leather_desc"),
          icon: Hammer,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const DomainIcon = item.icon;
        const active = item.domain === activeDomain;
        const open = active || openDomains[item.domain];

        if (collapsed) {
          const button = (
            <button
              type="button"
              onClick={() => {
                setOpenDomains((current) => ({
                  ...current,
                  [item.domain]: true,
                }));
                onExpandRail();
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-2xl bg-background/45 text-sm font-semibold ring-1 ring-inset ring-border/20 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active ? "text-primary" : "text-foreground",
              )}
            >
              <DomainIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          );

          return (
            <Tooltip key={item.domain}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Collapsible
            key={item.domain}
            open={open}
            onOpenChange={(nextOpen) => {
              setOpenDomains((current) => ({
                ...current,
                [item.domain]: nextOpen,
              }));
            }}
            className="flex flex-col gap-2"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 w-full items-center justify-between rounded-2xl bg-background/45 px-3 text-left text-sm font-semibold ring-1 ring-inset ring-border/20 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active ? "text-primary" : "text-foreground",
                  open && "bg-accent/45",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <DomainIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
              <div className="ml-4 flex flex-col gap-1 border-l border-border/20 pl-3">
                {item.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const toolActive = activeView === tool.tab;

                  return (
                    <button
                      key={tool.tab}
                      type="button"
                      onClick={() => onSelect(tool.tab)}
                      aria-current={toolActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                        toolActive ? "bg-primary/14 text-primary" : "text-foreground hover:bg-accent/50",
                      )}
                    >
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-background/55">
                        <ToolIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{tool.label}</span>
                        <span className="block text-xs text-muted-foreground">{tool.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function RailNavButton({
  active,
  collapsed,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  collapsed: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary/14 text-primary"
          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/45" aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function ExternalLinkButton({
  href,
  label,
  icon: Icon,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  onClick: () => void;
}) {
  const anchor = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "group flex h-10 items-center gap-3 rounded-2xl px-3 text-xs font-medium text-muted-foreground/80 transition-all hover:bg-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed ? "justify-center px-0" : "w-full",
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/35 transition-colors",
          "group-hover:text-foreground",
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </a>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{anchor}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return anchor;
}

function RailActionButton({
  collapsed,
  icon: icon,
  label,
  onClick,
  active,
}: {
  collapsed: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group flex h-10 w-full items-center gap-3 rounded-2xl px-3 text-xs font-medium text-muted-foreground/80 transition-colors hover:bg-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed && "justify-center px-0",
        active && "text-primary",
      )}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/35" aria-hidden="true">
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function LocaleRailAction({ collapsed }: { collapsed: boolean }) {
  const { t, locale, setLocale } = useTranslation();
  const activeLocale = LOCALE_OPTIONS.find((option) => option.id === locale) ?? LOCALE_OPTIONS[0];

  const trigger = (
    <button
      type="button"
      aria-label={t("header.locale.label")}
      className={cn(
        "group flex h-10 w-full items-center gap-3 rounded-2xl px-3 text-xs font-medium text-muted-foreground/80 transition-colors hover:bg-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed && "justify-center px-0",
      )}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/35" aria-hidden="true">
        <Languages className="h-4 w-4" />
      </span>
      <span className={cn("flex min-w-0 items-center gap-2 truncate", collapsed && "sr-only")}>
        <img
          src={activeLocale.flagSrc}
          alt=""
          aria-hidden="true"
          className="h-4 w-6 shrink-0 rounded-sm object-cover"
        />
        <span className="truncate">{activeLocale.label}</span>
      </span>
    </button>
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">
            <p>{t("header.locale.label")}</p>
          </TooltipContent>
        )}
      </Tooltip>
      <DropdownMenuContent
        side="right"
        align="end"
        className="w-48 rounded-2xl border-border/20 bg-popover/95 p-2 backdrop-blur-xl"
      >
        {LOCALE_OPTIONS.map((loc) => (
          <DropdownMenuItem
            key={loc.id}
            onClick={() => {
              setLocale(loc.id);
              track("locale-changed", { locale: loc.id });
            }}
            className={locale === loc.id ? "bg-accent/60" : ""}
          >
            <img
              src={loc.flagSrc}
              alt=""
              aria-hidden="true"
              className="h-4 w-6 rounded-sm object-cover"
            />
            <span>{loc.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShellNavigationRail({
  activeDomain,
  activeView,
  collapsed,
  onCollapseChange,
  onTabChange,
}: ShellNavigationProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("share-link-copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside
      className={cn(
        "animate-surface-in fixed left-0 top-0 z-20 hidden h-dvh shrink-0 p-4 lg:block",
        collapsed ? "w-[6rem]" : "w-[18rem]",
      )}
      aria-label={t("header.title")}
    >
      <div className="flex h-full flex-col rounded-[1.75rem] bg-card/80 p-3 shadow-md ring-1 ring-inset ring-border/20 backdrop-blur-xl">
        <div className={cn("flex shrink-0 items-center gap-3 px-1 pb-4", collapsed && "flex-col gap-2")}>
          <img
            src="/gamelogo-vintagestory-square.webp"
            alt={t("header.logo_alt")}
            className="h-10 w-10 shrink-0 rounded-2xl object-contain ring-1 ring-inset ring-border/20"
          />
          <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
            <p className="truncate text-sm font-semibold text-foreground">{t("header.title")}</p>
          </div>
          <button
            type="button"
            onClick={() => onCollapseChange(!collapsed)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-xl text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              collapsed ? "h-8 w-full rounded-2xl bg-background/25 hover:bg-accent/40" : "h-8 w-8",
            )}
            aria-label={t(collapsed ? "header.nav.expand" : "header.nav.collapse")}
            title={t(collapsed ? "header.nav.expand" : "header.nav.collapse")}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="mb-4 border-t border-border/20" />

        <div className="mb-4">
          <div className={cn("mb-3 px-1", collapsed && "sr-only")}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground/80">
              {t("header.nav.domain_switch")}
            </p>
          </div>
          <DomainNavigationMenu
            activeDomain={activeDomain}
            activeView={activeView}
            collapsed={collapsed}
            onExpandRail={() => onCollapseChange(false)}
            onSelect={onTabChange}
          />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex min-h-full flex-col pr-2">
            <div className="space-y-2 border-t border-border/20 pt-4">
              <div className={cn("mb-2 px-1", collapsed && "sr-only")}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground/80">
                  {t("header.nav.guides")}
                </p>
              </div>
              <RailNavButton
                active={activeView === "reference"}
                collapsed={collapsed}
                icon={BookOpen}
                label={t("header.nav.reference")}
                onClick={() => onTabChange("reference")}
              />
              <RailNavButton
                active={activeView === "overview"}
                collapsed={collapsed}
                icon={Info}
                label={t("header.nav.overview")}
                onClick={() => onTabChange("overview")}
              />
            </div>

            <div className="space-y-1.5 border-t border-border/20 pt-4">
              <RailActionButton
                collapsed={collapsed}
                icon={copied ? <Check className="h-4 w-4 text-success" /> : <Link className="h-4 w-4" />}
                label={t(copied ? "header.share.copied" : "header.share.copy")}
                onClick={handleShare}
                active={copied}
              />
              <LocaleRailAction collapsed={collapsed} />
              <ThemeToggle
                showLabel={!collapsed}
                className="h-10 text-xs font-medium text-muted-foreground/80 hover:bg-accent/30"
              />
            </div>

            <div className="mt-6 space-y-1.5 border-t border-border/20 pt-4">
              <ExternalLinkButton
                href="https://www.vintagestory.at"
                label={t("header.nav.vs_website")}
                icon={Globe}
                collapsed={collapsed}
                onClick={() => track("external-link", { destination: "vintage-story" })}
              />
              <ExternalLinkButton
                href="https://wiki.vintagestory.at"
                label={t("header.nav.wiki")}
                icon={BookOpen}
                collapsed={collapsed}
                onClick={() => track("external-link", { destination: "wiki" })}
              />
              <ExternalLinkButton
                href="https://github.com/PirateSeal/vs-alloy-calculator"
                label={t("header.nav.github")}
                icon={ExternalLink}
                collapsed={collapsed}
                onClick={() => track("external-link", { destination: "github" })}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

export function ShellMobileNav({
  activeView,
  onTabChange,
}: Pick<ShellNavigationProps, "activeView" | "onTabChange">) {
  const { t, locale, setLocale } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("share-link-copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const items: Array<{ tab: AppNavTarget; label: string; icon: LucideIcon }> = [
    { tab: "calculator", label: t("header.nav.calculator"), icon: Calculator },
    { tab: "planner", label: t("header.nav.planner"), icon: Compass },
    { tab: "leather", label: t("header.nav.leather"), icon: Hammer },
    { tab: "reference", label: t("header.nav.reference"), icon: BookOpen },
    { tab: "overview", label: t("header.nav.overview"), icon: Info },
  ];
  const mobileActionClassName =
    "inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-muted-foreground ring-1 ring-inset ring-border/20 transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden" aria-label={t("header.title")}>
      <div className="border-t border-border/20 bg-background/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 backdrop-blur-xl">
        <div className="mx-auto mb-2 flex w-full max-w-3xl items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label={t(copied ? "header.share.copied" : "header.share.copy")}
            className={mobileActionClassName}
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Link className="h-4 w-4" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={t("header.locale.label")} className={mobileActionClassName}>
                <Languages className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-48 rounded-2xl border-border/20 bg-popover/95 p-2 backdrop-blur-xl">
              {LOCALE_OPTIONS.map((loc) => (
                <DropdownMenuItem
                  key={loc.id}
                  onClick={() => {
                    setLocale(loc.id);
                    track("locale-changed", { locale: loc.id });
                  }}
                  className={locale === loc.id ? "bg-accent/60" : ""}
                >
                  <img
                    src={loc.flagSrc}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                  <span>{loc.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
        <div className="mx-auto grid w-full max-w-3xl grid-cols-5 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.tab;

            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => onTabChange(item.tab)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary/14 text-primary shadow-[inset_0_0_0_1px_rgba(239,189,141,0.18)]"
                    : "bg-card/70 text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
