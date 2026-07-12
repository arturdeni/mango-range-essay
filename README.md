# Mango — `<Range />` component exercise

Technical exercise for a Frontend Developer position at Mango: a custom, accessible `<Range />` component built with Next.js (App Router) and TypeScript, in two usage modes.

- **`/exercise1`** — Normal range: drag between a min/max value, with editable min/max labels.
- **`/exercise2`** — Fixed values range: drag across a fixed array of values, with read-only labels.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080).

## Testing

```bash
pnpm test
```

## Key decisions

- **No `<input type="range">`** — the slider (track, handles, drag/keyboard interaction) is fully custom.
- **Styling**: plain CSS with BEM, no Tailwind/CSS-in-JS.
- **Mock data**: served via Next.js Route Handlers (`/api/range-config`, `/api/range-values`) instead of an external mock service, so the whole exercise is self-contained.
- **Architecture**: logic (`lib/`, `hooks/`), UI (`Range.tsx`, `RangeTrack.tsx`, `RangeHandle.tsx`, `RangeLabel.tsx`) and tests are kept in separate files under `components/Range/`.
- **Accessibility**: ARIA slider roles and full keyboard support (arrow keys), in addition to drag.

See [`PLAN.md`](./PLAN.md) for the full reasoning behind these decisions.
