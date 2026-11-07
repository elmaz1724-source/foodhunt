# FOODHUNT — Emil Kowalski skills: install and V14 audit

Date: 2026-11-07  
Source: https://github.com/emilkowalski/skills (main branch at integration time)  
License: MIT (`.agents/skills/emilkowalski-LICENSE`)

## Installation record

The recommended official route was attempted in an isolated temporary working
directory, using:

```bash
npx --yes skills@latest add emilkowalski/skills --skill '*' --agent codex --yes
```

**Result: failed**, because the environment could not resolve
`registry.npmjs.org` (`getaddrinfo EAI_AGAIN`).
It was also unable to resolve `github.com` using direct Git.

**Alternative:** project-local manual installation from the live GitHub
repository via the connected GitHub API. All 17 `SKILL.md` files and their
associated text recipes/references are copied under `.agents/skills/`.
Upstream README and cheatsheets are copied to `docs/skills/`; MIT license
is retained. Verify the committed paths below to confirm Codex can read the
files when the `foodhunt` repository is the workspace. The npm installer
itself was **not** run successfully; this is not an account-wide installation.

Installed 17 skills:

- `animate`, `animate-expo`, `animation-performance`
- `animation-vocabulary`, `apple-design`, `ask-sonner`
- `break-ui`, `choreograph`, `emil-design-eng`
- `find-animation-opportunities`, `improve-animations`
- `mobile-native`, `pick-ui-library`, `prototype`
- `remove-animations`, `review-animations`, `write-swift`

Supporting source files: `RECIPES.md` (animate, animate-expo,
choreograph), `API.md` (ask-sonner), `CATALOG.md` (break-ui),
`AUDIT.md` and `PLAN-TEMPLATE.md` (improve-animations),
`PICKER.md` (prototype), `STANDARDS.md` (review-animations).

Cheatsheets: `docs/skills/ui-cheatsheet.md` and
`docs/skills/performance-cheatsheet.md`.

## Product and design guardrails

FOODHUNT is a soft, warm food-discovery product and private review journal,
with an opt-in location radar. The current web stack is vanilla
HTML/CSS/JavaScript, backed by localStorage and public OpenStreetMap
discovery. No framework rewrite or new dependency is required for V14.
`flutter_mobile/` remains a separate visual starting point, not a working
or synced native app.

## Prioritized improvement plan

| Priority | Problem | Action | Skill | Status |
| --- | --- | --- | --- | --- |
| P0 | iOS zooms on focused editable inputs below 16px | Enforce 16px editable fields on coarse-pointer devices, exempt large rating display and sliders | `mobile-native` | Implemented V14 |
| P0 | Touch can retain desktop hover animations; browser flashes tap highlight | Disable hover lift on nonhover devices; provide immediate press feedback and remove tap flash | `mobile-native`, `emil-design-eng` | Implemented V14 |
| P1 | Modal focus can escape; focus not returned after closing | Focus dialog heading, trap Tab while open, restore opener on close | `apple-design`, `break-ui` | Implemented V14 |
| P1 | Narrow text/cards overflow; some touch targets are too small | Wrap long names; increase product edit, favorite and nav target sizes | `break-ui`, `mobile-native` | Implemented V14 |
| P1 | Search relies on placeholder as accessible label | Explicit accessible search label and search keyboard affordance | `emil-design-eng` | Implemented V14 |
| P1 | Bottom-nav blur layer spends paint/compositing budget | Use solid surface for coarse-pointer nav, keep warm brand look | `animation-performance` | Implemented V14 |
| P2 | 13+ accumulated version CSS files, global cascade overrides | Consolidate into component tokens/styles only after browser visual-regression tests | `emil-design-eng`, `break-ui` | Planned |
| P2 | 93 cards re-created when filtering, potential scaling issue for community | Measure before considering pagination, virtualization or incremental DOM update | `animation-performance` | Planned |
| P2 | Modal/rating/spot flows need real iPhone and accessibility pass | iOS Safari, VoiceOver, keyboard, narrow screens, reduced motion | `mobile-native`, `break-ui` | Needs device |
| P3 | Radar provider can timeout or have sparse OSM coverage | Investigate map data and provider reliability independently from UI polish | `break-ui` | Planned |

## Design and motion review (before / after)

| Before | After | Why |
| --- | --- | --- |
| Inputs with 10–14px mobile text | 16px on coarse-pointer editable controls | Avoid iOS automatic page zoom |
| Touch `:hover` lift sticking after taps | Hover-only behaviour gated by capability and neutral fallback | Avoid phantom selected state |
| Small product edit/delete touch targets | Minimum 40px controls, 44px on primary actions | Fewer missed taps on phones |
| Blur behind mobile nav | Opaque app surface on touch devices | Lower compositing cost |
| Search field with only a placeholder | Explicit accessible label and search keyboard | Better screen-reader naming |
| Dialog opens without keyboard focus management | Focus the title, trap Tab, restore opener | Predictable keyboard navigation |
| Long restaurant/dish names can overflow cards | `overflow-wrap: anywhere` and `min-width:0` where needed | Safer international content |
| No shared rationale for skills | Task-dependent skill routing in `AGENTS.md` | Avoid cargo-cult animation and framework-specific guidance |

## Relevant skills chosen for the first implementation

- `mobile-native`: iOS font zoom, touch-state and safe touch targets
- `emil-design-eng`: minimal press response, readable labels, visual hierarchy
- `animation-performance`: remove unnecessary mobile backdrop blur
- `break-ui`: overflow resistance and dialog keyboard edge cases
- `apple-design`: fast feedback and predictable modal behavior

**Not used** for this pass: Expo/React Native, Swift, Sonner, choreographed
animations or broad animation creation. They are installed for the tasks where
their technology actually applies.

## Smoke checks and limitations

- Syntax-check changed JavaScript and unchanged critical modules.
- Verify unique HTML IDs, original form selectors, cache version and new
  style/script paths.
- Check the repository tree contains 17 skill entry points and companions.
- Check source-level handling of 16px mobile inputs, nonhover fallback,
  reduced motion and visible keyboard focus.
- Verify GitHub Pages workflow; an automated build passing does **not**
  prove iPhone UI/VoiceOver behavior.
- An actual iPhone Safari/VoiceOver test and 360/390px screenshot comparison
  remain required. No live-device or real-network Radar test is claimed.

## Follow-up

Start next iteration with actual iPhone screenshots and a short keyboard
test of Add Spot → product editor → Save → return focus. Then consolidate
the CSS cascade and investigate real measured scroll/input latency.
