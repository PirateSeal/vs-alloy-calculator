# UI Plan Status

Source plan: `ui-improvements/codex-plan.md`

## Completed Or Effectively Completed

- `01-theme-and-shell`
- Collapsible desktop rail is implemented.
- Mobile bottom navigation is implemented.
- Theme toggle, locale switcher, share action, and real external links are wired into the shell.
- Global tokens now match the alchemist palette direction.

- `02-calculator`
- Calculator controls are separated into a dedicated top control surface.
- Crucible inputs use stronger panel hierarchy and compact slot modules.
- Result rail has a prominent Current Product hero using the local crucible asset.
- Valid/invalid/near-match feedback is text + icon based, not color only.

- `03-reference`
- Reference is no longer a plain table-only screen.
- Search, filter, sorting, notes, wiki links, and composition ranges are preserved.
- Mobile uses stacked cards instead of forcing horizontal overflow.

## Completed In This Pass

- `02-calculator`
- Restored the composition summary as a dedicated right-rail card.
- Restored a mobile-collapsible composition surface.

- `04-mobile-i18n-a11y`
- Reordered mobile calculator flow so inputs come before optimization controls.
- Kept result/composition feedback adjacent to inputs on small screens.

## Validation Notes

- `pnpm lint` and `pnpm type-check` were initially failing on a dead `invalidColor` variable in `ResultCard.tsx`; that issue is now removed.
- `pnpm test` hit a sandbox `spawn EPERM` error while loading Vite/Vitest config. This needs an unrestricted rerun to fully verify test/build status in this environment.

## Remaining Watch Items

- Review translated labels for any newly surfaced English-only microcopy during manual QA.
- Confirm no horizontal overflow at 360px, 390px, and 425px.
- Re-run `pnpm test` and `pnpm run build:prod` outside the sandbox if Vitest/Vite continue to hit Windows process restrictions.
