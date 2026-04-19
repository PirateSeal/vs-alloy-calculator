const ALLOY_COLORS: Record<string, string> = {
  "tin-bronze": "#CD7F32",
  "bismuth-bronze": "#D4A574",
  "black-bronze": "#3B2F2F",
  brass: "#B5A642",
  molybdochalkos: "#5D6D7E",
  "lead-solder": "#5D6D7E",
  "silver-solder": "#C0C0C0",
  cupronickel: "#8C9A9E",
  electrum: "#E5D68A",
};

const DEFAULT_ALLOY_COLOR = "#B87333";

const WIKI_PAGES: Record<string, string> = {
  "tin-bronze": "Tin_Bronze",
  "bismuth-bronze": "Bismuth_Bronze",
  "black-bronze": "Black_Bronze",
  brass: "Brass",
  molybdochalkos: "Molybdochalkos",
  "lead-solder": "Lead_Solder",
  "silver-solder": "Silver_Solder",
  cupronickel: "Cupronickel",
  electrum: "Electrum",
};

export function getIngotImage(recipeId: string): string {
  return `/metal-images/Ingot-${recipeId.replace(/-/g, "")}.png`;
}

export function getAlloyColor(recipeId: string): string {
  return ALLOY_COLORS[recipeId] ?? DEFAULT_ALLOY_COLOR;
}

export function getWikiUrl(recipeId: string): string {
  return `https://wiki.vintagestory.at/index.php/${WIKI_PAGES[recipeId] ?? recipeId}`;
}
