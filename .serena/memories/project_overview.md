# LinguaFusion

German-language alchemy and vocabulary-learning PWA for Austrian German users.
- 220 elements, starting from Feuer, Wasser, Erde, Luft. Self-combinations are supported.
- Discoveries require a word puzzle before unlocking; guesses accept umlaut transliteration.
- 27 achievements; mistake counts persist across reloads, tab switches and skips.
- Vocabulary review uses recall-first cards and saved due dates, separate from discovery scores.
- Curated article/plural/example metadata for 24 words lives in `src/data/vocabulary.ts`.

## Stack and structure
- React 18, strict TypeScript, Vite 7, Vitest 5, Playwright 1.64, React Flow, dagre, vite-plugin-pwa.
- `src/App.tsx`: Kombination, Sammlung, Wiederholen, Abzeichen, Statistiken tabs.
- `src/game/state.ts`: pure reducer, badge rules, shared review schedule calculation.
- `src/game/save.ts`: validated version-4 localStorage saves, legacy migration, export/import, revision checks.
- `src/hooks/useGame.ts`: persistence, UI queues and conservative cross-tab synchronization.
- `src/components/`: accessible UI; `src/index.css`: application styles.
- `public/.htaccess`: Apache response security headers; Vite preview sends matching headers.
- Runtime fonts and assets are local and precached for offline use.

Read `.agents/session-handoff.md` for current verification results and deployment limitations.
