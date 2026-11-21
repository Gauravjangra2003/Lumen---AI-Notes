# Lumen — Roadmap

Each phase ends in a working, committed state. Commits follow
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
`refactor:`, `style:`, `docs:`, `chore:`, `test:`, `ci:`, `perf:`, `build:`).

Legend: `[x]` done, `[ ]` to do.

---

## Phase 0 — Foundation

- [x] Architecture and roadmap docs
- [x] Move code into `src/`, set up path aliases
- [x] Prettier (with Tailwind class sorting) and a stricter ESLint config
- [x] Husky, lint-staged and commitlint to enforce commit conventions
- [x] Zod-validated environment variables plus `.env.example`
- [x] shadcn/ui initialised, design tokens, Geist fonts, light and dark themes
- [x] App providers: theme, TanStack Query, tooltips, toasts

## Phase 1 — Design system and app shell

- [ ] Shared components: logo, theme toggle, empty state, keyboard shortcut hint
- [ ] Marketing landing page (hero, feature grid, animated product preview)
- [ ] Workspace layout: resizable and collapsible sidebar, header, mobile sheet
- [ ] Global error, not-found and loading states

## Phase 2 — Authentication (Supabase)

- [x] Supabase browser, server and proxy clients
- [x] `proxy.ts` session refresh and route protection
- [x] Login page: email + password sign-in and sign-up, with validation and error states
- [ ] Login: email magic link + GitHub OAuth
- [x] Email confirmation callback route, sign-out
- [ ] User menu

## Phase 3 — Notes core

- [x] SQL migration: `notes` table, RLS policies, triggers
- [x] Flat note list in the sidebar: create, open, delete
- [x] Basic Tiptap editor with toolbar and debounced autosave
- [ ] Generated database types
- [ ] Data layer: query key factory, queries, mutations with optimistic updates
- [ ] Sidebar page tree: nested pages, create, rename, favorite, trash, restore
- [ ] Drag-and-drop reordering and nesting (dnd-kit + fractional positions)

## Phase 3.5 — Explore

- [x] Explore cards on the notes home (shared `FeatureCard`, responsive grid)
- [x] Quiz: random rounds of five questions, one at a time, with feedback and score
- [x] Templates: shuffled gallery of note designs that create a pre-filled note
- [x] Daily quote: popup with a random quote, cancel and "another quote" actions

## Phase 4 — Editor

- [ ] Tiptap editor with headings, lists, to-dos, quotes, code blocks, links
- [ ] Slash command menu and floating formatting (bubble) menu
- [ ] Debounced autosave with a save-status indicator
- [ ] Note header: emoji icon picker, editable title, breadcrumbs

## Phase 5 — AI writing assistant

- [ ] AI provider config and `/api/ai/completion` streaming route
- [ ] Prompt library and command schema
- [ ] Bubble-menu AI actions: improve, fix, shorten, expand, tone, translate
- [ ] `/ai` slash command and "continue writing"
- [ ] Accept / discard / retry flow with streaming preview
- [ ] Smart metadata: AI-generated title, tags and summary (structured output)

## Phase 6 — Semantic search

- [ ] Migration: pgvector, `note_chunks`, `match_note_chunks` RPC
- [ ] Chunking and embedding pipeline (`/api/ai/embed`)
- [ ] ⌘K command palette: navigation, actions, keyword + semantic results
- [ ] Related-notes section

## Phase 7 — Chat with your notes

- [ ] RAG route `/api/ai/chat` using retrieved chunks as context
- [ ] Chat panel with streaming markdown, citations that open the source note
- [ ] Suggested questions, stop / regenerate, conversation reset

## Phase 8 — Quality, polish and launch

- [ ] Unit tests (Vitest + Testing Library) for hooks, utils and key components
- [ ] End-to-end smoke test (Playwright) for login → create note → AI action
- [ ] Accessibility pass (keyboard-only walkthrough, axe checks)
- [ ] Performance pass (bundle analysis, lazy loading, Lighthouse)
- [ ] GitHub Actions CI: lint, typecheck, test, build
- [ ] README with screenshots, demo GIF, architecture diagram
- [ ] Deploy to Vercel
