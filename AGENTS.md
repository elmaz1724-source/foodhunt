# FOODHUNT repository notes

## Product

FOODHUNT helps people choose nearby restaurants and remember the best dishes
from past visits. It is a discovery app and a personal food journal, not a
delivery service.

## Design changes / Unslop

For requests to polish, simplify or redesign the UI:

1. Read `.agents/skills/unslop/SKILL.md` and
   `docs/FOODHUNT_UNSLOP_AUDIT.md`.
2. Look at current HTML/CSS/JS and take screenshots when a browser is available.
3. Preserve the brand's welcoming, warm, soft food-app style. One main
   photographic food moment in the hero; calm navigation and honest data.
4. Prefer consistent spacing, restrained accent, sentence-case labels, few
   purposeful actions, accessible focus styles, no decorative glow or fake data.
5. Keep personal review ratings separate from unreviewed external OSM results.
6. Do not invent opening hours, distances, rankings or user/community ratings.
7. Preserve existing restaurant IDs, product reviews, ratings, coordinates,
   favorites, backup/import and browser localStorage keys.
8. Test JavaScript syntax, UI selectors, the 360/390px layouts and reduced-motion.
9. Increase the service-worker cache version when changing shipped assets.

The upstream Unslop skill is by **Damir Sokolovsky** (CC BY 4.0):
https://github.com/heydamir/unslop

## Architecture

The live website uses `index.html`, `app.js`, `v7.js`–`v10.js`, theme and
versioned CSS. The `flutter_mobile/` folder is a separate **design starter**
and does not currently share users' stored web data. Do not claim native data
sync or an installed mobile app until those features exist and have been tested.

## Data caution

FOODHUNT currently persists browser data under
`foodhunt-spots-v1` and `foodhunt-categories-v1`. Never clear or migrate
them silently.

## Emil Kowalski skills (project-local, Codex)

All **18** upstream skills from
`https://github.com/emilkowalski/skills` are vendored under
`.agents/skills/<skill-name>/SKILL.md`, together with their companion
`RECIPES.md`, `AUDIT.md`, `STANDARDS.md`, `CATALOG.md`, `PICKER.md`,
`API.md` and `PLAN-TEMPLATE.md` files where upstream supplies them.

Upstream README: `docs/skills/emilkowalski-README.md`.
Quick references: `docs/skills/ui-cheatsheet.md` and
`docs/skills/performance-cheatsheet.md`.
Source license: `.agents/skills/emilkowalski-LICENSE` (MIT).
Project audit and test limitations: `docs/FOODHUNT_EMIL_SKILLS_AUDIT.md`.

**Routing by task, NOT all skills at once:**

| Trigger / task | Primary skill | Optional supporting skill |
| --- | --- | --- |
| General UI review, hierarchy, copy, polish | `emil-design-eng` | Existing `unslop` for slop-specific reviews |
| iPhone/PWA touch, viewport, input, safe areas | `mobile-native` | `apple-design` for interaction principles |
| Build a purposeful CSS/JS animation | `animate` | `choreograph` for multi-element sequences |
| Review current motion | `review-animations` | `remove-animations` when motion is excessive |
| Investigate slow/stuttering animation | `animation-performance` | `improve-animations` for an actionable audit |
| Find useful missing microinteractions | `find-animation-opportunities` | `animation-vocabulary` for precise direction |
| Plan animation improvements across screens | `improve-animations` | `review-animations` |
| Validate empty, narrow, long, adversarial content | `break-ui` | `mobile-native` |
| Explore multiple interface approaches | `prototype` | `emil-design-eng` |
| Choose a third-party UI dependency | `pick-ui-library` | `ask-sonner` only if Sonner is actually used |
| Native iOS Swift implementation | `write-swift` | `apple-design` |
| React Native / Expo motion | `animate-expo` | Only if the project adopts Expo, not for Flutter |

**Important:** FOODHUNT Web is HTML/CSS/vanilla JS; Flutter Mobile is
currently a separate starter, *not* an Expo/React Native or Swift app.
Do not force the React/Expo/Swift/Sonner-specific skills onto the current stack.
The techniques in other skills can guide Flutter but their code snippets
are not directly usable as Dart.

