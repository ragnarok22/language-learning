# Language Learning (Local Dutch Coach)

Local-first Vite + React app for planning and practicing Dutch. Draft a study plan with your own AI model or stay on the built-in demo data, then drill lessons with audio and interactive exercises—everything stored in your browser.

## Quick start

- Prereqs: Node 18+ and pnpm.
- Install deps: `pnpm install`
- Dev server: `pnpm dev` (Vite with HMR)
- Checks: `pnpm lint` (ESLint) and `pnpm build` (type-check + bundle)
- Preview production build: `pnpm preview`

## How to use it

- Landing (`/`): Overview plus shortcuts into the flows.
- Guided flow (`/app`): Step through Setup → Goal → Plan → Practice with a stepper and hero actions.
- Setup & plan (`/setup`): Jump directly to settings, goal entry, and AI plan generation.
- Practice list (`/practice`): Browse lessons with summaries and exercise counts; generate fresh plans or reload the demo.
- Lesson detail (`/practice/:lessonId`): Full lesson with basics, sentences, text-to-speech playback, and exercises with reveal/feedback states.
- Persistence: localStorage keys `dutch.settings`, `dutch.goal`, and `dutch.plan` keep everything on-device.

## AI generation & privacy

- Provide an OpenAI-compatible API key, model (default `gpt-4o-mini`), and base URL in the Setup card. These are stored locally only.
- The app sends a single chat-completions request to your configured endpoint to create a plan. Responses are normalized so malformed output falls back to the bundled demo plan in `src/data/demo-plan.ts`.
- Speech synthesis relies on the browser (no external TTS calls); if unsupported, audio buttons disable and a status message appears.

## Features at a glance

- Local-only storage for settings, goals, and lesson plans; reset anytime to demo data.
- Interactive exercises (cards, fill, order, match) with instant correctness feedback and revealable answers.
- Phonetic hints and browser speech playback for Dutch sentences.
- Tailwind v4 styling with animated gradients and responsive cards.

## Project layout

- `src/main.tsx`: App entry, mounts the TanStack Router.
- `src/router.tsx`: Routes for landing, guided flow, setup, practice list, and lesson detail.
- `src/routes/`: Page components such as `app.tsx`, `setup.tsx`, `practice.tsx`, and `practice-lesson.tsx`.
- `src/components/`: Reusable UI (hero, stepper, settings, plan overview, lessons).
- `src/utils/ai.ts`: Model request helper and plan normalization.
- `src/hooks/use-local-storage.ts`: Local persistence helper.
- `src/index.css`: Tailwind v4 theming and global styles.

## Notes

- No backend or database; everything runs in the browser. Keep your API key private and avoid checking it into version control.
- To target another language, change “Learning language” in settings and regenerate a plan; the prompt uses your goal plus language fields when calling the model.
