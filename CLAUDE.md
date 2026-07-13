@AGENTS.md

# Claude Code specific workflow

- Before writing Next.js/React code, invoke the `vercel:nextjs` skill for architecture and best-practice guidance (RSC boundaries, route handlers, hydration). `vercel:react-best-practices` triggers automatically after editing several `.tsx` files — no need to call it manually.
- Comments: default to none. Only add a comment when it explains a non-obvious *why* (a hidden constraint, an edge case, a workaround) — never restate *what* the code already says through naming. No multi-paragraph docstrings.
- Before reporting a step from `PLAN.md` as done: run `pnpm test` and `pnpm typecheck`, and confirm both are clean.
- Follow the implementation order in `PLAN.md` step by step; don't jump ahead or bundle multiple steps into one without checking in first.
