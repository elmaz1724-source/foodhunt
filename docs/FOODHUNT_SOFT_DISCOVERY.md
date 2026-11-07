# FOODHUNT — Soft Discovery design direction (V12)

## Product promise

FOODHUNT answers **"What should we eat?"** and helps people make an informed
decision quickly, alone or with friends. It is **not a delivery checkout**.
Do not mimic delivery fees, order-time promises or checkout unless those are
implemented with a real provider integration.

## Inspiration and differentiation

Reference principles seen in modern food apps (Wolt, Uber Eats, Lieferando):
- gentle spacing, round touch targets, image-led discovery
- recognizable search and nearby-first navigation
- short, actionable labels and uncluttered filter controls
- friendly motion; deliberate tap affordances

Do **not** copy their layouts, logos, illustrations, color systems, product labels
or trade dress. FOODHUNT retains its own coral/peach and sage accent language,
brand typography and clear distinction between restaurant, dish and personal rating.

## Color tokens

| Role | Light | Dark |
|---|---|---|
| Canvas | `#FAF8F5` | `#17191B` |
| Card | `#FFFFFF` | `#232629` |
| Main text | `#242521` | `#F7F4F1` |
| Accent | `#E78663` | `#F9AB84` |
| Accent soft | `#FFF0E8` | translucent coral |
| Border | `#EAE6DE` | translucent warm gray |

Use **semantic** variables in both web CSS and Flutter, never hardcode a
provider's brand palette.

## Shape, layout and motion

- Pills for quick filters and primary calls-to-action; no sharp corners.
- Large feature surfaces ~28–34px radius; cards ~22–28px; fields ~15–20px.
- Min touch targets 44x44 logical pixels where possible.
- Rhythm: 8 / 12 / 16 / 24 / 32px spaces.
- Gentle 160–220ms scale/opacity transitions. Honor reduced-motion settings.
- Prefer text contrast and visible focus over decorative low-contrast palettes.
- On small mobile widths keep 5 tabs reachable and labels legible.

## Data and trust (non-negotiable)

- Never portray OSM or community POIs as restaurants reviewed by the user.
- Private reviews and public scores are separate data sources.
- Never infer opening hours, delivery fees, distance, GPS or ratings when absent.
- Existing web app stores reviews in browser localStorage. Preserve its keys
  and schema until a supported, backed-up migration is designed.
- Geolocation remains opt-in with purpose-limited use and clear UI copy.
- Ensure multilingual content can be localized later; no city-specific
  promises in universal UI without a known city.

## Future B2B potential

A reusable discovery module could eventually be offered as an API, SDK or
licensed UX module. This requires reliable place data, deduplication, rating
provenance, privacy compliance, merchant/venue identity and stable service
contracts. A soft design alone does not establish a sellable or legally
licensable integration for Wolt, Lieferando or Uber Eats.

## Versions

- V12: Soft Discovery Web UI, and Flutter starter under `flutter_mobile/`.
- Next: shared data contract, verified discovery reliability, native data sync.
