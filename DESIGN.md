---
# Design Tokens (YAML Frontmatter)
colors:
  primary:
    base: "#E08E45"   # Warm Forge Orange/Amber
    hover: "#F2A65A"
    contrast: "#181412"
  background:
    dark: "#181412"    # Deep Charcoal/Soat
    darker: "#120F0D"  # Near-black for deep surfaces
  surface:
    card: "#26211E"    # Lighter charcoal for UI elements
    border: "#3D3530"  # Subtle separation
    hover: "#342C28"
  text:
    primary: "#EDE9E6"   # Soft white/parchment
    secondary: "#B5A89D" # Muted stone
    accent: "#E08E45"    # Highlight orange
  metals:
    copper: "#B87333"
    tin: "#A5A9B4"
    zinc: "#CBD5E0"
    bismuth: "#D1C4E9"
    silver: "#E2E8F0"
    gold: "#FFD700"

typography:
  font-family:
    base: "'Inter', system-ui, sans-serif"
    mono: "'JetBrains Mono', monospace"
  font-size:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    h1: "2.5rem"
  font-weight:
    normal: 400
    medium: 500
    semibold: 600
    bold: 700

spacing:
  unit: 4px
  scale:
    xs: "0.5rem"
    sm: "0.75rem"
    md: "1rem"
    lg: "1.5rem"
    xl: "2rem"

radii:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"

shadows:
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
  card: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)"

motion:
  duration:
    fast: "100ms"
    base: "200ms"
  curve:
    ease: "cubic-bezier(0.4, 0, 0.2, 1)"
---

# Design System: Vintage Story Alloy Calculator

## Design Intent & Philosophy
The **Vintage Story Alloy Calculator** is a precision utility for the game *Vintage Story*. The visual identity is "Industrial Survivalist"—it evokes the feeling of a high-tech tool built from low-tech materials. It is designed to be used in low-light environments (gaming sessions) with high legibility and a focused, non-distracting interface.

### Core Visual Principles
1. **Dark Forge Aesthetic:** The UI lives in a dark, warm-neutral space. Backgrounds aren't pure black but deep "sooty" charcoals, creating a comfortable environment for long gaming sessions.
2. **Actionable Warmth:** The primary action color is a warm amber/orange, reminiscent of glowing coals or molten metal. This provides a clear visual hierarchy for buttons and interactive elements.
3. **Information Density with Clarity:** Metal mixing requires seeing many numbers at once. The design uses clean typography (Inter) and structured cards to manage this density without overwhelming the user.
4. **Subtle Materiality:** While the UI is flat and modern, the choice of colors (Charcoal, Stone, Amber, Copper) creates a psychological link to blacksmithing and metallurgy.

## Components & Language

### Surfaces & Navigation
*   **The Sidebar:** A grounded, dark-mode navigation area that categorizes tools (Metallurgy, Leatherwork). It uses subtle active states to show the user's current "domain."
*   **Module Cards:** Each tool or section is housed in a rounded card (#26211E) with a subtle border (#3D3530). This creates a sense of "physical modules" within the app.

### Metallurgy UI
*   **Crucible Planning:** Mixing inputs are grouped logically. The use of "JetBrains Mono" for numerical values ensures that columns of numbers align perfectly for easy comparison.
*   **Composition Bars:** Visual indicators of metal ratios use a color-coded system that mimics the appearance of the actual ores in-game.

### Typography
*   **Headers:** Bold, confident Inter headers for clear section identification.
*   **Data Labels:** Smaller, secondary text for metadata to keep the primary focus on the calculated results.

## Accessibility & Performance
*   **Dark-First Design:** Optimized for low eye strain.
*   **Responsive Layout:** The design scales from desktop "sidebar + content" view to a single-column mobile view while maintaining all functional density.
*   **Interactive Feedback:** Hover states on cards and buttons provide immediate, high-contrast feedback.
