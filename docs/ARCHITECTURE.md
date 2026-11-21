# Lumen — Architecture

Lumen is an AI-powered knowledge base: a Notion-style block editor with an
inline AI writing assistant, semantic search across every note, and a
"chat with your notes" panel that answers with citations.

This document describes **how** the app is built and **why**. The phased build
plan lives in [`ROADMAP.md`](./ROADMAP.md).

---

## 1. Goals and constraints

| Goal              | What it means in practice                                                              |
| ----------------- | -------------------------------------------------------------------------------------- |
| Frontend depth    | Rich editor, keyboard-first UX, optimistic updates, animations, responsive.            |
| Meaningful AI     | AI is part of the workflow (writing, search, Q&A), not a bolted-on chatbot.            |
| Zero cost         | Every service runs on a free tier with no credit card.                                 |
| Production habits | Typed end to end, validated inputs, RLS-secured data, tests, CI, conventional commits. |

### Free-tier stack

| Concern      | Choice                                  | Free tier notes                          |
| ------------ | --------------------------------------- | ---------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19      | Open source                              |
| Styling / UI | Tailwind CSS 4 + shadcn/ui (Radix)      | Open source, components live in our repo |
| Auth + DB    | Supabase (Postgres, Auth, pgvector)     | 2 free projects, 500 MB DB               |
| LLM          | Google Gemini via Vercel AI SDK         | Free API key from Google AI Studio       |
| Embeddings   | Gemini embedding model (768 dimensions) | Same free key                            |
| Hosting      | Vercel Hobby                            | Free for personal projects               |
| CI           | GitHub Actions                          | Free for public repos                    |

---

## 2. High-level design

```
Browser (React 19 client components)
 ├─ TanStack Query cache ── Supabase JS client ──► Supabase Postgres (RLS)
 ├─ Zustand (UI-only state: sidebar, panels, palette)
 └─ fetch / useChat ──► Next.js Route Handlers (/api/ai/*)
                          ├─ verify Supabase session
                          ├─ validate body with Zod
                          ├─ Gemini (stream / structured output / embeddings)
                          └─ pgvector similarity search (RAG)
```

**Key decisions**

1. **Server Components for the shell, client components for the workspace.**
   Landing, auth pages and layout chrome render on the server. The editor
   workspace is highly interactive, so it is client-rendered and fed by
   TanStack Query.
2. **Notes CRUD talks to Supabase directly from the browser.** Row Level Security
   guarantees a user can only touch their own rows, so no extra API layer is
   needed for plain CRUD. This keeps latency low and optimistic updates simple.
3. **Anything that needs a secret runs on the server.** All Gemini calls go
   through Route Handlers that re-check the session. The API key never reaches
   the client.
4. **Feature-based modules.** Code is grouped by feature (`notes`, `editor`,
   `ai`, `search`, `chat`), not by file type, so each feature can be read,
   tested and changed in isolation.

---

## 3. Folder structure

```
src/
├─ app/                         # Routing only: thin pages that compose features
│  ├─ (marketing)/              # Public landing page
│  ├─ (auth)/                   # Login, OAuth callback
│  ├─ (workspace)/              # Authenticated app: /notes, /notes/[noteId], /notes/quiz, /notes/templates
│  ├─ share/[token]/            # Public read-only view of a shared note (server-rendered)
│  ├─ api/ai/                   # Route Handlers: completion, metadata, chat, embed
│  ├─ layout.tsx                # Root layout, fonts, providers
│  └─ globals.css               # Tailwind + design tokens
├─ components/
│  ├─ ui/                       # shadcn/ui primitives (generated, lightly edited)
│  └─ shared/                   # App-wide composites (logo, theme toggle, empty states)
├─ features/
│  ├─ auth/                     # components/, actions/, hooks/
│  ├─ notes/                    # api/ (queries + mutations), components/, hooks/, schemas/, types.ts
│  ├─ editor/                   # components/, extensions/ (Tiptap), hooks/
│  ├─ ai/                       # components/, hooks/, prompts/, schemas/
│  ├─ search/                   # Command palette + semantic search
│  ├─ chat/                     # Chat-with-notes panel
│  ├─ quiz/                     # data/ (question bank), components/, types.ts
│  ├─ templates/                # data/ (note templates), lib/ (Tiptap JSON builders), components/
│  └─ quotes/                   # data/ (quotes), components/ (daily quote dialog)
├─ config/                      # Static app config (site metadata, navigation)
├─ hooks/                       # Generic hooks (useDebounce, useMediaQuery, useHotkey)
├─ lib/
│  ├─ supabase/                 # Browser, server and proxy clients
│  ├─ ai/                       # Model provider config, chunking, embeddings
│  ├─ env.ts                    # Zod-validated environment variables
│  └─ utils.ts                  # cn() and small pure helpers
├─ providers/                   # Theme, QueryClient, Tooltip providers
├─ stores/                      # Zustand stores (UI state only)
├─ types/                       # Generated Supabase types, shared types
└─ proxy.ts                     # Session refresh + optimistic route protection
supabase/
└─ migrations/                  # SQL: tables, RLS policies, pgvector, RPCs
docs/                           # Architecture, roadmap, decisions
```

### Import rules

- `app/` may import from anything; nothing imports from `app/`.
- `features/x` may import from `components/`, `hooks/`, `lib/`, `stores/`, `types/`.
- A feature imports **another feature only through its public `index.ts`**.
- `components/ui` imports nothing app-specific.
- Random content (quiz rounds, template picks) is generated only in the browser,
  behind `useIsClient` or in event handlers, so prerendered HTML never mismatches
  and Cache Components never sees `Math.random()` during prerender.

