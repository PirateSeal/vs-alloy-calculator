import { useState } from "react";
import { Calculator, BookOpen, BookText, GitFork, Link, Check, Languages, ChevronDown } from "lucide-react";
import { track } from "@/lib/analytics";
import { ThemeToggle } from "./ThemeToggle";
import { LOCALE_OPTIONS, useTranslation } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const { t, locale, setLocale } = useTranslation();
  const activeLocale = LOCALE_OPTIONS.find((option) => option.id === locale) ?? LOCALE_OPTIONS[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      track("share-link-copied");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="bg-card border-b" role="banner">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/gamelogo-vintagestory-square.webp"
              alt={t("header.logo_alt")}
              className="h-10 w-10 sm:h-16 sm:w-16 object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">{t("header.title")}</h1>
              <p className="hidden sm:block text-muted-foreground text-sm mt-1">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <NavigationMenu>
                <NavigationMenuList className="gap-1 sm:gap-2 flex-wrap">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      onClick={() => onTabChange("calculator")}
                      className={`group inline-flex h-11 w-max items-center justify-center rounded-lg px-4 sm:px-6 py-2.5 text-sm sm:text-base font-semibold transition-all cursor-pointer border-2 ${
                        activeTab === "calculator"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                      }`}
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                      {t("header.nav.calculator")}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      onClick={() => onTabChange("reference")}
                      className={`group inline-flex h-11 w-max items-center justify-center rounded-lg px-4 sm:px-6 py-2.5 text-sm sm:text-base font-semibold transition-all cursor-pointer border-2 ${
                        activeTab === "reference"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                      }`}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      {t("header.nav.reference")}
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://www.vintagestory.at"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("header.nav.vs_website")}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all p-1.5"
                          onClick={() => track("external-link", { destination: "vintage-story" })}
                        >
                          <img
                            src="/gamelogo-vintagestory-square.webp"
                            alt={t("header.external_logo_alt")}
                            className="h-full w-full object-contain"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("header.nav.vs_website")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://wiki.vintagestory.at"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("header.nav.wiki")}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                          onClick={() => track("external-link", { destination: "wiki" })}
                        >
                          <BookText className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("header.nav.wiki")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://github.com/PirateSeal/vs-alloy-calculator"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("header.nav.github")}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                          onClick={() => track("external-link", { destination: "github" })}
                        >
                          <GitFork className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("header.nav.github")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleShare}
                          aria-label={t(copied ? "header.share.copied" : "header.share.copy")}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Link className="h-5 w-5" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t(copied ? "header.share.copied" : "header.share.copy")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label={t("header.locale.label")}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-3 transition-all hover:bg-accent hover:text-accent-foreground"
                        >
                          <Languages className="h-4 w-4" />
                          <img
                            src={activeLocale.flagSrc}
                            alt={activeLocale.label}
                            className="h-4 w-6 rounded-sm object-cover"
                          />
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {LOCALE_OPTIONS.map((loc) => (
                          <DropdownMenuItem
                            key={loc.id}
                            onClick={() => { setLocale(loc.id); track("locale-changed", { locale: loc.id }); }}
                            className={locale === loc.id ? "bg-accent" : ""}
                          >
                            <img
                              src={loc.flagSrc}
                              alt={loc.label}
                              className="h-4 w-6 rounded-sm object-cover"
                            />
                            <span>{loc.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </NavigationMenuItem>

                  <NavigationMenuItem className="flex items-center">
                    <ThemeToggle />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
}
