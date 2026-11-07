# FOODHUNT V13 — Unslop review

**Review scope:** GitHub source audit of V12's homepage, mobile navigation,
category cards, ranking cards, spot cards, Radar and review modal. This is
a code-level audit. A current browser/device screenshot comparison was not
available during the V13 change and must still be done on real devices.

**Method:** adapted from [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop),
licensed **CC BY 4.0**.

## Direction

- **Product:** FOODHUNT helps friends and individuals find a worthwhile
  restaurant nearby and remember its best dishes.
- **Character:** welcoming, confident, unhurried.
- **World:** neighborhood restaurants, real meals, a familiar table.
- **Moments:** the real burger photograph in the hero; the personal
  Best Bite inside restaurant cards.
- **Signature:** the Best Bite label, a clear connection between restaurant
  rating and the one dish worth returning for.

## Audit and fixes

| Existing issue (V12) | V13 treatment |
|---|---|
| Hero offered three comparable actions | Kept nearby as primary, saved spots as secondary; moved surprise to functional decision strip |
| Headline gradient, radial color washes, decorative shiny effects | Solid typography, restrained neutral surfaces, no decorative glow |
| All-caps tracked meta on cards, sections and status pills | Short sentence-case labels, legible text hierarchy |
| Strong emoji/sparkle decoration in sidebar, header, ranking and cards | Removed interface decoration; retained food-category illustration placeholders as meaningful content |
| Category and spot covers had several decorative rings/orbits | Solid category tones, one recognizable food visual |
| Ranking cards competed with badges and large translucent emoji | Readable rank, restaurant name and score; simple top-rank accent line |
| Too many independent radii and shadow treatments | Small control radius, medium card radius, large panel radius, unified neutral hairlines |
| Generic marketing copy occupied the top screen | Explicit FOODHUNT location decision and a separate surprise action |
| Hover/pop effects competed with content | Tiny press feedback, single short easing, reduced-motion support |
| Multiple color treatments across light/dark | Muted warm-neutral ramps and one coral accent; both themes preserved |

## What is intentionally NOT changed

- Existing section order, navigation and functionality
- The browser storage format and users' actual reviews
- Dish scoring and top-dish selection
- Radar geolocation, OSM provider caveats and manual location confirmation
- External review provenance
- Flutter remains a separate prototype
- Hero uses a preexisting public food photograph; no generated imagery is
  represented as a real restaurant photo

## Follow-up QA

- Open FOODHUNT at 360px and 390px widths, and at desktop width
- Check hero primary/secondary and surprise actions
- Check saved restaurant forms, review sliders, add-product flow
- Check Radar with and without location permission
- Check in light and dark themes, with reduced motion
- Compare against V12; note crop, wrapping, touch target and contrast issues

## Attribution

Design review methodology adapted from **Unslop** by **Damir Sokolovsky**:
https://github.com/heydamir/unslop, under **CC BY 4.0**.
The original skill is included under `.agents/skills/unslop/` with license
and attribution. The visual reference binaries remain upstream.
