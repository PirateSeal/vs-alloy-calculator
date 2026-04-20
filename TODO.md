# TODO

## Vintage Story 1.22 leather follow-up

Status: pending until `1.22` stable releases.

### Why this is tracked

There is clear `1.22` churn around hide and leather processing, but no clean official announcement of a full leather rework. The safe assumption is that the leather planner should be revalidated against `1.22` stable before any formula or UX changes are shipped.

### Revalidate on 1.22 stable

- Check the official `1.22` stable release notes for hide, pelt, leather, and scraping changes.
- Verify in-game handbook behavior on stable instead of relying on RC/forum speculation.
- Re-check the full leather workflow:
  - soaking inputs
  - scraping behavior
  - weak tannin requirements
  - strong tannin requirements
  - final leather yields
- Confirm whether ground hide scraping is now the intended/default workflow and whether grid scraping still exists.
- Confirm actual outputs for special hides:
  - black bear
  - brown bear
  - polar bear
  - sun bear
  - panda bear
  - boar
  - raccoon
  - fox / arctic fox
- Confirm whether any boar hide sizing changed in `1.22` stable. This was mentioned by players, but was not verified from an official source during research.
- Confirm whether bear hides still produce a single hide in all stages on stable, and whether any per-species size/yield rules changed.
- Update the leather planner logic and tests if any stable values differ from the current implementation.
- Update reference copy / README / release notes if the tool behavior changes because of `1.22`.

### Notes from research on 2026-04-20

- Official sources confirmed `1.22` hide-related changes, including ground scraping and later hide-processing fixes.
- Official sources did not clearly confirm a broad “leather rework” label.
- Community discussion suggests hide-output changes, especially around bear hides, but those reports should not be treated as final until checked against `1.22` stable.

### Reference sources

- `https://www.vintagestory.at/roadmap.html`
- `https://www.vintagestory.at/forums/topic/19590-1220-pre1-fishing-mechanisms-metalworking-and-more/`
- `https://info.vintagestory.at/v1dot22`
- `https://www.vintagestory.at/forums/topic/20220-122s-hide-scraping-talking-about-the-future-of-in-world-crafting/`
- `https://www.vintagestory.at/forums/topic/20661-1220-rc9rc10-and-1217-fishing-mechanisms-metalworking-and-more/`

## Pottery planner feature

Status: requested by users; not started.

### Motivation

Players asked for pottery support because clay costs are deterministic in a way that fits the existing tool direction. Pottery is a good next domain because it has the same core appeal as metallurgy and leatherworking:

- exact material planning
- predictable output counts
- repetitive in-game calculations that are annoying to do by hand
- room for both quick lookup and inventory-based planning

### Product goal

Add a pottery planning tool that lets players answer questions like:

- “How much clay do I need for `N` items?”
- “How many items can I make from my current blue/fire clay stock?”
- “What is the total firing batch for this shopping list?”
- “How many pit kilns or firing cycles will this require?”

### Scope proposal

Start with a deterministic planner/reference rather than a full clayforming simulator.

V1 should cover:

- per-item clay cost
- target quantity planning
- inventory-based maximum craftable count
- grouped totals for mixed item lists
- batch/firing summaries where applicable
- deep-linkable plans through URL state

Avoid in V1:

- simulating each clayforming voxel step
- decorative freeform pottery
- modded recipe support
- advanced world-state assumptions that are not deterministic

### User stories

- As a player, I can choose a pottery item and a quantity and immediately see the total clay required.
- As a player, I can enter my current clay inventory and see the maximum number of selected items I can make.
- As a player, I can build a mixed pottery shopping list and get a combined clay total.
- As a player, I can see the breakdown by clay type if some recipes require specific clay variants.
- As a player, I can share a link to a pottery plan the same way other tool surfaces in the app already support deep linking.

### Suggested feature shape

#### 1. Pottery reference

A browseable reference page for pottery items with:

- item name
- category
- clay required per item
- clay type restrictions
- stack / output notes if relevant
- firing notes if relevant

Categories may include:

- storage
- cooking
- agriculture
- lighting
- molds
- utility / crafting

#### 2. Single-item calculator

Fast calculator flow:

- choose item
- choose quantity
- optionally choose clay type
- show exact clay cost
- show resulting output count
- show any notable crafting or firing constraints

This is the “I just need a quick answer” surface.

#### 3. Mixed-item planner

Planner flow:

- add multiple pottery items to a plan
- set quantity for each line item
- get per-line and total clay cost
- group totals by category
- optionally group totals by clay type
- surface the largest bottleneck items first

This is the “I’m preparing for a building/crafting session” surface.

#### 4. Inventory mode

Inventory-driven flow:

- input available clay amounts by clay type
- choose one or more target items
- compute whether the plan is feasible
- show shortfall or leftover clay
- show max craftable counts from current inventory

### Inputs

Expected inputs:

- selected pottery item(s)
- quantity per item
- available clay inventory
- clay type, when recipes differ by type

Potential future inputs:

- target molds vs containers vs utilities
- desired buffer / extra clay percentage
- firing capacity assumptions

### Outputs

Expected outputs:

- total clay required
- clay required per item
- aggregate totals across the whole plan
- per-clay-type breakdown
- max craftable counts from inventory
- leftover or missing clay after planning
- firing/batch summary where the game rules are deterministic enough to model

