# Lumen

**Your AI-powered second brain.** Write in a Notion-style block editor, get
inline AI help, search your notes by meaning, and chat with your own knowledge
base, with answers that cite their sources.

> Status: in active development. See the [roadmap](./docs/ROADMAP.md).

## Features

- **Block editor** with slash commands, a floating formatting menu, nested pages and autosave
- **Inline AI writing assistant:** improve, fix grammar, shorten, expand, change tone, translate, continue writing
- **Smart metadata:** AI-generated titles, tags and summaries
- **Semantic search** in a ⌘K command palette (Gemini embeddings + pgvector)
- **Chat with your notes:** retrieval-augmented answers with clickable citations
- **Polished UX:** keyboard-first, optimistic updates, dark mode, responsive, accessible

## Tech stack

| Area      | Tools                                                    |
| --------- | -------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript            |
| UI        | Tailwind CSS 4, shadcn/ui (Radix), Lucide icons          |
| State     | TanStack Query (server state), Zustand (UI state)        |
| Backend   | Supabase: Postgres, Auth, Row Level Security, pgvector   |
| AI        | Vercel AI SDK + Google Gemini                            |
| Quality   | ESLint, Prettier, Vitest, Husky, lint-staged, commitlint |

Every service runs on a **free tier with no credit card**.

## Getting started

### 1. Prerequisites

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) project
- A free [Google AI Studio](https://aistudio.google.com/apikey) API key

### 2. Install and configure

```bash
npm install
cp .env.example .env.local   # then fill in the values
```

### 3. Create the database tables

In the Supabase dashboard open **SQL Editor → New query**, paste the contents of
[`supabase/migrations/0001_notes.sql`](./supabase/migrations/0001_notes.sql) and click **Run**.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the development server       |
| `npm run build`     | Production build                   |
| `npm run lint`      | Lint with ESLint                   |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run format`    | Format with Prettier               |

## Project docs

- [Architecture](./docs/ARCHITECTURE.md): design decisions, folder structure, data model, AI pipeline
- [Roadmap](./docs/ROADMAP.md): phased build plan and progress

## Commit convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
and are enforced by commitlint on every commit:
`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`, `chore:`, `ci:`, `perf:`, `build:`.
