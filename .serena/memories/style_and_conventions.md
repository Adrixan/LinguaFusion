# Style & Conventions

## Code Style
- TypeScript strict mode
- React functional components with hooks
- `useCallback` for memoized callbacks in hooks
- `useMemo` for computed values
- Shared application styles in `src/index.css`; React Flow brings its own stylesheet.
- German naming for game elements, English for code identifiers

## Commit Format
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Architecture
- Pure game rules and schedules live in `src/game/state.ts`; `useGame` integrates React and storage.
- Elements defined as static data in `src/data/elements.ts`
- State persistence via localStorage
- No external state management library
- Validate imported records, including review dates, known unlocked ids, and bounded intervals.
- Preserve Austrian German noun capitalization; curate grammar rather than generating it mechanically.
- Scratch scripts and artifacts belong in `.scratch/`.
