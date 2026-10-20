# Session handoff: LinguaFusion production-readiness

Branch: `fix/linguafusion-complete-audit`.

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

## Completed in this session
- Puzzle wrong guesses are persisted per element across reloads, tab switches and skips; retrying cannot count as perfect.
- Save format migrated to version 3 with tutorial dismissal and puzzle-attempt data.
- Revision-checked localStorage writes, storage-event synchronization, conflict messaging and persistence failure messaging were added.
- Tutorial dismissal is distinct from completion; tutorial replay is available in Settings.
- Added combination-grid search/category filters, collection graph search, graph/list collection views, details, viewport persistence and keyboard tab navigation.
- Added visible badge descriptions/progress, explicit icon button labels, modal background inertness, mobile layout improvements and accurate floor-based progress percentages.
- Added regression tests and verified 61 unit tests, lint, typecheck, build, audit, and 12 E2E tests with `/usr/bin/chromium`.

## Open
- Hosting should send CSP as an HTTP response header rather than only a meta tag.
- The maskable icon still reuses the regular 512 px icon without safe-zone padding.
- Multi-tab behavior is conservative: the newest remote snapshot wins and users are warned to use one tab at a time.
