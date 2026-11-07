# FOODHUNT V15 — Familiar Navigation

**Date:** 2026-11-07

## Why

The user shared a TikTok transcript about Jakob's Law and the value of
familiar navigation. The core claim is sound: people transfer learned
interaction patterns from other applications.

Correction: "at most five tabs", "Home on the left", "Profile on the right",
"create in the center", "swipe back", and "pull to refresh" are **not five
official components of Jakob's Law**. They are conventions or product choices.
Apple's tab bar best practices explicitly describe tabs as navigation and not
actions. Android's Material guidance suggests 3–5 navigational destinations.

Sources:
- Nielsen Norman Group: https://www.nngroup.com/articles/end-of-web-design/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Material Navigation: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns

## Design decision

FOODHUNT Mobile Web now displays four destinations and one separate action:

| Mobile position | Control | Effect |
| --- | --- | --- |
| 1 | Home | Personal dashboard and recommendations |
| 2 | Entdecken | Existing browse/search/filter interface |
| 3 | Eintragen (+) | Opens the existing working Spot form; not a tab |
| 4 | Radar | Existing geolocation and OpenStreetMap discovery |
| 5 | Profil | Local personal hub: tested, favorites, rankings, saved list, theme, backup |

The same action is intentionally not duplicated in the mobile top bar.
The top-right control instead opens search/discovery.

**The Profile is not a user account.** The hub explicitly says that reviews
remain local to this device until real accounts and sync are implemented.
The previous Rankings and Getestet views remain fully accessible and functional.
The desktop sidebar keeps its direct shortcuts and gains a personal-hub entry.

## Navigation behavior

- Selected tab uses `aria-current="page"`; secondary views opened through
  Profile retain Profile as the selected tab.
- `history.pushState` remembers destination changes, and `popstate`
  restores previous sections using the browser's native Back navigation.
- Category navigation from another section also creates a history entry.
- The last selected section is restored after a browser reload, where the
  browser persists session history state.
- No artificial touch-swipe recognition or pull-to-refresh overlay is added:
  native browser handling and map gestures remain intact.
- Existing modal dialogs preserve their own focus behavior.

## Smoke tests

Source-level checks:
- All four mobile tab destinations and the middle create action exist.
- Existing DOM element IDs used by map, products, reviews, backup and search
  are preserved; no duplicate IDs.
- JS syntax valid; history Back simulation restores favorites without
  adding duplicate history entries.
- New CSS braces balanced, small-screen layout and reduced-motion rules added.
- Existing localStorage keys unchanged.

**Limitations:** no actual iPhone Safari or native PWA edge-swipe
gesture test was performed. On a real iPhone, test at 360–390px, a
keyboard-open review form, Radar map gestures and back navigation across
Home → Profil → Favoriten. Browser history behavior can differ between
Safari tabs and home-screen PWAs.

## Next candidate

Keep bottom navigation to core destinations when we add real community
profiles. Add account-management options inside the local Profile hub when
authenticated accounts are genuinely implemented. Do not replace the
existing local collection or imply cloud storage until it is functional.
