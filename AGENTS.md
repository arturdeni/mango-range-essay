<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Project rules — mango-range-essay

This is a technical exercise for a Mango frontend position: a custom `<Range />` component (continuous and stepped modes) built with Next.js App Router + TypeScript.

- Package manager: **pnpm** only (`pnpm dev`, `pnpm add`, ...). Never npm/yarn.
- Dev server always runs on port **8080** (`pnpm dev` → `next dev -p 8080`), per the exercise spec.
- Styling: **plain CSS with BEM naming**. No Tailwind, no CSS-in-JS, no CSS Modules.
- The range slider must be a **fully custom component** — never `<input type="range">`.
- Architecture: logic, hooks and UI must live in separate files inside `components/Range/`:
  - `Range.tsx` — composition/orchestration only
  - `RangeTrack.tsx`, `RangeHandle.tsx`, `RangeLabel.tsx` — presentational pieces
  - `hooks/` — drag and keyboard interaction logic, no JSX
  - `lib/` — pure functions (value/percentage math, clamping, snapping), no React
- Mock data is served through Next.js **Route Handlers** (`app/api/range-config`, `app/api/range-values`), not an external service.
- Accessibility is mandatory: `role="slider"`, `aria-valuemin/max/now`, `aria-label`, full keyboard support (arrow keys), visible focus states.
- Testing: **Jest + React Testing Library**. Every new piece of logic or interactive behavior needs a test. Co-locate test files next to the code they cover (`*.test.ts(x)`).
- Keep components small and single-purpose. Don't introduce abstractions or dependencies beyond what the exercise requires.
