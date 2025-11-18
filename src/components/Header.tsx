import { Calculator, BookOpen, BookText, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
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
  return (
    <header className="bg-card border-b" role="banner">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/gamelogo-vintagestory-square.webp"
              alt="Vintage Story Logo"
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold">Vintage Story Alloy Calculator</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Calculate valid alloy compositions for your crucible. Alloy data
                sourced from the Vintage Story Wiki.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      onClick={() => onTabChange("calculator")}
                      className={`group inline-flex h-11 w-max items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold transition-all cursor-pointer border-2 ${
                        activeTab === "calculator"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                      }`}
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculator
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      onClick={() => onTabChange("reference")}
                      className={`group inline-flex h-11 w-max items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold transition-all cursor-pointer border-2 ${
                        activeTab === "reference"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                      }`}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Reference
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://www.vintagestory.at"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Visit Vintage Story website"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all p-1.5"
                        >
                          <img
                            src="/gamelogo-vintagestory-square.webp"
                            alt="Vintage Story"
                            className="h-full w-full object-contain"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vintage Story Website</p>
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
                          aria-label="Visit Vintage Story wiki"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          <BookText className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vintage Story Wiki</p>
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
                          aria-label="View project on GitHub"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on GitHub</p>
                      </TooltipContent>
                    </Tooltip>
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