---

## 4. State management

| Kind of state                | Tool                         | Example                            |
| ---------------------------- | ---------------------------- | ---------------------------------- |
| Server data                  | TanStack Query               | Note list, single note, favorites  |
| UI state shared across trees | `createPersistedStore`       | Sidebar width/collapsed, list sort |
| URL state                    | Route params / search params | Active note id, search query       |
| Local component state        | `useState` / `useReducer`    | Rename input, popover open         |
| Form state                   | React Hook Form + Zod        | Login form, settings               |
| Editor document state        | Tiptap                       | Content, selection                 |

**Query key factory.** All keys come from one place (`features/notes/api/keys.ts`),
so invalidation is consistent and typo-proof.

**Optimistic updates.** Create, rename, move, favorite and delete update the
cache immediately, roll back on error and show a toast.

**Autosave.** The editor saves through a debounced mutation (about 800 ms).
The header shows a status: `Saving…` → `Saved` → `Offline / Retry`.

---

## 5. Data model (Supabase Postgres)

```
notes
  id            uuid  pk
  user_id       uuid  fk → auth.users, default auth.uid()
  parent_id     uuid  fk → notes (nested pages), on delete cascade
  title         text
  icon          text  (emoji)
  content       jsonb (Tiptap document)
  plain_text    text  (derived; used for previews + embeddings)
  position      double precision (fractional ordering for drag and drop)
  is_favorite   boolean
  archived_at   timestamptz (null = active; set = in trash)
  share_token   uuid unique (the /share/<token> link; replaced on "Reset link")
  share_access  text: private | public | invited
  created_at / updated_at

note_share_invites                -- who may read an invite-only note
  note_id (fk cascade), email (lowercase), pk (note_id, email)

note_chunks                       -- semantic search + RAG
  id, note_id (fk cascade), user_id, chunk_index,
  content text, embedding vector(768)
  HNSW index on embedding (cosine)
```

- **RLS on every table:** `user_id = auth.uid()` for select, insert, update, delete.
- **`get_shared_note(token)`** is `security definer`: `notes` RLS stays
  owner-only, and this function returns one note by token only to its owner,
  to anyone when `public`, or to invitees whose _confirmed_ account email is on
  the invite list.
- **`match_note_chunks(query_embedding, match_count)`** is a SQL function with
  `security invoker`, so RLS still applies during vector search.

---

## 6. AI features

| Feature                 | Where                                   | Technique                                                                                       |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Inline writing commands | Editor bubble menu, `/ai` slash command | `streamText`; commands: improve, fix grammar, shorten, expand, change tone, translate, continue |
| Smart metadata          | Note header                             | Structured output (Zod schema) → title, tags, summary                                           |
| Semantic search         | ⌘K command palette                      | Gemini embeddings + pgvector cosine similarity                                                  |
| Chat with your notes    | Side panel                              | Retrieval-augmented generation (RAG) with streamed answers and clickable citations              |
| Related notes           | Note footer                             | Nearest neighbours of the note's own embedding                                                  |

**Indexing pipeline.** After a note is saved and has been idle for a short
while, the client calls `/api/ai/embed`. The handler splits the plain text into
overlapping chunks, embeds them in one batch, and replaces that note's rows in
`note_chunks`. An unchanged-content check avoids re-embedding identical text.

**Prompts** live in `features/ai/prompts/` as plain, versioned functions, never
inline in components.

**Guardrails.** Every request body is validated with Zod and length-limited.
Each handler checks the session and returns typed errors (401, 422, 429, 500)
that the UI turns into friendly toasts. Gemini free-tier rate limits surface
as a "try again in a moment" state, not a crash.

---

## 7. Cross-cutting standards

- **TypeScript strict**; database types generated from Supabase.
- **Validation:** Zod at every boundary (env, forms, API bodies, AI output).
- **Errors:** route-level `error.tsx` / `not-found.tsx`, an error boundary around
  the editor, and toasts (Sonner) for mutation failures.
- **Loading:** skeletons that match the final layout; Suspense for streamed server UI.
- **Persisted UI state:** sidebar width/collapsed live in `localStorage`. An
  inline `<head>` script applies them to `<html>` (CSS variable + data
  attribute) before first paint; `createPersistedStore` syncs React via
  `useSyncExternalStore`, including across tabs.
- **Static document rendering:** `features/editor/extensions.ts` is the single
  schema used by the editor, the server-rendered share page
  (`@tiptap/static-renderer`) and PDF export (print of a sandboxed iframe).
- **Theming:** a small custom `ThemeProvider` instead of `next-themes`. An inline
  `<head>` script applies the stored theme before first paint (no flash), and
  `useSyncExternalStore` keeps React in sync with `localStorage` and the OS
  preference without hydration mismatches.
- **Accessibility:** Radix primitives, visible focus rings, keyboard shortcuts with
  discoverable hints, `aria-live` for streaming AI output, reduced-motion support.
- **Performance:** the editor and chat panel are lazy-loaded, the sidebar tree is
  memoized, AI streams render incrementally, and `next/font` handles fonts.
- **Quality gates:** ESLint, Prettier, `tsc --noEmit`, Vitest, commitlint
  (conventional commits) via Husky, and the same checks in GitHub Actions.
