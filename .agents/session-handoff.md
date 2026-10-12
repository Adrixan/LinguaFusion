# Session handoff: LinguaFusion production-readiness

Branch: `claude/code-review-quality-9ycy0g` (no PR opened yet).

## Done
- Review of the whole app; bugs reproduced in a headless browser, then fixed.
- Self-combination (Feuer + Feuer) now possible; before, 189 of 220 elements were unreachable.
- Game rules moved into a pure reducer (`src/game/state.ts`); pending puzzles are derived from state (discovered but not unlocked) and survive reload.
- Persistence validated (`src/game/save.ts`): corrupt data is backed up under `linguafusion-save-corrupt`; legacy key `alchemie-fusion-save` is read, new key is `linguafusion-save`; import limited to 1 MB with confirmation.
- Badges: 27 left (removed speedster and the two hint badges), all reachable, evaluated in one place; celebrations queued, one at a time.
- Fixes: solved-puzzle counters, replay farming, reset confirmation on the Stats tab, stacked modals, corrupted emoji, leaky hints, umlaut transliteration, feedback for invalid/known combinations, graph no longer reveals recipes.
- Infra: node_modules and dist untracked, deps updated (0 audit findings), fonts self-hosted, CSP on production builds, lazy-loaded graph (initial JS 205 kB vs 472 kB), ESLint with react-hooks, Vitest (56 tests), Playwright (11 tests), GitHub Actions CI.

## Decisions made without asking (revisit if wrong)
- Skip no longer reveals the answer; the element must be found again.
- `hintsUsed` replaced by `mistakes`; hints are always visible, so a hint counter had no meaning.
- Removing node_modules/dist from git: if production is deployed by pulling `dist/` from the repo, switch the deploy to build in CI first.

## Open
- Submodules `.github/copilot-instructions` and `.kilocode/glm5-instructions` are empty in this checkout; `agents.md` is an unfilled template.
- Maskable icon reuses the regular 512 px icon (no safe zone padding).
- Not done: keyboard navigation of the Sammlung graph, multi-tab save conflicts, hosting headers (CSP is a meta tag; a real header is stronger).
