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

All **17** upstream skills from
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
