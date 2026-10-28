# LinguaFusion

> A German-language alchemy game where you learn vocabulary by combining elements and solving word puzzles.

## Features

- **220 discoverable elements** organized in a tiered DAG, starting from 4 basics: Feuer, Wasser, Erde, Luft
- **Word puzzle challenge** for each new discovery — type the German word to unlock it (umlauts may be typed as ae/oe/ue/ss)
- **Vocabulary review** — recall-first flashcards with saved spaced scheduling, curated Austrian usage notes, articles, plurals, and example sentences for selected words
- **Definition-style hints** always visible during puzzles; unlimited attempts, solving on the first try counts as perfect
- **Interactive collection graph (Sammlung)** — pan/zoom/click DAG visualization powered by react-flow
- **Smart highlighting** — elements that can form new combinations glow when selected (toggleable in settings)
- **27 badges and achievements** to earn
- **PWA** — installable, works offline, no third-party requests (fonts are bundled)
- **Save / export / import** game progress (localStorage, validated on load and import, corrupt saves are backed up)
- **Responsive design** — mobile, tablet, and desktop

## Tech Stack

React 19 · TypeScript · Vite 8 · @xyflow/react · dagre · vite-plugin-pwa

## Getting Started

Requires Node.js 24 (the current LTS line) or newer.

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Quality checks

```sh
npm run lint        # ESLint, zero warnings allowed
npm run typecheck   # tsc --noEmit
npm test            # Vitest: data integrity, game rules, persistence
npm run build && npm run test:e2e   # Playwright against the production build
```

`npx playwright install chromium` is needed once for the end-to-end tests; set `PW_CHROMIUM_PATH` to use an existing Chromium instead. CI runs all of the above plus the audit gate `npm run audit`.

### Local verification

Run the checks from the repository root:

```sh
npm install
npm run lint
npm run typecheck
npm test
npm run build
PW_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
npm run audit
```

If Chromium is not installed at that path, run `npx playwright install chromium` once and omit `PW_CHROMIUM_PATH`. The end-to-end suite uses the production build through `vite preview` and covers the tutorial, combinations, persisted puzzles, importing, collection, vocabulary review, and all tabs.

No installed dependency runs an install script (Vite 8 no longer pulls in `esbuild`), so the repository needs no script allowlist. If a new dependency brings one, npm reports it as unreviewed; review the script before allowing it.

`npm run audit` (`scripts/audit.mjs`) fails on every npm advisory except those accepted in `audit-exceptions.json`. The only accepted exception is GHSA-gcqx-w48m-w2h4 (deepmerge prototype poisoning, no fixed release), reached only at build time through `vite-plugin-pwa` > `workbox-build`; accepted by the owner on 2026-10-28.

Two dependencies stay one major behind on purpose: `typescript` on 6.x, because `typescript-eslint` 8 supports only TypeScript below 6.1, and `@types/node` on 24.x, matching the Node.js LTS line used in CI and `engines`.

For deployment, serve `dist/` over HTTPS and add the CSP from the generated `dist/index.html` as an HTTP response header at the hosting layer. The HTML meta policy is a fallback; response headers provide stronger enforcement.

## Project layout

- `src/data` — elements/recipes, badges, and curated vocabulary notes
- `src/game` — pure game logic: `state.ts` (reducer, badge and spaced-review rules), `save.ts` (validation, storage, migration), `words.ts` (answer matching)
- `src/hooks/useGame.ts` — wires the reducer to React, localStorage and the UI queue
- `src/components` — presentational components

## License

This project is licensed under the terms of the [AGPL-3.0](LICENSE) license.
