# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**모여 (Moyeo)** — frontend for a meetup midpoint / restaurant recommendation service. 5-week MVP. README is in Korean and has the full design rationale.

## 언어 지침

모든 결과값, 설명, 응답은 반드시 한글로 작성한다.

## Commands

| Command              | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`        | Dev server on http://localhost:3000                                           |
| `npm run build`      | Production build                                                              |
| `npm run start`      | Production server                                                             |
| `npm run lint`       | ESLint — **also enforces FSD layer boundaries**; failing this fails the build |
| `npm run type-check` | `tsc --noEmit`                                                                |

There is no test runner configured.

## Stack

Next.js 14 (App Router, RSC) · TypeScript strict · Tailwind · shadcn/ui · Zustand · Axios · `eslint-plugin-boundaries`. Path alias `@/*` → `./src/*` (never use relative `../../`).

shadcn components are installed via `npx shadcn@latest add <name>` and (per `components.json`) land in `src/shared/ui/`. The `cn` util lives at `@/shared/lib/utils`.

## Architecture: Feature-Sliced Design

Strict one-way dependency flow, enforced by `.eslintrc.json` via `boundaries/element-types`:

```
app  →  views  →  widgets  →  features  →  entities  →  shared
```

A higher layer may import from any lower layer; the reverse is forbidden, and **same-layer cross-imports are also forbidden** (compose them one layer up).

Layer responsibilities:

- **`shared/`** — domain-agnostic primitives (shadcn UI, axios instance, utils, env, common types). No business logic.
- **`entities/`** — one business domain object per slice (room, user, location, vote): types, API fetchers, presentational UI.
- **`features/`** — one user interaction per slice (e.g. room-create, vote-action): owns its form/handler/state.
- **`widgets/`** — composite UI blocks combining features/entities (Header, KakaoMapViewer, result lists).
- **`views/`** — full-page assembly for one route. No business logic — only arranges widgets/features/entities.
- **`app/`** — Next.js App Router shell. `app/page.tsx` should just import and render the matching `views/` component.

Each slice is structured as `ui/`, `model/` (Zustand stores, types, logic), `api/` (server calls), `lib/` (slice-internal helpers), and an `index.ts` **public API**. External code must import only via the slice's `index.ts` — never reach into `slice/ui/Foo`.

`entities/` and `features/` directories are currently empty; populate them as new slices when adding features.

## Layout convention

`src/app/layout.tsx` is mobile-first with `max-w-md` centered (Instagram-web style). Build pages assuming this constraint.

## Adding a feature — checklist

1. Pick the correct layer (interaction → `features/`; domain model → `entities/`; composite UI → `widgets/`).
2. Create the slice with the segments you need (`ui/`, `model/`, `api/`, ...).
3. Re-export the public surface from `index.ts`.
4. Run `npm run lint` to confirm no boundary violations.

## Branch / commit conventions

Branches: `feature/<name>`, `fix/<name>`, `chore/<name>`. Commits prefixed `feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `test:`. Merge to `main` via squash PR only.
