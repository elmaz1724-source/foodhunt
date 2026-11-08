# FOODHUNT V18 — Professional frontend workflow and audit

Updated 2026-11-08. Production app: **vanilla HTML/CSS/JS GitHub Pages**.
Flutter Mobile is an independent, unfinished starter. No runtime framework
or component package was added.

## Install audit

At the start of this change, the project already contained **17 skills from
Emil Kowalski** and **Unslop**: 18 skill entry points under `.agents/skills/`.
The current upstream Emil repo additionally contains `gestures`.

| Source / skill | Current action | Notes |
| --- | --- | --- |
| Emil Kowalski — 17 existing | Kept | `docs/skills/ui-cheatsheet.md`, performance cheatsheet already vendored |
| Emil Kowalski — `gestures` | **New project-local skill** | Useful only when implementing deliberate touch manipulation |
| Anthropic `frontend-design` | **New project-local skill** | Apache-2.0 license included |
| Vercel `web-design-guidelines` | **New project-local skill** | Requires latest rule fetch per audit; snapshot here for offline use |
| NextLevelBuilder `ui-ux-pro-max` | **New project-local skill** | Includes 47 production files, data, references and Python search scripts (MIT) |
| Vercel `react-best-practices` | **Not installed yet** | React/Next.js only; production FOODHUNT is neither |
| Unslop | Kept | Earlier source integration, separate from the four new skills |

A project-local `SKILL.md` is an instruction package for a Codex session
opened with this repository as its workspace. It **does not** install skills
globally in a Codex account or make ChatGPT permanently learn them.

Official instructions inspected:
- Emil: `npx skills@latest add emilkowalski/skills`
- Anthropic: Claude Code plugin marketplace; for Codex the Agent Skills
  `SKILL.md` folder is manually vendored instead of a Claude plugin install.
- Vercel: `npx skills add vercel-labs/agent-skills`
- NextLevelBuilder: `npm install -g ui-ux-pro-max-cli`, then
  `uipro init --ai codex`.

The environment cannot currently reach npm/github DNS from a local shell
(previous official `npx` attempt failed with `EAI_AGAIN`); **none of
these CLI installs is claimed to have succeeded on the user's own computer**.
This repository installation uses connected GitHub API reads and blob/tree
writes. GitHub Actions validate the committed skill entry points and run
NextLevelBuilder's Python search script to prove usability.

Sources and licenses:
- https://github.com/emilkowalski/skills
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## Component library evaluation

**No component library installed.** The following are *code/UI libraries*, not
required Codex skills.

| Library | Fit today | When to reconsider |
| --- | --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Poor: React-oriented, style-system migration required | React/Tailwind rewrite with tested component needs |
| [Magic UI](https://github.com/magicuidesign/magicui) | Poor: expressive React/Tailwind animation risks too many effects | Specific product storytelling feature with an interaction purpose |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Poor: Motion/Tailwind/React, beta | A measured need for a reusable animated interaction in React |

The Flutter starter would require Flutter-native libraries. Never transplant
React components into the existing vanilla site or Flutter directly.

## Prioritized technical findings

1. **P0 — keyboard access:** no skip-to-content link or focusable main target
   in `index.html`. **Fixed V18** with an accessible skip link and main target.
2. **P0 — search responsiveness:** each character previously rebuilt a list
   of up to 93+ restaurant cards synchronously. **Fixed V18** with a brief
   110ms render debounce; state updates immediately, composition input handled.
3. **P1 — responsive text:** mobile nav labels as small as 9–10px and profile
   descriptions down to 10px. **Improved V18** with careful mobile font rules.
4. **P1 — image stability:** hero image had no intrinsic width/height.
   **Fixed V18** with dimensions and async decoding while keeping the layout
   and existing food photo.
5. **P1 — offscreen card rendering:** full grids always painted. **Improved V18**
   using `content-visibility:auto` on spot cards where supported, with
   estimated intrinsic size to stabilize scroll. Check actual device/browser
   behavior before wider use.
6. **P1 — interactive visibility:** grouped field focus and card focus not
   always obvious against warm surfaces. **Improved V18**.
7. **P2 — CSS cascade:** `style.css` and v3–v18 CSS make the styles difficult
   to maintain. **Planned**: component-level consolidation in a separate
   branch after screenshot/regression tests, not a blind merge.
8. **P2 — provider reliability:** Radar still depends on public OSM/Overpass
   when in FOODHUNT-map mode; Google Embed requires correctly restricted
   cloud key and billing. **Not solved by cosmetic work**.
9. **P2 — user data:** browser-local personal reviews are device-bound.
   **Planned**: consent-based backup/import and backend design before worldwide
   community features, without silent data migration.
10. **P3 — measured optimization:** compare image/font transfer, Lighthouse
   Core Web Vitals, scroll frame time and large-list cost before introducing
   dependencies, virtualization libraries or complex motion.

## Design direction (preserved)

- FOODHUNT solves **"Was essen wir?"**, not food delivery checkout.
- Warm neutral light mode and restrained coral accents; dark mode retained.
- Soft rounded cards but no redundant glowing gradients or micro-decorations.
- Food-specific visual cues, one clear nearby action, category exploration,
  personal best dishes and scores, four mobile navigation destinations plus
  one central Create action.
- Never show fake ratings or misattribute OSM/Google Places content.
- Prefer 8/12/16/24/32 spacing, 44px targets and accessible contrast.
- Use purpose-driven transform/opacity motion and `prefers-reduced-motion`.

## Automated verification

A new `.github/workflows/ui-quality.yml` runs:
- project-local skill file checks
- UI UX Pro Max `search.py` on the installed skill dataset
- real **Chromium desktop 1440px and mobile 390/360px browser smoke tests**
- search/filter/empty state, keyboard skip, central create, profile,
  map-provider selector, dark mode/reduced motion and horizontal overflow
- screenshots as GitHub Actions artifacts

Tests use a desktop Chromium engine with mobile viewports, **not iOS Safari
or Android hardware**. Provider API key/billing/network tests live separately
in `.github/workflows/radar-smoke.yml`.

## Selected guidance applied during V18

- Anthropic `frontend-design`: prioritize the app's actual food decision
  and existing visual identity rather than a cloned template.
- Vercel `web-design-guidelines`: visible skip link, semantic main/focus,
  image dimensions, reduced motion, content-width and input feedback.
- UI UX Pro Max: typography scale, mobile touch, consistent design tokens,
  focus and responsive patterns; data-driven suggestions are optional.
- Emil `mobile-native` / `break-ui`: iOS text legibility, narrow labels,
  oversized/empty text, no sticky hover or gesture conflicts.

The skill files are **not runtime dependencies**; their installation does
not itself make page animations smoother or add load time.
