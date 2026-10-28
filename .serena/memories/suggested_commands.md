# Suggested Commands

## Development
- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite build
- `npm run lint` — Run ESLint (ts,tsx via eslint.config.js)
- `npm run preview` — Preview production build
- `npm run typecheck` — Check app and build configuration types
- `npm test` — Unit tests for data, reducer, save validation and answers
- `PW_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` — Production browser tests (build first)
- `npm audit --audit-level=high` — Dependency vulnerability check
- Use `npx playwright install chromium` and omit `PW_CHROMIUM_PATH` on machines without system Chromium.
- Node compatibility: 20.19.x or later 20.x, or 22.12+; CI uses Node 22.

## System
- `git`, `ls`, `cd`, `grep`, `find` — Standard Linux utils
- `node` — Node.js runtime
- `npm` — Package manager
