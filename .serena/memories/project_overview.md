# LinguaFusion (Alchemie Fusion)

## Purpose
An element combination game (alchemy-style) built as a PWA. Players start with 4 basic elements (Feuer, Wasser, Erde, Luft) and combine them to discover 665+ elements. Each discovery requires solving a word puzzle (German language).

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- canvas-confetti (celebration effects)
- vite-plugin-pwa (PWA support)
- LocalStorage for persistence

## Project Structure
- `src/App.tsx` — Main component with tabs (Kombination, Sammlung, Abzeichen, Statistiken)
- `src/hooks/useGame.ts` — Core game state hook (combine, solveWord, skipWord, badges, etc.)
- `src/data/elements.ts` — 665 element definitions with combinations, categories
- `src/data/badges.ts` — Badge definitions
- `src/components/` — UI components (CombinationArea, WordPuzzle, ElementCard, Header, etc.)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — `tsc && vite build`
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Key Concepts
- `unlockedElements` — Elements available for combining (shown in grid)
- `discoveredElements` — Elements found via combination (may not be unlocked yet)
- `pendingDiscovery` — Element awaiting word puzzle completion
- `combinations` on each element — Array of [elem1, elem2] recipes that create this element
- `getCombinableElements(a, b)` — Finds which element is created by combining a + b

## Language
- German (Austrian German target audience)
- All UI text and element names in German
