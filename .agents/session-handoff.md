# Session handoff: LinguaFusion production-readiness

## 2026-10-28 next majors, React Compiler lint rules, audit gate
- `eslint-plugin-react-hooks` now runs its full `configs.flat.recommended` preset (React Compiler rules). Fixes: `VocabularyReview` reads the clock through the new `useNow` hook (`src/hooks/useNow.ts`: lazy initial value, 5 s interval matching the play-time tick that used to re-render the view, refresh in the reveal and rating handlers) instead of `Date.now()` during render; `useGame` declares the `latestState` ref before `dispatchLocal` uses it (the compiler treated the use-before-declaration as mutating a hook argument).
- Majors: `typescript` 5.9.3 -> 6.0.3 (7.x stays blocked: `typescript-eslint` 8.72 peer range `<6.1.0`); TypeScript 6 defaults `types` to `[]` and checks side-effect imports, so `tsconfig.json` declares `vite/client` (CSS imports) and `tsconfig.node.json` declares `node`. Node 22 -> 24 (newest LTS line in nodejs.org index.json, v24.22.1; Node 26 is not LTS yet): CI `node-version: 24`, `engines` `>=24`, `@types/node` 22.20.5 -> 24.19.2. CI actions checkout, setup-node, upload-artifact v4 -> v7. `npm outdated` lists only `typescript` (7.0.2) and `@types/node` (26.x), both held on purpose.
- `.npmrc` removed: its only line allowlisted `esbuild`, which Vite 8 no longer installs; no installed package has an install script.
- Audit gate: `npm run audit` (`scripts/audit.mjs`) fails on every advisory not listed in `audit-exceptions.json`. Accepted by Peter (2026-10-28): GHSA-gcqx-w48m-w2h4, deepmerge prototype poisoning, no fixed release, build time only via `vite-plugin-pwa` > `workbox-build`. The gate fails closed when npm returns no report, and drops `npm_config_allow_scripts` for its nested `npm audit` (under `npm run`, the global `allow-scripts` setting made the nested npm abort with EALLOWSCRIPTS, which the original template counted as a pass).
- Cooldown: every `^` minimum in `package.json` was published more than 24 h ago (youngest `@typescript-eslint/*` 8.72.1, 37 h); nothing lowered. No `.github/dependabot.yml` exists.
- Verified: `npm ci`, `npm run lint` (0 warnings), `typecheck`, `test` (67), `build`, `test:e2e` (18, `PW_CHROMIUM_PATH=/usr/bin/chromium`), `npm run audit` (only the accepted exception).

## 2026-10-28 dependency unpinning (policy: latest release as minimum, no exact pins)
- Every manifest entry now names the latest release as `^` minimum; the lockfile was regenerated from scratch (the old tree hit an ERESOLVE on `@babel/core` 8 optional peers of `@vitejs/plugin-react` 6).
- Majors kept (all checks pass): React/React DOM 19.3.1 with `@types/react(-dom)` 19.3.0, Vite 8.3.5, `@vitejs/plugin-react` 6.1.2, `vite-plugin-pwa` 2.0.0, ESLint 10.13.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.7.
- ESLint 10 dropped eslintrc: `.eslintrc.json` became `eslint.config.js` (flat config, new dev deps `@eslint/js`, `globals`), lint script lost `--ext`. The react-hooks rule set is the old v4 preset (`rules-of-hooks`, `exhaustive-deps`); the v7 preset's React Compiler rules report 2 errors in app code (`react-hooks/purity`: `Date.now()` during render in `VocabularyReview.tsx:13`; `react-hooks/immutability`: `latestState.current = gameState` in `useGame.ts:81`). Decide whether to fix them and enable `reactHooks.configs.flat.recommended`.
- Caps kept: `typescript` `^5.9.3` (TypeScript 7.0.2 breaks: typescript-eslint 8.72 supports `<6.1.0` and fails to load, and `tsc` 7 rejects the CSS side-effect imports in `main.tsx` with TS2882; TypeScript 6.0.3 is within the typescript-eslint range and untested). `@types/node` `^22.20.5` (latest 26.6.5): types follow the Node 22 runtime of CI and the `engines` floor, not the newest Node.
- `esbuild` is no longer installed (Vite 8 uses Rolldown/Oxc); `.npmrc` still allowlists `esbuild@0.28.2`, harmless; README updated.
- Audit: 4 low findings, all GHSA-gcqx-w48m-w2h4 (deepmerge prototype poisoning, no patched release; build-time only via `vite-plugin-pwa` > `workbox-build` > `@rollup/plugin-node-resolve`), already present on main before this change; `npm audit --audit-level=high` passes.
- Verified: `npm run lint`, `typecheck`, `test` (67), `build`, `test:e2e` (18, `PW_CHROMIUM_PATH=/usr/bin/chromium`) all pass.

## 2026-10-24 release audit remediation
- Compatible transitive lockfile refresh: fast-uri 3.1.9 and serialize-javascript 7.1.4. Clean install, zero-finding audit, lint, typecheck, 67 tests and production/PWA build passed. Main `ec6f228` merged/pushed and GitHub CI passed.

