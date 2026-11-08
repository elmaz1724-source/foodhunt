# FOODHUNT V17 — Google Maps im Radar

Date: 2026-11-08

## Goal

Let FOODHUNT users explore nearby food using **Google Maps** now, without
breaking their existing reviews or the original OpenStreetMap experience.

The integration is deliberately split into two modes:

1. **Google Maps external search (no API key):** Always available via the
   "In Google Maps öffnen" link. A search URL is built from the location
   the user opted to share or selected manually. This opens Google's app
   or website and shows its own listings.
2. **Google Maps embedded search (API key required):** When activated, the
   official **Maps Embed API**, `/maps/embed/v1/search`, displays Google's own
   restaurant search *inside* FOODHUNT. Google controls the contents of the
   iframe, including map attribution, reviews and listings. We do not
   parse, store, rank or copy them into FOODHUNT.
3. **FOODHUNT-Karte:** The existing Leaflet/OSM map, stored private reviews,
   OSM discovery and manually confirmed restaurant pins remain intact
   as a separate mode and fallback.

The initial map mode stays FOODHUNT-Karte **until a valid-looking browser API
key has been configured**. Once the user has configured a key and selected
Google, their local preference is remembered.

## Required Google Cloud setup

A billing-enabled project and a Maps Embed API browser key are **required**
to show Google's in-app map. Google explicitly documents the Embed SKU as
free with unlimited usage, but an active billing account is still needed.

1. Visit https://console.cloud.google.com/ and create/select a project.
2. Associate a billing account and enable **Maps Embed API**.
3. In **Google Maps Platform > Credentials**, create a browser API key.
4. Set **Application restrictions: Websites (HTTP referrers)** and allow
   `https://elmaz1724-source.github.io/*` (plus localhost only for
   private development as necessary).
5. Set **API restrictions: Maps Embed API only**. Do **not** give the key
   unrestricted access to unrelated billable APIs.
6. Set quotas/budget alerts where the project supports them. Embed usage is
   free under current published pricing, but other enabled Google APIs may
   incur charges.
7. Open FOODHUNT > Radar > Google Maps, enter the **restricted browser key**,
   and press "Google Maps aktivieren". Choose or share a location.

**Do not paste any secret credentials into ChatGPT or commit unrestricted
keys to a public GitHub repository.** This temporary prototype stores a
browser-restricted key only in that browser's localStorage:
`foodhunt-google-embed-key-v1`. A JavaScript/browser key is visible to the
browser and to Google network requests; it is **not a server-side secret**.
The user can remove the key from the Google Maps settings button.
For a multi-user production site, configure a restricted key via managed
deployment instead of making each user enter one.

The code also accepts an optional deployment-time
`window.FOODHUNT_GOOGLE_MAPS_EMBED_KEY` property. No production key is
included in this commit and no secret deployment is implied.

## Important distinction: Google Maps vs. Google Places API

The embedded Google map can display Google's native place results, but our
custom FOODHUNT side panel has no programmatic access to those results.
Google's own UI renders them; they are **not** the OSM data source and cannot
be injected into FOODHUNT's existing local rankings.

For projects with EEA billing accounts created or materially modified after
8 July 2025, Google's **Places API (New/Legacy)** has restrictions on
displaying Places content with any map. Google's **Places UI Kit** is the
official route for rendering Google Places listings alongside a map.
Do not copy Places API data into a custom map/list without reviewing the
EEA terms first.

We deliberately use **Maps Embed API search mode** for this first test,
without custom Google Places result parsing. This is cheaper and simpler
than Maps JavaScript API + Places UI Kit but is less customizable.

## UX, technical details and limits

- The provider selector offers **FOODHUNT-Karte** or **Google Maps**.
- Without a key, selecting Google shows a setup panel, not a broken iframe.
- The Google search external link works with *no API key* and opens Google's
  own map/results in a new tab or app.
- The Google iframe is loaded **only after a user-selected location**;
  not during initial homepage load. Location can come from opt-in GPS or
  the existing city/postcode search.
- The search term reflects FOODHUNT's cuisine selection. Zoom approximates
  the selected radius; **Google Embed does not guarantee an exact radius
  boundary or the same sorting as FOODHUNT**.
- Google mode hides FOODHUNT's independent OSM result panel. This avoids
  implying that Google results and FOODHUNT's private scores come from the
  same source. Switching back restores it.
- Google may show ads or Google-provided ratings inside the iframe.
  FOODHUNT neither controls nor copies these.
- An iframe load event cannot reliably verify Google API key authorization.
  If Google displays an error, review billing, API restrictions and referrers.
- By opening Google, the browser makes a request to Google with the selected
  search location. We do not store user GPS coordinates in FOODHUNT.
- The fallback map depends on the original public OSM/Overpass services and
  inherits their known availability limits.

## Tests

`tests/google-radar-smoke.mjs` uses Chromium/Playwright with **mocked**
Google Maps Embed responses and GPS. The test verifies:

- No Google iframe request until a suitable browser key and user position
- Invalid keys rejected in the setup form
- Key stored locally (not in source) and removable
- Search iframe URL and referrer settings
- Category and zoom changes
- No Overpass lookup while the Google map is active
- Switching back to FOODHUNT map resumes the original POI discovery
- No uncaught runtime errors

These tests cannot prove that a real Google Maps API key works from the user's
iPhone; a real restricted key and billing-enabled Google Cloud project are
still required to complete end-to-end verification.

## Authoritative references

- Maps Embed API search mode:
  https://developers.google.com/maps/documentation/embed/embedding-map
- Maps Embed API setup and billing:
  https://developers.google.com/maps/documentation/embed/quickstart
- API key restrictions:
  https://developers.google.com/maps/documentation/embed/get-api-key
- EEA Places API restrictions:
  https://developers.google.com/maps/comms/eea/places
- Places UI Kit search:
  https://developers.google.com/maps/documentation/javascript/places-ui-kit/place-search
