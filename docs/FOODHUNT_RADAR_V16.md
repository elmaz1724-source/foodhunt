# FOODHUNT V16 — Radar reliability investigation and fixes

Date: 2026-11-07

## User report

The user reported the map and nearby restaurants still didn't work
reliably on their phone.

## Confirmed source-level failure modes in V15

1. A **single Overpass server** (overpass-api.de) was the only source of
   discovered restaurants. A 429/503, CORS issue, or a timeout left the list
   empty even when restaurants existed.
2. The Leaflet runtime was downloaded **only from unpkg**. A blocked CDN left
   the entire map unavailable, even when the app itself loaded.
3. Tile-load errors were not surfaced; the map could appear empty or gray
   without any useful explanation.
4. Restaurant address lookup used a hard-coded `Hamburg` fallback, so users
   in other cities could receive unrelated search results.
5. After location-denied/geolocation timeout there was no alternative
   location input. Users had to change browser permissions to explore.
6. Radius changes during an in-progress Overpass query did not always trigger
   a new request. The old request could finish and leave results incomplete
   for the selected radius.
7. The main radar list and map do not contain public/community ratings, only
   the user's own private ratings and unrated OSM POIs.

These are issues confirmed by inspecting the code, **not** proof of a
particular device's failure. Public Overpass availability varies and
Geolocation accuracy/permissions are browser-specific.

## V16 fixes

- Overpass request to the primary public server with a sequential fallback
  to Private.coffee's public Overpass service if the first errors.
- Bounded per-endpoint timeout (~12.5 s), cancellation of stale requests,
  30-second cooldown on repeated failures, and protection from old responses.
- Keep existing list visible when a provider fails. Cache a successful
  response for 15 minutes only in memory and within the prior neighborhood.
- Prefer Leaflet 1.9.4 from jsDelivr, then retry via unpkg. Provide the same
  fallback for its CSS, and invalidate the map size once fallback CSS loads.
- Surface repeated OSM tile errors with a non-blocking warning and an external
  OpenStreetMap link. Error overlay includes a usable external map when the
  library itself cannot load.
- Add a **manual city/postcode input** using Nominatim; no GPS permission is
  needed to search a different city. Search is button-triggered (no live
  autocomplete) and throttled for public-service fairness.
- Remove the hard-coded Hamburg hint from geocoding and bias manual spot
  geocoding toward the area selected in Radar, without constraining a user
  to a single country or city.
- Make map markers scroll their matching results into view, with clear rating
  provenance and responsive text.
- Explain approximate GPS accuracy, public data provenance, and 5 km cap
  for public Overpass discovery.

## Test strategy

`tests/radar-smoke.mjs` uses headless Chromium/Playwright, as part of
`.github/workflows/radar-smoke.yml`.

The tests **mock the GPS coordinates, OSM restaurant data and map tiles**.
They check that:
- mobile page loads with no uncaught errors
- the first Overpass provider returning 503 triggers the fallback
- nearby restaurants appear as list entries and Leaflet pins
- adding an external place keeps it in localStorage
- a second mobile viewport can search by city without GPS
- no fictitious community ratings are shown

The map library is loaded from the official Leaflet npm package for
deterministic browser integration testing. This **does not verify** that the
real public Overpass servers, OSM tile server, or either CDN are reachable
from a user's specific phone. Such services have no SLA.

## Privacy and technical constraints

- The app sends coordinates to public Overpass providers **only after**
  location permission or a deliberate manual location search.
- GPS coordinates are not stored in FOODHUNT localStorage. Locally confirmed
  restaurant coordinates and personal ratings continue to be stored.
- The manual city lookup sends the query to public Nominatim; it does not
  request user geolocation.
- No API key or paid data provider was added.
- Public Overpass/Nominatim/tile services are acceptable for a low-volume
  prototype but should be replaced by a permissioned, monitored backend
  for a worldwide production rollout.

References:
- Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- Private.coffee Overpass: https://overpass.private.coffee/
- Leaflet download/SRI: https://leafletjs.com/download.html
- OSM tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/

## Remaining issues

- Real iOS Safari/PWA permission flows and gesture handling need device QA.
- OSM coverage varies by country and even neighborhood; not all local
  restaurants will have a name/category in OSM.
- 5 km is the cap for public discovery at this stage even if a larger
  radius is chosen. Own geolocated restaurants can still be shown at
  larger distances.
- No public user ratings, live hours, or universal photos are claimed.
- When the product scales, move query orchestration, provider reliability,
  caching, and monitoring into a controlled backend.
