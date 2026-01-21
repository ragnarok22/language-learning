# Repository Guidelines

## Project Structure & Module Organization

- Vite + React + TypeScript app; entry is `src/main.tsx`, mounting `App` from `src/app.tsx`.
- UI components in `src/components`; hooks in `src/hooks`; helpers in `src/lib/utils.ts` (`cn`) and `src/utils/ai.ts` (model calls/normalization); demo content in `src/data/demo-plan.ts`.
- Global styles and Tailwind v4 theming live in `src/index.css`; static assets go under `public/`.
- Type configs: `tsconfig.app.json` for the client, `tsconfig.node.json` for tooling; Vite config in `vite.config.ts`.

## Build, Test, and Development Commands

- `pnpm install` — install dependencies (prefer pnpm to keep lockfile in sync).
- `pnpm dev` — run the dev server with HMR.
- `pnpm build` — type-check (`tsc -b`) then bundle via Vite.
- `pnpm preview` — serve the production build locally.
- `pnpm lint` — ESLint (flat config) across the repo.
- `pnpm format` / `pnpm format:check` — Prettier write/check.

## Coding Style & Naming Conventions

- TypeScript everywhere; keep types in `src/types.ts` or colocated when small. Use type-only imports when values are unused.
- Functional React components, hooks-first state, and local persistence via `useLocalStorage` when helpful.
- Tailwind utility classes for styling; reuse the `cn` helper instead of manual `clsx/tailwind-merge`.
- Prettier default format (2-space indent, double quotes); ESLint extends `@eslint/js`, `typescript-eslint`, React Hooks, and React Refresh rules.
- File names: kebab-case for components/util files, PascalCase component names.

## Testing Guidelines

- No automated test suite yet. Before PRs, run `pnpm lint` and `pnpm build` to catch type/runtime regressions.
- If you add tests, prefer Vitest + React Testing Library, naming files `*.test.tsx` near the code; keep fixtures small and deterministic.
- For UI changes, do a quick manual pass: load the demo plan, generate with AI (requires API key), and verify speech playback if available.

## Commit & Pull Request Guidelines

- Follow the Conventional Commit style seen in history (e.g., `feat(app): ...`, `build(tailwind): ...`, `refactor(app): ...`).
- Keep PRs focused and include what changed, why, verification steps, and linked issue/Task ID; add screenshots/GIFs for UI changes.
- Ensure `pnpm lint` and `pnpm build` pass before requesting review; note any known follow-ups explicitly.

## Security & Configuration Tips

- Do not commit API keys. The tutor model key is user-supplied in-app and stored in localStorage; keep it out of `.env` and version control.
- If introducing environment variables, use `VITE_`-prefixed names and document them; avoid embedding secrets in client bundles.
