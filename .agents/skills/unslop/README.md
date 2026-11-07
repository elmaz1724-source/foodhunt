# Unslop – project-local Codex skill

Source: [heydamir/unslop](https://github.com/heydamir/unslop/tree/main/skills/unslop)
by **Damir Sokolovsky** ([@heydamir](https://x.com/heydamir)).

The skill and its text references/scripts are copied from the upstream source
under **CC BY 4.0**. The original license is included in `LICENSE`.
The upstream media references (`references/refs/`), including examples and
story video frames, are **not vendored**; inspect the original repository when
a step references them. Full visual/story workflows also require Playwright,
Chromium and optionally ffmpeg, as described upstream.

## Use with Codex

In the project root, ask:

```
$unslop FOODHUNT's mobile home, restaurant cards and Food Radar.
Preserve all data, features and localStorage keys.
Keep the warm, soft food-discovery identity.
Check 360px, 390px and desktop layouts before committing.
```

Read `AGENTS.md` and `docs/FOODHUNT_UNSLOP_AUDIT.md` for the project-specific
direction and invariants.

This skill audits and edits UI code; it is **not** a runtime package and will
not improve app performance merely by being present in the repository.
