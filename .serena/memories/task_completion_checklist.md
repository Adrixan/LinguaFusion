# Task completion checklist
- Run lint with zero warnings, typecheck, unit tests, production build, E2E tests, audit and `git diff --check`.
- Build before E2E tests; test offline behavior with service workers enabled.
- Keep README, specification, `.agents/session-handoff.md`, and relevant Serena memories accurate.
- Commit only related source/docs/config/assets; exclude generated build and browser results.
- Use Conventional Commits; push and verify the remote branch before exit.
- Stop session-owned preview processes and leave the working tree clean.
