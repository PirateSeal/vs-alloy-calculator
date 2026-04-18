# UI Redesign Audit

## Findings From The Current Working Tree

The active uncommitted UI pass is substantial, not cosmetic.

### Preserved And Improved

- The app shell has already been reorganized around a desktop left rail and a dedicated result rail.
- Theme tokens in `src/index.css` now follow the charcoal/copper/parchment palette from `ui-improvements/palettes/alchemist_s_crucible/DESIGN.md`.
- Calculator controls were extracted into their own component instead of being embedded inside the result surface.
- The result area now centers the real "Current Product" concept with local crucible imagery and actual calculation output.
- The reference screen was rebuilt into a searchable, filterable, card-style browser that better matches the new shell.

### Risks Found During Audit

- The prior pass removed `CompositionCard.tsx`, which dropped the dedicated composition summary and the old mobile collapse affordance.
- Mobile ordering had drifted away from the plan: preset/optimizer controls were rendered before the crucible inputs instead of after the primary feedback.
- `ResultCard.tsx` had inherited composition logic after the composition card deletion, which made the component broader and left dead code behind.

### Corrections Applied In This Pass

- Restored a dedicated [src/components/CompositionCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/CompositionCard.tsx) for composition totals, stacked bars, and sweet-spot guidance.
- Reordered the calculator view in [src/App.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/App.tsx) so mobile now prioritizes:
- crucible inputs
- result/composition feedback
- preset and optimizer controls
- Simplified [src/components/ResultCard.tsx](C:/Users/tcous/dev/vs-alloy-calculator/src/components/ResultCard.tsx) back to result-focused responsibilities.

## Current Visual Direction

- Desktop: collapsible left rail, wide main workspace, sticky right rail.
- Mobile: compact header, bottom nav, stacked workflow.
- Atmosphere: dark forge surfaces, copper accents, restrained glow, real game imagery only.
- Tone: utility-first; no fake account/session/dashboard language.