## CI follow-up (2026-10-21)
- Fixed the maskable-icon E2E assertion to resolve the manifest's relative icon URL against the manifest response URL, preserving nested-path deployment support.
- Verified lint, typecheck, 67 unit tests, production build, audit (0 findings), and the focused maskable-icon E2E (passed with system Chromium). The full E2E attempt initially lacked Playwright's bundled browser; the focused test passed after selecting system Chromium.

Delivered from `feat/vocabulary-spaced-review`, merged and pushed to `main` as `8a8508b`.

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

## 2026-11-07: relicensed to PolyForm Noncommercial 1.0.0
- Peter's order: only he may make money from the games. `LICENSE` is the verbatim PolyForm Noncommercial 1.0.0 text with two Required Notice lines (copyright; selling or paid distribution needs a written licence from Peter); `package.json` license `PolyForm-Noncommercial-1.0.0`; README and `agents.md` record the decision; content (elements, recipes, vocabulary notes) CC BY-NC-SA 4.0; contributions only with a written agreement. Versions before 2026-11-07 stay AGPL-3.0 for those who received them.
- Added the missing OFL texts for the bundled Cinzel and Nunito fonts in `public/fonts/` (shipped to `dist/fonts/`).
- Verified: `npm run audit` (accepted deepmerge exception only), lint 0 warnings, typecheck, 67 unit tests, build, E2E 18/18.

## 2026-11-15: web-modernize run (Modern Web Guidance)
- `modern-web-guidance legacy-scan` on `src/`, `index.html`, `public/`, `e2e/`: 0 findings (35 rules, 33 guides, about 20 % of the corpus). Manual cross-check of those guides: puzzle input uses a native `<form>` submit (IME-safe), native checkbox, no `innerHTML`; nothing to change.
- Missed by the scanner: `src/components/Modal.tsx` is a custom `role="dialog"` overlay with manual trap, `inert` and Esc. Migration to native `<dialog>` filed as a proposal in `.agents/to-do.md` (changes focus and dismissal semantics, needs Peter's go and new E2E tests).
- No source change, so lint, tests, build and E2E were not re-run. Report: `~/sync/ai/web-modernize/2026-11-15/LinguaFusion.md`.
- Next: Peter decides on the `<dialog>` proposal; from now on new web work follows the AGENTS.md web-platform rule.

## 2026-11-15: native `<dialog>` for `Modal.tsx` (Peter's decision in the Greeter)
- `src/components/Modal.tsx` renders `<dialog class="modal" aria-label closedby>` opened with `showModal()` in a layout effect; no `role`, `aria-modal`, focus trap, `inert` or Esc handler any more. Dismissal: Esc and back gesture (native), backdrop click via `closedby="any"`, Safari fallback (no `closedBy` on the prototype) via pointerdown plus pointerup both outside the box. The `close` event calls `onClose`; unmounting calls `close()` in the layout-effect cleanup while the dialog is still attached, so the browser returns focus to the opener. `onClose` omitted keeps the dialog non-dismissible (`closedby="none"`, `cancel` prevented, reopened after a forced close); no caller uses that today.
- New `src/components/Notice.tsx`: toast and both storage warnings are `popover="manual"`, so a notice raised while a dialog is open shows above the backdrop (z-index cannot beat the top layer; the import toast appears while Settings is open). The toast is keyed by its text, so each message re-enters the top layer. A warning already visible before a dialog opens sits below that dialog until it closes (accepted: re-raising would re-announce the `role="alert"`). Without Popover API support the notices render as before (fixed, z-index).
- CSS: `.modal-overlay` replaced by `dialog.modal::backdrop` (same colour and fade, `overflow: hidden` plus `overscroll-behavior: contain`), `dialog.modal:modal { overscroll-behavior: contain }`, `.modal` gets `margin: auto` (the universal reset removed the UA centring), `border: none`, `color`; popover UA box reset for `.toast` and `.persistence-warning`; `::backdrop` added to the reduced-motion rule.
- Behaviour notes: in Chrome, Tab after the last control moves focus to the browser UI (spec behaviour of native modals) and the next Tab returns to the dialog; the page behind is never reached. The hidden file input stays outside the dialog and still opens the picker from Settings (checked with a Playwright `filechooser` probe).
- E2E: 6 new tests in `native modal dialog` (Esc plus focus return, backdrop click vs. padding click, Tab/Shift+Tab never reach the page, toast above an open dialog, Safari fallback incl. drag-out, 320 px fit); stable over `--repeat-each=4`.
- Verified: `npm run lint` 0 warnings, `typecheck`, `test` 67, `build`, `test:e2e` 24/24 (`PW_CHROMIUM_PATH=/usr/bin/chromium`), `npm run audit` (accepted deepmerge exception only). chrome-devtools MCP: Tutorial and badge dialogs appear as `dialog … modal` with the page hidden from the a11y tree, Esc chains Tutorial to the next badge dialog, no console messages.
- Main `7086b69` pushed; GitHub CI and "Notify Lernspiele site" green. Docs: `SPEC.md` section "Dialoge". No deploy command exists for this repo (manual `dist/` deploy), so nothing was published.
- linguafusion-android: `.agents/to-do.md` there (merge `9fe0a9e`) lists the WebView check (`showModal` 37, `popover` 114, `closedby` 134 vs. minSdk 24) and the selectors that break on the next pin move (`.modal-overlay` in `shell.ts` back handler and the emulator smoke).