### Workflow for UI changes

1. Audit the affected screen first; choose one or two relevant skills.
   Preserve the existing warm, soft, calm FOODHUNT aesthetic.
2. Decide whether motion has a functional purpose. Prefer instant feedback
   and brief transform/opacity transitions over decorative animation.
3. Respect touch/no-hover input, 16px iOS focus controls, visible keyboard
   focus, safe areas, reduced motion and 44px+ primary touch targets.
4. Test worst-case long restaurant/dish names and empty results before release.
5. Do not remove or change saved restaurant/review/favorite data, localStorage
   keys, radar coordinates, filters, backup behavior, or product-scoring logic.
6. Validate JS syntax, selector bindings and source references; where feasible
   run Playwright at 360/390/desktop widths and manually check an actual iPhone.
   **Never claim actual device validation when not performed.**
7. Bump the service worker cache version for changes to shipped web assets.
8. Document which skills were used, what changed and what remains untested.

Installing a skill in this repository makes its files available to Codex
**when Codex runs with this repository as its workspace**. It does not
permanently train ChatGPT or activate the skills in unrelated projects.

## Familiar mobile navigation — Jakob's Law (V15)

When working on the FOODHUNT navigation, preserve the familiar mobile mental
model without cloning Instagram, TikTok, YouTube or delivery-service trade dress:

- **Home** leftmost, **Entdecken** second, **Radar** fourth, **Profil** rightmost.
- A prominent **Eintragen (+)** action sits in the middle, but is **not a tab**.
  On iOS, tabs should represent navigation; compose/create is an action.
- Personal **Rankings**, **Getestet**, **Favoriten**, light/dark theme and backup
  stay accessible from the `profileSection` hub. The 'Profil' area is currently
  **local only**; it does not imply a live account.
- Keep 44px+ interactive targets, readable icon labels, accessible `aria-current`
  and visible keyboard focus. Use `mobile-native`, `emil-design-eng`, and
  `break-ui` selectively for mobile navigation work.
- Tab/section changes use `history.pushState`; `popstate` restores the prior
  section so browser Back/edge gestures work. Do not invent gesture recognition
  which conflicts with platform back or maps.
- Do **not** install custom pull-to-refresh handlers unless testing proves native
  browser behavior unsuitable; Safari/PWA behavior differs by environment.
- Preserve desktop links and existing views, including Rankings/Getestet,
  all saved data, manual spot creation, map providers and import/export.
- Keep the Flutter starter's eventual navigation consistent when building actual
  native screens. Do not introduce inert or fake saved-data controls.

Reference: Nielsen Norman Group's Jakob's Law explanation, and Apple HIG tab
bar guidance. The five patterns circulating on social media are not formal
five rules from Jakob's Law. Details: `docs/FOODHUNT_NAVIGATION_V15.md`.

## Google Maps in FOODHUNT Radar — V17

Use the official **Google Maps Embed API** in `google-radar.js` for
Google's search map; retain the FOODHUNT/Leaflet map as the fallback.
A Google Cloud project, billing account and a restricted **Maps Embed API**
browser key are required for in-app embedding. Do not invent or hardcode
credentials into this public repository.

The in-app Google map is a **Google-owned iframe**. Never scrape Google
listings, ratings, photos or reviews from it; never label them as FOODHUNT
community scores. The custom FOODHUNT ratings and OSM cards are separate.
For EEA billing accounts after 2025-07-08, the usual Places API content
must not be freely displayed with any map; use the official Places UI Kit
for future interactive Google listings instead of manually copying data.
Google's free Maps Embed SKU does not eliminate billing/project setup.

`google-radar.js` accepts a locally stored, appropriately restricted browser
key for the user's *own test device*. For production, provide a
referrer-restricted project key through a managed deployment configuration.
Never commit unrestricted keys or Google content to source.
Without a valid key, show the setup instructions and retain the working
existing map plus a no-key external Google Maps search URL.

Test the provider switch, manual/GPS location, category/zoom, key
save/delete, no unwanted Overpass calls in Google mode, and the OSM fallback.
The Google iframe cannot be programmatically inspected for third-party
place data or guaranteed to report billing/auth failures via onload.
Read `docs/FOODHUNT_GOOGLE_RADAR_V17.md` before modifications.

