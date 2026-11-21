# Lumen

**A simple notes app that will grow into your AI-powered second brain.**

Lumen is a website where you can write and save your notes, like a small
version of Notion. You can make an account, create notes, and they save on
their own while you type. Next, AI will be added so it can help you write,
find old notes, and answer questions using your own notes.

> Status: still being built. See the [roadmap](./docs/ROADMAP.md) for what is done and what is next.

---

## What you can do right now

### 1. Make an account and log in

- Sign up with your email and a password (at least 6 characters).
- Log in again any time to see your notes.
- Your notes are private. Only you can see them, because the database
  checks every request.

### 2. Write notes

- Click **New note** to create a note. It shows up in the sidebar on the left.
- Give it a title and start writing.
- Use the toolbar to style your text:
  - **Bold**, _italic_ and ~~strikethrough~~
  - Headings (big, medium and small)
  - Bullet lists and numbered lists
  - Quotes and code blocks
- Keyboard shortcuts work too, for example `⌘B` for bold and `⌘I` for italic.

### 3. Autosave

- You never need to press "Save". The note saves by itself a moment after
  you stop typing.
- A small label at the top tells you what is happening: **Saving…**, **Saved**,
  or an error if something went wrong.

### 4. Manage your notes

- All your notes are listed in the sidebar.
- Open any note with one click.
- Delete a note from its menu (the three-dot button).

### 5. Explore section (on the notes home page)

- **Quiz:** answer random questions one at a time. You see right or wrong
  after each answer and your score at the end. Every round gives you a new
  set of questions.
- **Templates:** pick a ready-made note design and Lumen creates a new note
  already filled with it. There are 12 templates, including Meeting notes,
  Daily journal, To-do list, Project plan, Weekly review, Study notes, Book
  notes, Brainstorm, Recipe, Travel planner, Goal setting and Bug report.
  The gallery is shuffled each time you open it.
- **Daily quote:** opens a popup with a random inspiring quote. Click
  "Another quote" for a new one, or close it.

### 6. Works everywhere

- Works on phone, tablet and computer screens.
- Light and dark theme, which follows your device setting.

---

## Coming soon (AI features)

These are planned and not built yet:

- **AI writing help:** select text and ask AI to improve it, fix grammar,
  make it shorter or longer, change the tone, translate it, or keep writing.
- **Smart titles and tags:** AI suggests a title, tags and a short summary
  for each note.
- **Smart search (`⌘K`):** search your notes by meaning, not only by exact
  words. For example, searching "money plans" can find a note called "Budget 2026".
- **Chat with your notes:** ask a question and AI answers using your own
  notes, with links to the notes it used.
- **Related notes:** see other notes on the same topic at the bottom of a note.
- **Nested pages, favorites, trash and drag-and-drop** to organise notes.
- **Login with a magic link or GitHub.**

---

## Tech stack

| Area      | Tools                                                    |
| --------- | -------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript            |
| UI        | Tailwind CSS 4, shadcn/ui (Radix), Lucide icons          |
| Editor    | Tiptap                                                   |
| State     | TanStack Query (server state), Zustand (UI state)        |
| Backend   | Supabase: Postgres, Auth, Row Level Security             |
| AI (next) | Vercel AI SDK + Google Gemini, pgvector                  |
| Quality   | ESLint, Prettier, Vitest, Husky, lint-staged, commitlint |

Every service runs on a **free plan with no credit card**.

---

## How to run it on your computer

### 1. What you need

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) project (for login and the database)
- A free [Google AI Studio](https://aistudio.google.com/apikey) API key (for the AI features)

### 2. Install

```bash
npm install
cp .env.example .env.local   # then fill in your keys
```

### 3. Create the database tables

In the Supabase dashboard open **SQL Editor → New query**, paste everything from
[`supabase/migrations/0001_notes.sql`](./supabase/migrations/0001_notes.sql) and click **Run**.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Useful commands

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Starts the app on your computer       |
| `npm run build`     | Builds the app for production         |
| `npm run lint`      | Checks the code for common mistakes   |
| `npm run typecheck` | Checks TypeScript types               |
| `npm run format`    | Formats the code neatly with Prettier |

## More docs

- [Architecture](./docs/ARCHITECTURE.md): how the app is built and why
- [Roadmap](./docs/ROADMAP.md): the step-by-step build plan and progress

## Commit convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
and commitlint checks them on every commit:
`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`, `chore:`, `ci:`, `perf:`, `build:`.
