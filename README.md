# LinguaFusion

> A German-language alchemy game where you learn vocabulary by combining elements and solving word puzzles.

## Features

- **220 discoverable elements** organized in a tiered DAG, starting from 4 basics: Feuer, Wasser, Erde, Luft
- **Word puzzle challenge** for each new discovery — type the German word to unlock it (umlauts may be typed as ae/oe/ue/ss)
- **Definition-style hints** always visible during puzzles; unlimited attempts, solving on the first try counts as perfect
- **Interactive collection graph (Sammlung)** — pan/zoom/click DAG visualization powered by react-flow
- **Smart highlighting** — elements that can form new combinations glow when selected (toggleable in settings)
- **27 badges and achievements** to earn
- **PWA** — installable, works offline, no third-party requests (fonts are bundled)
- **Save / export / import** game progress (localStorage, validated on load and import, corrupt saves are backed up)
- **Responsive design** — mobile, tablet, and desktop

## Tech Stack

React 18 · TypeScript · Vite 7 · @xyflow/react · dagre · vite-plugin-pwa

## Getting Started

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

`npx playwright install chromium` is needed once for the end-to-end tests; set `PW_CHROMIUM_PATH` to use an existing Chromium instead. CI runs all of the above plus `npm audit`.

## Project layout

- `src/data` — elements (recipes, hints) and badges
- `src/game` — pure game logic: `state.ts` (reducer, badge rules), `save.ts` (validation, storage, migration), `words.ts` (answer matching)
- `src/hooks/useGame.ts` — wires the reducer to React, localStorage and the UI queue
- `src/components` — presentational components

## License

This project is licensed under the terms of the [AGPL-3.0](LICENSE) license.