### Data model notes

Likely data needed per pottery recipe:

- stable id
- localized name key
- category
- clay cost per crafted item
- output count
- allowed clay types
- whether the item is fired
- optional notes/help text

### UX notes

The pottery surface should follow the same product split already working elsewhere:

- quick calculator for one-off answers
- planner for inventory/shopping-list use
- reference for browse/search behavior

The UI should bias toward:

- exact counts over vague estimates
- low-friction quantity entry
- easy copy/share of plans
- strong mobile usability

### Validation and testing

When implemented:

- add unit tests for pottery recipe totals
- add planner tests for aggregate mixed-item calculations
- add inventory tests for maximum craftable counts and leftovers
- add route/deep-link coverage for pottery plans
- add i18n coverage for pottery labels and copy

### Open questions

- Which pottery items should be in V1?
- Should molds be part of pottery V1 or split into a later sub-feature?
- Do any items have meaningful clay-type restrictions that need first-class UI treatment?
- Is pit kiln / firing-cycle planning deterministic enough to be worth including in V1?
- Should pottery live as its own domain beside metallurgy and leatherwork, or as another planner within a broader crafting domain?

## Blast furnace guide feature

Status: planned; not started.

### Motivation

A blast furnace guide fits the same product niche as the metallurgy and leatherwork tools:

- players need exact resource planning
- the process has multiple steps and failure points
- the in-game rules are easy to forget mid-session
- a guided reference is more useful than a generic wiki read-through

### Product goal

Add a blast furnace guide that helps players understand and plan the full workflow for producing steel-related outputs with less trial and error.

The guide should answer questions like:

- “What do I need before I start a blast furnace run?”
- “How much fuel and ore do I need?”
- “What are the build and operation requirements?”
- “What output should I expect from this run?”
- “What can go wrong if the setup is incorrect?”

### Scope proposal

Start with a guide/planner hybrid rather than a full simulation.

V1 should cover:

- structure requirements
- required inputs and prerequisites
- step-by-step operating flow
- exact or rule-based resource planning where deterministic
- expected outputs
- common mistakes and troubleshooting

Avoid in V1:

- modeling every heat state over time
- deep simulation of all adjacent metallurgy systems
- modded blast furnace variants
- assumptions that depend on hidden in-game randomness unless clearly marked

### User stories

- As a player, I can read a concise build guide for the blast furnace setup.
- As a player, I can enter a target output and see the required materials.
- As a player, I can enter available materials and see what blast furnace runs are possible.
- As a player, I can verify that my structure and workflow are correct before lighting anything.
- As a player, I can quickly diagnose why a blast furnace setup is not working.

### Suggested feature shape

#### 1. Blast furnace reference

A structured guide page with:

- what the blast furnace is used for
- prerequisites before use
- valid structure/build requirements
- required materials
- process summary
- expected outputs
- troubleshooting notes

#### 2. Build checklist

A checklist-oriented surface for players constructing the setup:

- required blocks/materials
- shape/height/rule reminders
- fuel/input prerequisites
- a quick “ready / not ready” summary

This is the “before I start the run” surface.

#### 3. Run planner

A planning surface where users can:

- choose a target output
- input available resources
- see how many runs are possible
- see required fuel and smeltables
- view leftovers or shortfalls

This is the “how much can I make?” surface.

#### 4. Troubleshooting guide

A compact diagnostic section covering common issues such as:

- structure invalid
- wrong materials
- insufficient fuel
- incorrect sequence
- misunderstanding expected outputs

### Inputs

Expected inputs:

- target blast furnace output
- available ore / iron / other required metallurgy inputs
- available fuel
- number of desired runs

Potential future inputs:

- target steel quantity
- partial inventory imported from metallurgy planner
- player-selected assumptions for losses or buffer materials

### Outputs

Expected outputs:

- required materials per run
- total materials for `N` runs
- maximum possible runs from current inventory
- expected output per run
- leftover materials
- build/setup checklist
- troubleshooting hints tied to the selected scenario

### Data model notes

Likely data needed:

- stable ids for blast furnace recipes/guides
- localized names and descriptions
- structure requirements
- per-run material requirements
- fuel requirements
- output counts
- prerequisite notes
- troubleshooting mappings

### UX notes

This feature should be more guide-first than metallurgy calculator-first.

The UI should bias toward:

- clear sequencing
- highly legible checklists
- resource totals that are easy to scan
- prominent warnings for invalid assumptions
- mobile-readable guide sections

The ideal outcome is a player being able to keep the guide open while building or running the furnace and not needing to cross-reference multiple wiki pages.

### Validation and testing

When implemented:

- add unit tests for resource requirement calculations
- add tests for max-run calculations from inventory
- add route/deep-link coverage for saved guide/planner states
- add content tests for required guide sections if the data is structured
- add i18n coverage for guide copy and labels

### Open questions

- Should this ship as a reference-first guide, or with a real planner in V1?
- Which blast furnace recipes/processes are deterministic enough to calculate exactly?
- Should it integrate directly with existing metallurgy inventory/planner state?
- Is there enough value in adding a visual structure diagram in V1?
- Should troubleshooting be static content or rule-driven from planner inputs?
