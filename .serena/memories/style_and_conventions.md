# Style & Conventions

## Code Style
- TypeScript strict mode
- React functional components with hooks
- `useCallback` for memoized callbacks in hooks
- `useMemo` for computed values
- CSS modules/files in `src/styles/`
- German naming for game elements, English for code identifiers

## Commit Format
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Architecture
- Custom hooks encapsulate game logic (`useGame`)
- Elements defined as static data in `src/data/elements.ts`
- State persistence via localStorage
- No external state management library
