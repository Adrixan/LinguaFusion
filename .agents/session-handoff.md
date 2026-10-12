# Session handoff: LinguaFusion production-readiness review

Intent: understand the app, find bugs and unnecessary complexity, propose a path to production quality. Analysis only; no source files changed.

State: review complete and reported in chat. Scratch scripts (data integrity, headless-browser repro) are in `.scratch/` (untracked).

Verified findings (reproduced): self-combination impossible (189/220 elements unreachable), corrupt save blanks the app permanently, already-discovered recombination reopens the puzzle (state updater side effect), wordsSolved/hintsUsed inflation, Stats-tab reset without confirm, two stacked modals after solving.

Pending decisions for the owner: desired fix order, whether to rename the storage key with migration, whether to self-host fonts, whether the Sammlung graph should hide unrevealed recipes.

Next steps: implement P0 items (selection model, state machine/reducer with validation, remove dist from git), add Vitest tests for data integrity and reducer, add CI.
