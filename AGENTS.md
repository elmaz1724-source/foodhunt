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
