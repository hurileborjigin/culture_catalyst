# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Culture Catalyst is an AI-powered inspiration-to-proposal assistant built with Next.js 16 (App Router). It guides users through a three-phase workflow: discovering cultural inspiration, developing ideas, and generating polished proposals. The frontend is largely scaffolded; backend API routes are stubbed with TODOs for actual AI agent and database integration.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Next.js ESLint
```

Package manager is pnpm. No test framework is configured yet.

## Architecture

### Three-Phase Workflow

1. **Inspiration** (`app/dashboard/inspiration/`) — personalized cultural event recommendations, designed for AI agent integration
2. **Develop** (`app/dashboard/develop/`) — idea creation and structured development with status tracking (draft → in-development → ready-for-proposal)
3. **Proposals** (`app/dashboard/proposals/`) — proposal generation from developed ideas with budget, timeline, and collaborator tracking

### Key Patterns

- **API Client** (`lib/api.ts`): Centralized client with namespaced endpoint groups (`authApi`, `inspirationApi`, `ideasApi`, `proposalsApi`, `agentsApi`). All use a shared `apiRequest<T>()` helper.
- **Auth**: Token-based via localStorage, managed through React Context (`contexts/auth-context.tsx`). Protected routes check auth state client-side.
- **Data Fetching**: SWR with a provider in `contexts/swr-provider.tsx` and custom hooks in `lib/hooks.ts`.
- **UI Components**: shadcn/ui (Radix UI primitives) in `components/ui/`. Layout components (Header, Footer) in `components/layout/`.
- **Types**: All shared TypeScript types live in `types/index.ts` — `User`, `InspirationCard`, `IdeaConcept`, `PlanningWorkflow`, `Proposal`, `WorkflowSession`, `AgentTask`.
- **Path alias**: `@/*` maps to the project root.

### API Routes

All under `app/api/`. Auth endpoints (`auth/login`, `auth/register`, `auth/logout`, `auth/me`), plus CRUD for inspiration, ideas, and proposals. Agent-related endpoints exist for AI orchestration (inspiration generation, planning, budget analysis, compliance, proposal generation).

### Styling

Tailwind CSS v4 with global styles in `app/globals.css`. Uses `clsx` + `tailwind-merge` via the `cn()` utility in `lib/utils.ts`.
