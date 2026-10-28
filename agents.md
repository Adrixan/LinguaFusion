# LinguaFusion project instructions

## Project
- German-language alchemy and vocabulary-learning PWA, localized for Austria.
- Node.js 24 (LTS), React 19, strict TypeScript 6, Vite 8, Vitest, Playwright, React Flow and dagre; ESLint 10 flat config (`eslint.config.js`).
- Static deployment: build with `npm run build`, deploy all of `dist/`, including `.htaccess` on Apache.
- Read `.agents/session-handoff.md` before changing code.

## Layout
- `src/data/`: elements, recipes, badges, curated vocabulary notes.
- `src/game/`: reducer, save migration/validation, answer matching and unit tests.
- `src/hooks/useGame.ts`: React integration, persistence, UI queues and cross-tab synchronization.
- `src/components/`: gameplay, accessible collection, vocabulary review and dialogs.
- `e2e/`: production-bundle browser tests, including service-worker offline reload.
- `public/`: PWA icons and Apache security headers.

## Engineering
- Keep all game-state mutations in the reducer and validate imported saves at the storage boundary.
- Keep vocabulary review separate from discovery scores and first-try achievements.
- Never reveal undiscovered names or recipes through search or accessibility labels.
- Preserve previous save formats and the legacy storage-key migration.
- Curate noun articles, plurals and usage examples explicitly; do not infer grammatical forms mechanically.
- Keep keyboard controls, modal focus handling, reduced-motion support and narrow-screen usability intact.
- No secrets, third-party analytics, remote fonts or external runtime requests.
- Store scratch scripts and test artifacts in `.scratch/`, never in global temp directories.
- Do not modify the instruction submodules as part of application work.

## Verification and handoff
- `npm run lint` must report zero warnings.
- Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run audit` (fails on any advisory not accepted in `audit-exceptions.json`; exceptions need the owner's acceptance with a reason).
- Set `PW_CHROMIUM_PATH=/usr/bin/chromium` for the installed system browser, or install Playwright Chromium first.
- Build before E2E tests; keep service workers enabled for offline regression coverage.
- Record actual results and outstanding deployment limitations in `.agents/session-handoff.md`.
- Update `README.md` and `SPEC.md` when behavior changes. Do not mark unverified acceptance criteria as passed.
- Use Conventional Commits and never commit generated build or browser-test output.
