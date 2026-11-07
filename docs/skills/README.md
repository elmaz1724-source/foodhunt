# Codex design & animation skills

Source: [Emil Kowalski's Skills for Designers and Engineers](https://github.com/emilkowalski/skills), **MIT licensed**.

Project-local skill entry points:
`.agents/skills/<skill-name>/SKILL.md`.

All **17** installed skill directories:

| Skill | When to use in FOODHUNT |
| --- | --- |
| `emil-design-eng` | UI visual hierarchy, spacing, typography, microdetails |
| `mobile-native` | iPhone PWA touch, keyboard, viewport and safe areas |
| `break-ui` | Responsive extremes, long text, empty states, keyboard |
| `animation-performance` | Jank diagnosis, GPU-safe properties |
| `review-animations` | Review existing CSS/JS motion |
| `improve-animations` | Prioritize and plan animations cleanup |
| `remove-animations` | Remove excessive/repetitive motion |
| `find-animation-opportunities` | Suggest genuinely useful animation (read-only) |
| `animate` | Design/implement one purposeful animation |
| `choreograph` | Coordinate multiple animated elements |
| `animation-vocabulary` | Describe motion precisely in reviews |
| `apple-design` | Interaction principles for Apple-like fluidity |
| `prototype` | Compare multiple UI approaches |
| `pick-ui-library` | Decide if a dependency is justified |
| `ask-sonner` | Only when integrating Sonner (not current web app) |
| `animate-expo` | Only for React Native/Expo work (not Flutter) |
| `write-swift` | Only if implementing native Swift (not Flutter) |

Additional skill-specific files from upstream are included alongside
the entry points in the matching folders.

Resources:

- [UI cheatsheet](ui-cheatsheet.md)
- [Performance cheatsheet](performance-cheatsheet.md)
- [Upstream README snapshot](emilkowalski-README.md)
- [Project audit and installation log](../FOODHUNT_EMIL_SKILLS_AUDIT.md)
- [Project agent instructions](../../AGENTS.md)

The official `npx skills@latest` installation was attempted but failed
in this runtime due unavailable DNS for `registry.npmjs.org`
(`getaddrinfo EAI_AGAIN`). The files were instead manually installed
project-locally via the connected GitHub API. This is **not** a global
Codex skill installation or a change to the ChatGPT model.

Prefer the **smallest relevant selection of skills** for each task.
Preserve live data and test on physical devices before claiming
hardware-specific success.