## Unified UI/UX workflow — V18 (2026-11-08)

**Scope:** FOODHUNT production is still vanilla HTML/CSS/JavaScript on GitHub
Pages; Flutter under `flutter_mobile/` is a separate, unfinished starter.
Preserve all restaurant IDs, stored user scores, per-dish reviews, favorites,
map provenance, backup formats, localStorage keys and the existing mobile
navigation. No uncontrolled migration or runtime dependency changes.

### Installed, project-local Codex skills

- `frontend-design`: Anthropic's distinctive visual direction and
  typography choices (Apache-2.0).
- `web-design-guidelines`: Vercel's accessibility, forms, performance,
  navigation and motion audit; it must fetch the current upstream checklist
  before review. A dated offline snapshot lives at
  `docs/skills/vercel-web-guidelines-snapshot.md` (not a substitute when
  internet is available).
- `ui-ux-pro-max`: NextLevelBuilder's search-driven UX/typography/style
  reference with Python scripts and local data (MIT). It suggests options;
  FOODHUNT's established soft-discovery identity always takes precedence.
- `gestures`: Emil Kowalski's new touch/swipe motion skill; only apply to
  intentional new gestures, not Safari's native Back or map panning.
- Emil's previous 17 skills and `unslop` remain installed.

**Choose a narrow skill set based on the task**:

| Work | Preferred skills | Explicit non-goal |
| --- | --- | --- |
| Overall brand, hierarchy, visual design | `frontend-design` + `emil-design-eng` | Generic templates, borrowed delivery branding |
| Design tokens, typography, visual alternatives | `ui-ux-pro-max` + `frontend-design` | Automatically imposing suggested palettes |
| Accessibility, responsive QA, browser audit | `web-design-guidelines` + `break-ui` | Claiming an audit without browser evidence |
| Mobile PWA input, keyboard, touch and safe areas | `mobile-native` + `break-ui` | Native-only gestures without an alternative |
| Performance, jank and interaction motion | `animation-performance`, optionally `review-animations` | Installing animation packages preemptively |
| Deliberate drag/sheet gestures | `gestures` + `pick-ui-library` | Overriding system Back/pull-to-refresh |
| Detect unneeded decoration | `unslop` | Removing meaningful food imagery/content |
| React/Next migration, **only if adopted** | Vercel `react-best-practices` | Applying React rules to vanilla JS or Flutter |

### Components, not Codex skills

- shadcn/ui: React-oriented, Tailwind-compatible source components;
  do not install into the current vanilla web app.
- Magic UI: largely React/Tailwind motion components; optional only for
  a demonstrated need after a stack change.
- Motion Primitives: React + Motion + Tailwind primitives, currently beta;
  avoid introducing it for cosmetic effects.

Use official source guidance for reference, never commit a dependency only
because a demo looks polished. Document license and bundle/performance impact
before proposing integration.

### Repeatable quality gate

1. Review `docs/FOODHUNT_UI_WORKFLOW_V18.md` and existing design decisions.
2. Identify top user-facing friction and prioritize accessibility, search,
   touch targets, perceived speed, content clarity and honest data first.
3. For Vercel review fetch the latest guidelines:
   `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`.
4. Check 360, 390 and 1440px widths with browser runtime when available,
   dark/light, search, modal/focus, provider selector and local saved data.
5. Confirm reduced motion and keyboard focus; never hide platform focus rings
   without replacement. Respect native Safari gestures.
6. Avoid `transition: all`, layout-changing animation and low-contrast
   placeholder-only forms; prefer short transform/opacity feedback.
7. Run `tests/ui-quality-smoke.mjs` and existing Radar smoke tests in
   GitHub Actions, inspect failures, then fix and re-test.
8. Bump service-worker cache when shipping assets. Document partial coverage:
   Chromium emulation is **not** real iPhone Safari/VoiceOver verification.

Manual installation through the connected GitHub API is project-local.
It is **not** proof that `npx skills` or `uipro init --ai codex` ran on the
user's own device. See the install/audit report for details.
