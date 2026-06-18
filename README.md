<div align="center">

# ⚡ Relvion AI

### A Superhuman-style Gmail & Google Calendar workspace, rebuilt from the ground up on Corsair

Live Gmail and Google Calendar — wired through Corsair, triaged by Gemini, searched in milliseconds via pgvector, and operated entirely through an MCP-powered chat agent.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Corsair](https://img.shields.io/badge/Powered%20by-Corsair-7c3aed)](https://corsair.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**🔗 Live Demo**](#) · [**https://youtu.be/wXLZzgy3WjE?si=VM7eEKIRq94Ju0t-**](#) · [**🐦 X/Twitter Post**](#) · [**💼 LinkedIn Post**](#)

</div>

<br/>

> 🚧 **Note for reviewers:** the links above are placeholders and will be filled in before final submission.

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Feature Tour](#-feature-tour)
- [Why It's Faster Than Gmail](#-why-its-faster-than-gmail)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Corsair Features Used](#-corsair-features-used)
- [Bonus Tasks Implemented](#-bonus-tasks-implemented)
- [Getting Started](#-getting-started)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Submission Checklist](#-submission-checklist)
- [License](#-license)

---

## 🧩 The Problem

Gmail and Google Calendar are built to work for *everyone*, which means they're optimized for *no one* in particular. A handful of frustrations stack up every single day:

- Sending a calendar invite takes far more clicks than it should.
- Searching your inbox properly means learning Gmail's operator syntax — and it's still slow.
- Triaging what's actually urgent vs. what can wait is manual, repetitive work.
- Doing two related things — like emailing someone *and* scheduling time with them — means switching contexts entirely.

Corsair gives developers the building blocks to wire any app into Gmail, Calendar, and hundreds of other integrations — including full agent access via MCP. **Relvion AI** uses those building blocks to build the inbox we actually want.

## 💡 The Solution

Relvion AI is not a Gmail clone — it's a opinionated rebuild of the email + calendar workflow, with AI doing real work at every layer:

| Instead of... | Relvion AI gives you... |
|---|---|
| Manually scanning every subject line | An **AI priority inbox** — every email triaged as `URGENT` / `IMPORTANT` / `FYI` the moment it lands |
| Gmail's slow, syntax-heavy search | **Sub-second semantic + operator search** across a local pgvector + Corsair cache |
| Clicking through 8+ screens to send an invite | Typing **"Schedule a call with Aryan Friday at 5pm and email him about it"** into the agent sidebar |
| Polling your inbox for new mail | **Realtime webhook → SSE pipeline** that pushes new emails and calendar changes the instant they happen |
| Reaching for the mouse for everything | A full **keyboard-first, Superhuman-style shortcut system** with a command palette |

Every one of these is wired to **live Gmail and Calendar data through Corsair** — nothing here is mocked, hardcoded, or a static demo.

## 🎬 Feature Tour

<table>
<tr>
<td width="50%" valign="top">

### 📥 Smart Inbox
- Live list, read, send, reply, archive, trash, star, and draft for Gmail
- Snooze emails to reappear later
- Reusable email templates suggested by the agent
- Contact-aware priority boosting (frequent senders rank higher automatically)

</td>
<td width="50%" valign="top">

### 📅 Calendar, Reimagined
- Create, update, and delete events with full attendee invite support
- Natural-language event creation via the agent ("next Thursday at 9am")
- Realtime sync when events change on Google's side

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🤖 Agent Sidebar (MCP)
- Built on Corsair's MCP `AnthropicProvider`, driven by Gemini function-calling
- Can read, send, draft, and schedule on your behalf in one message
- Validates every action — never reports success on a failed call

</td>
<td width="50%" valign="top">

### ⚡ Instant Search
- Gmail advanced operators (`is:unread`, `has:attachment`, etc.) parsed and routed intelligently
- Falls back to Corsair's local DB cache, then pgvector semantic search, then the live Gmail API
- Calendar events included in the same unified search

</td>
</tr>
</table>

## 📊 Why It's Faster Than Gmail

| Action | Gmail | Relvion AI |
|---|---|---|
| Schedule a meeting + notify someone | ~8 clicks across two apps | 1 chat message to the agent |
| Find out what's urgent | Scroll and read everything | Pre-sorted on arrival, before you open the inbox |
| Search your mail | Slow, syntax-dependent API search | Local cache + vector search, < 1 second |
| Know about a new email | Refresh / wait for Gmail's own sync | Pushed to you instantly via webhook → SSE |
| Navigate the inbox | Mouse-driven | `G then I/C/S/D/T`, `C` to compose, `/` to search |

## 🏗️ Architecture

```
                ┌─────────────────────────┐
                │   Google (Gmail + Cal)  │
                └────────────┬────────────┘
                             │ OAuth2 + Webhooks
                             ▼
                ┌─────────────────────────┐
                │         Corsair         │  ← @corsair-dev/gmail
                │  (integration layer +   │  ← @corsair-dev/googlecalendar
                │   webhook hooks + MCP)  │  ← @corsair-dev/mcp
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
 ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
 │  Next.js    │     │  Webhook      │     │   Agent Chat      │
 │  API Routes │     │  Processor    │     │  (Gemini + MCP    │
 │  (Gmail /   │     │  → Gemini     │     │   tool-calling)   │
 │  Calendar)  │     │    triage     │     └──────────────────┘
 └──────┬──────┘     │  → embeddings │
        │             │  → SSE push   │
        ▼             └──────┬───────┘
 ┌─────────────────────────────────────┐
 │     PostgreSQL + pgvector            │
 │  corsair_entities · corsair_events   │
 │  email_embeddings (IVFFlat index)    │
 │  activity log · contacts · templates │
 └───────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion |
| Database | PostgreSQL + `pgvector` |
| Integrations | Corsair · `@corsair-dev/gmail` · `@corsair-dev/googlecalendar` |
| Agent / MCP | `@corsair-dev/mcp` (`AnthropicProvider`) + Gemini function-calling |
| AI | Google Gemini 2.5 Flash (triage, agent) + `text-embedding-004` (semantic search) |
| Auth | Custom session auth + Google OAuth2 |
| Testing | Vitest |

## 🔌 Corsair Features Used

| Package / Surface | Operations Used |
|---|---|
| `@corsair-dev/gmail` | `messages.list`, `messages.get`, `messages.send`, `messages.modify`, `messages.trash`, `drafts.create`, `drafts.update`, `users.watch`, `labels.list`, `users.getProfile` |
| `@corsair-dev/googlecalendar` | `events.getMany`, `events.create`, `events.update`, `events.delete`, `channels.watch` |
| Corsair Postgres cache | `corsair_entities`, `corsair_events` — synced Gmail/Calendar data for fast local reads |
| Corsair webhook hooks | `messageChanged` (triage + SSE broadcast), `onEventChanged` (calendar refresh) |
| `@corsair-dev/mcp` | Agent tools — `list_operations`, `get_schema`, `run_script` |
| `@corsair-dev/cli` / `@corsair-dev/studio` | OAuth credential setup and management |

## 🎁 Bonus Tasks Implemented

| # | Bonus Task | Status | Where |
|---|---|---|---|
| 1 | **Corsair MCP agent chat** | ✅ | `src/app/api/agent/chat/route.ts` + agent sidebar UI |
| 2 | **Realtime webhooks** (no polling) | ✅ | `src/app/api/webhooks/*` + hooks in `src/server/corsair.ts` |
| 3 | **LLM-based priority filtering** | ✅ | Gemini triage in `gmailWebhookProcessor.ts` + `/api/gmail/triage` |
| 4 | **Keyboard shortcuts + command palette** | ✅ | `useKeyboardShortcuts.ts` + `CommandPalette.tsx` |
| 5 | **Corsair search API for advanced Gmail search** | ✅ | `gmail-search-parser.ts` + `/api/search/vector` |
| 6 | **Vector DB for sub-1-second local search** | ✅ | `email_embeddings` table + IVFFlat index in `migration.sql` |

All six bonus tasks from the brief were attempted — none were skipped.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL with the [pgvector](https://github.com/pgvector/pgvector) extension
- A Google Cloud project with the Gmail API and Calendar API enabled
- A Gemini API key
- Corsair OAuth credentials for Gmail and Calendar

### 1. Clone and install
```bash
git clone https://github.com/Ayush-Panda-design/Relvion-AI.git
cd Relvion-AI
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Generate a Corsair encryption key:
```bash
openssl rand -base64 32
```

### 3. Migrate the database
```bash
psql $DATABASE_URL -f migration.sql
```
This sets up Corsair's core tables, pgvector embeddings, the activity log, and app tables.

### 4. Configure Corsair integrations
```bash
npx corsair setup --plugin=gmail client_id=YOUR_ID client_secret=YOUR_SECRET
npx corsair setup --plugin=googlecalendar client_id=YOUR_ID client_secret=YOUR_SECRET

npx corsair auth --plugin=gmail
npx corsair auth --plugin=googlecalendar
```
Or use Corsair Studio:
```bash
npx corsair ui
```

### 5. Run the app
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 6. Enable realtime webhooks (optional, for local dev)
Google requires a public HTTPS URL to deliver webhooks:
```bash
npx ngrok http 3000
```
Add to `.env.local`:
```env
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.app
GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT/topics/gmail-push
```
Then register via **Settings → Register Webhooks**, or:
```bash
npm run register-webhooks
```
> Re-register roughly every 6 days — Google watches expire after 7.

## ⌨️ Keyboard Shortcuts

| Keys | Action |
|---|---|
| `⌘/Ctrl + K` or `/` | Open command palette |
| `?` | Show this cheat sheet |
| `G` then `I` | Go to inbox |
| `G` then `C` | Go to calendar |
| `G` then `S` | Go to sent |
| `G` then `T` | Go to trash |
| `G` then `E` | Go to settings |
| `G` then `A` | Go to analytics |
| `C` | Compose a new email |
| `E` | Archive selected email |
| `#` | Trash selected email |
| `S` | Star selected email |
| `R` | Reply to selected email |
| `Esc` | Close detail view |

## 📡 API Reference

```
Gmail
  GET    /api/gmail/list           List emails by folder
  GET    /api/gmail/message/[id]   Read a single message
  POST   /api/gmail/send           Send an email
  POST   /api/gmail/reply          Reply within a thread
  POST   /api/gmail/draft          Create / update a draft
  POST   /api/gmail/action         Archive, trash, star, mark read
  GET    /api/gmail/triage         Run AI priority triage
  GET    /api/gmail/counts         Per-folder unread counts
  GET    /api/gmail/thread/[id]    Full thread view

Calendar
  GET    /api/calendar/list        List upcoming events
  POST   /api/calendar/create      Create an event (+ invites)
  PUT    /api/calendar/update      Update an event
  DELETE /api/calendar/delete      Delete an event

Search & Realtime
  GET    /api/search/vector        Unified semantic + operator search
  GET    /api/events               SSE realtime event stream
  *      /api/webhooks/*           Gmail / Calendar webhook receivers

Agent & Analytics
  POST   /api/agent/chat           MCP-powered natural language agent
  GET    /api/analytics            Live usage metrics
```

## 🗂️ Project Structure

```
Relvion-AI/
├── migration.sql              # Postgres + pgvector schema
├── scripts/                   # Corsair setup & webhook registration scripts
├── src/
│   ├── app/
│   │   ├── (workspace)/        # Inbox, calendar, analytics, settings UI
│   │   └── api/                # Gmail, Calendar, Agent, Search, Webhooks
│   ├── components/             # UI: EmailList, CommandPalette, AgentPanel, etc.
│   ├── hooks/                  # useKeyboardShortcuts, and more
│   ├── lib/                    # DB client, Gmail parsing, search parser
│   └── server/
│       ├── corsair.ts          # Corsair client + webhook hooks
│       ├── agent/              # MCP agent streaming logic
│       └── services/           # Webhook processor, contacts, snooze
└── README.md
```

## ✅ Submission Checklist

- [x] Code open source on GitHub
- [ ] Deployed live link — *add before submitting*
- [ ] Demo video (YC-style: problem → solution → demo → tech stack → Corsair/Gmail/Calendar usage) — *add before submitting*
- [ ] X/Twitter post (tagged `@ChaiCodeHQ`, `@Hiteshdotcom`, `@piyushgarg_dev`, `@corsairdotdev`) — *add before submitting*
- [ ] LinkedIn post — *add before submitting*
- [x] Short README (this file)
- [x] List of Corsair features used (above)
- [x] List of bonus tasks attempted (above)

---

<div align="center">

**Builder Mode On | MacBook Giveaway Hackathon**

`#chaicode` `#corsair-dev`

</div>

## 📄 License

MIT — see [LICENSE](LICENSE).
