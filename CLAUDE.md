# CLAUDE.md

We're building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a **greenfield build**. [SPEC.MD](SPEC.MD) is the authoritative design document — a note-taking web app with better-auth authentication, TipTap rich-text notes stored as JSON in SQLite, and public note sharing. Dependencies (`better-auth`, `@tiptap/*`, `zod`, Next.js, Tailwind v4) are installed, but most of the application code it describes (`lib/`, `components/`, `app/api/`, auth wiring) does not exist yet. When implementing, follow SPEC.MD and section 12's build order; deviate only with a stated reason.

## Runtime & commands

The intended runtime is **Bun** (not Node), even though the `dev`/`build`/`start` scripts invoke `next` directly. Prefer `bun` for everything:

- `bun install` — install dependencies
- `bun run dev` — dev server at http://localhost:3000
- `bun run build` / `bun run start` — production build / serve
- `bun run lint` — ESLint (flat config via `eslint-config-next`)

No test runner is configured yet. If adding tests, use `bun test` (Bun's built-in runner) and colocate `*.test.ts` files.

SQLite is accessed through **`bun:sqlite`** (Bun's native driver) with raw SQL — there is no ORM. This is why the app must run under Bun, not Node.

## Architecture (from SPEC.MD)

Next.js App Router with server components for data fetching and client components for interactive UI (TipTap editor, toggles). Layers:

- **Data access** — `lib/db.ts` exposes a singleton `bun:sqlite` connection plus `query`/`get`/`run` helpers. `lib/notes.ts` is the note repository (`createNote`, `getNoteById`, `updateNote`, `setNotePublic`, `getNoteByPublicSlug`, etc.).
- **API** — Route Handlers under `app/api/notes/**` for CRUD + `/api/notes/:id/share`. Public reads resolve directly in the `/p/[slug]` server component (or via `/api/public-notes/:slug`).
- **Pages** — `/` (landing), `/dashboard` (note list), `/notes/[id]` (editor), `/p/[slug]` (read-only public view), plus `(auth)/login` and `(auth)/register`.

### Non-obvious conventions

- **Two naming worlds in the DB.** better-auth's core tables (`user`, `session`, `account`, `verification`) use **camelCase** columns (`emailVerified`, `userId`, `expiresAt`) and `TEXT` string IDs — do not rename them. The app's own `notes` table uses **snake_case** (`user_id`, `content_json`, `public_slug`, `created_at`). Repository functions map snake_case rows to the camelCase `Note` type.
- **Auth-table schema is generated, not hand-written.** Run `bunx @better-auth/cli generate` and execute the emitted SQL during DB init rather than maintaining those four tables by hand. Foreign keys to `user(id)` are `ON DELETE CASCADE`.
- **Every authenticated note query must filter by `user_id`.** Cross-user access is prevented in SQL (`WHERE ... AND user_id = ?`), not just in route guards. Ownership checks that fail return 404, not 403.
- **Content is TipTap JSON**, stored as `JSON.stringify(doc)` in `content_json` and `JSON.parse`d on load. Never render notes via `dangerouslySetInnerHTML` with raw data — render only through TipTap.
- **Public sharing**: enabling generates a random `public_slug` (16+ chars); disabling sets `is_public = 0` and `public_slug = NULL`, making `/p/{slug}` 404.

## Config notes

- Path alias `@/*` maps to the repo root (`tsconfig.json`), so import as `@/lib/db`, `@/components/...`.
- TypeScript is `strict`; Tailwind is **v4** (configured via `@tailwindcss/postcss` in `postcss.config.mjs`, not a `tailwind.config.ts`).
- Env vars (see `.env.example`): `BETTER_AUTH_SECRET` (must be ≥32 chars) and `DB_PATH` (default `data/app.db`).
