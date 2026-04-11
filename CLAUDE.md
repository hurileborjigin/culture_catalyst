# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Culture Catalyst is an AI-powered Next.js application that transforms users into cultural project contributors through a three-phase workflow: **Inspire → Develop → Generate**. Users discover personalized cultural inspirations, research and develop ideas, then generate complete project proposals.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run Next.js linting
```

Package manager is **pnpm** — do not use npm or yarn.

## Architecture

**Next.js 16 App Router** with TypeScript, Tailwind CSS 4.2, and shadcn/ui components. Backend is Supabase (PostgreSQL + Auth). LLM calls go through Azure OpenAI (GPT-5.2). Web search uses Tavily API.

### Three-Phase Pipeline

1. **Inspiration** (`app/api/inspiration/`, `app/dashboard/inspiration/`): LLM generates search queries from user profile → Tavily searches → LLM creates 20 inspiration cards per session → UI displays 4 at a time with shuffle
2. **Development** (`app/api/ideas/[id]/analyze/`, `app/dashboard/develop/`): LLM identifies 8 research topics → Tavily searches each → LLM synthesizes with source citations
3. **Proposal** (`app/api/proposals/[id]/generate/`, `app/dashboard/proposals/`): LLM generates complete proposal (vision, goals, timeline, budget, collaborators, risks)

### Core Services

- `lib/services/azure-openai.ts` — All LLM interactions: `generateSearchQueries()`, `generateInspirationCards()`, `generateResearchTopics()`, `synthesizeResearch()`, `generateProposal()`, `generateStructuredOutput()`
- `lib/services/tavily-search.ts` — Web search: `search()`, `searchMultiple()`, `searchForInspiration()`, `searchForResearch()`
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/server.ts` — Server Supabase client (uses cookies)
- `lib/supabase/middleware.ts` — Auth session refresh middleware
- `lib/api.ts` — Centralized frontend API client
- `lib/hooks.ts` — Custom React hooks (SWR-based data fetching)
- `contexts/auth-context.tsx` — React Context for auth state + user profile

### Authentication Flow

Supabase Auth with JWT. `middleware.ts` at project root protects `/dashboard/*` routes. `AuthContext` provides user + profile state app-wide. RLS policies on all tables enforce per-user data isolation. Auto-creates profile on signup via database trigger.

### Database Schema

SQL migrations in `scripts/` (001-004). Tables: `profiles`, `inspiration_sessions`, `inspiration_cards`, `ideas` (status: draft → researched → proposal_created), `idea_research` (JSONB sections with source citations), `proposals`.

### Type Definitions

All shared types in `types/index.ts` — Profile, Inspiration, Idea, IdeaResearch, Proposal, and related interfaces.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_VERSION`, `SYNAPSE_LLM_MODEL` — Azure OpenAI
- `TAVILY_API_KEY` — Tavily web search

## Key Patterns

- Research and proposals are cached in the database to avoid LLM regeneration
- Inspiration cards are batch-generated (20 per session) and paginated client-side (4 at a time)
- All research includes clickable source URLs for attribution
- Demo accounts available in `data/users.json` (password: `password123`)
- UI components in `components/ui/` follow shadcn/ui conventions
