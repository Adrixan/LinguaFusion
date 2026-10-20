# Session handoff: LinguaFusion production-readiness

Delivery branch: `feat/vocabulary-spaced-review`, based on `main`. Push and required merge back to `main` are the final remaining operational steps.

## Done
- Review of the whole app; bugs reproduced in a headless browser, then fixed.
- Self-combination (Feuer + Feuer) now possible; before, 189 of 220 elements were unreachable.
- Game rules moved into a pure reducer (`src/game/state.ts`); pending puzzles are derived from state (discovered but not unlocked) and survive reload.
- Persistence validated (`src/game/save.ts`): corrupt data is backed up under `linguafusion-save-corrupt`; legacy key `alchemie-fusion-save` is read, new key is `linguafusion-save`; import limited to 1 MB with confirmation.
- Badges: 27 left (removed speedster and the two hint badges), all reachable, evaluated in one place; celebrations queued, one at a time.
- Fixes: solved-puzzle counters, replay farming, reset confirmation on the Stats tab, stacked modals, corrupted emoji, leaky hints, umlaut transliteration, feedback for invalid/known combinations, graph no longer reveals recipes.
- Infra: node_modules and dist untracked, fonts self-hosted, CSP on production builds, lazy-loaded graph, ESLint with react-hooks and GitHub Actions CI. Current verification counts are below.

## Decisions made without asking (revisit if wrong)
- Skip no longer reveals the answer; the element must be found again.
- `hintsUsed` replaced by `mistakes`; hints are always visible, so a hint counter had no meaning.
- Removing node_modules/dist from git: if production is deployed by pulling `dist/` from the repo, switch the deploy to build in CI first.

## Completed in this session
- Puzzle wrong guesses are persisted per element across reloads, tab switches and skips; retrying cannot count as perfect.
- Save format migrated to version 4 with tutorial dismissal, puzzle-attempt data, and vocabulary review schedules.
- Revision-checked localStorage writes, storage-event synchronization, conflict messaging and persistence failure messaging were added.
- Tutorial dismissal is distinct from completion; tutorial replay is available in Settings.
- Added combination-grid search/category filters, collection graph search, graph/list collection views, details, viewport persistence and keyboard tab navigation.
- Added visible badge descriptions/progress, explicit icon button labels, modal background inertness, mobile layout improvements and accurate floor-based progress percentages.
- Added regression tests for persisted mistakes, skipped-puzzle scoring, tutorial dismissal and save revisions.
- Added vocabulary review: recall-first cards, persisted spaced scheduling, review ratings, Austrian grammar metadata, examples, and a dedicated Wiederholen tab.
- Added maskable-safe icon artwork, updated the manifest source, and tightened the supported Node engine range.
- Added local verification instructions to `README.md`.
- Current verification: 67 unit tests, 18 E2E tests with `/usr/bin/chromium`, lint, typecheck, build, audit, and install-script checks all pass.
- The E2E suite now allows service workers and verifies an offline reload of the installed app shell.
- Playwright is upgraded to 1.64.1 for the Node 26 test environment. The locally blocked esbuild install script was explicitly approved and the final build succeeds.
- E2E coverage also verifies security headers, the dedicated maskable icon, vocabulary persistence after reload, and 320/390/768 px layouts.
- Review schedules use a 10-minute retry, 1-day initial successful interval, or 4-day initial easy interval, growing to a maximum of 365 days. Review scores do not affect discovery achievements.
- Grammar notes cover 24 curated words. Cards for all unlocked words support recall and review, including the four starting elements.
- Project instructions and all four tracked Serena memory files have been refreshed.

## Open / deployment notes
- Deploy `dist/` including its `.htaccess` on Apache with `mod_headers` enabled and overrides allowed. On other hosts, configure equivalent response headers. Production hosting has not been accessed or verified in this session.
- Multi-tab behavior is intentionally conservative: the newest remote snapshot wins and users are warned to use one tab at a time.
- Review metadata is curated in `src/data/vocabulary.ts`; uncurated words still support recall, definition hints, and self-generated example sentences.

## Exit state and resumption
- Current requested scope is complete; no implementation is intentionally left in progress.
- Unit/lint/typecheck/build and browser verification use the commands in `README.md`; system Chromium was used locally.
- No session-owned preview server is left running. Scratch test artifacts are ignored and are not part of the delivered source.
