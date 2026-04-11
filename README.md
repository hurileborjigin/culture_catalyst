# Culture Catalyst

## AI-Powered Inspiration-to-Proposal Assistant for Cultural Community Building

Culture Catalyst is an AI-powered assistant that transforms passive registered users into active contributors by dramatically reducing the friction of initiating cultural projects and event proposals.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Workflow](#workflow)
- [Architecture](#architecture)

---

## Overview

Many users possess ideas, resources, expertise, or motivation to contribute to cultural initiatives yet remain inactive due to lack of inspiration, confidence, structure, or understanding of the requirements to turn an idea into reality.

Culture Catalyst guides users through a seamless three-stage workflow:

1. **Inspire** users with personalized cultural opportunities and global success stories
2. **Develop** raw ideas into structured, realistic project concepts with comprehensive research
3. **Generate** polished event/project proposals ready for platform posting

---

## Features

### Phase 1: Inspiration Engine

- AI-powered personalized inspiration based on user profile (interests, profession, organization, location)
- Real-time web search for successful cultural events and initiatives worldwide
- Batch generation of 20 inspiration cards, displayed 4 at a time with shuffle functionality
- Save favorite inspirations for later development

### Phase 2: Idea Development & Research

- Comprehensive multi-aspect research covering:
  - Event planning and logistics
  - Budget and funding strategies
  - Legal and regulatory requirements
  - Marketing and community engagement
  - Partnerships and collaborations
- **Full source attribution** - every insight includes clickable references to original sources
- Actionable insights and step-by-step guidance

### Phase 3: Proposal Generation

- Complete project proposal generation including:
  - Vision statement and goals
  - Detailed timeline with phases
  - Budget breakdown
  - Collaborator requirements with skills needed
  - Risk assessment and mitigation strategies
- User can input their existing resources and requirements
- Export-ready proposals for platform posting

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| LLM Provider | Azure OpenAI (GPT-5.2) |
| Web Search | Tavily API |
| State Management | React Context + SWR |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Azure OpenAI API access
- Tavily API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/hurileborjigin/culture_catalyst.git
cd culture_catalyst
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
bun install
```

3. Create environment file:

```bash
cp .env.local.example .env.local
```

4. Configure your environment variables (see below)

5. Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

The application includes 8 pre-configured demo accounts with diverse profiles for testing. All accounts use the password: `password123`

| Email | Name | Profile Focus |
|-------|------|---------------|
| maya.chen@techcorp.io | Maya Chen | Technology + Art Installations |
| james.okonkwo@nonprofit.org | James Okonkwo | Youth Empowerment + Social Impact |
| sofia.rodriguez@university.edu | Sofia Rodriguez | Academic Research + Environmental Art |
| alex.thompson@gallery.com | Alex Thompson | Contemporary Art + Gallery Curation |
| priya.sharma@startup.co | Priya Sharma | Food Culture + Entrepreneurship |
| marcus.johnson@theater.org | Marcus Johnson | Theater + Social Justice |
| emma.liu@museum.gov | Emma Liu | Museums + Public History |
| david.kim@agency.com | David Kim | Urban Design + Public Art |

Each profile includes:
- Professional background and organization
- Interests and skills
- Location information
- Bio describing their expertise

The user profiles are stored in `data/users.json` and are used by the AI to generate personalized inspiration cards and research.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# LLM Provider - Azure OpenAI
SYNAPSE_LLM_MODEL=gpt-5.2
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-06-01

# Search APIs
TAVILY_API_KEY=your_tavily_api_key
```

### Getting API Keys

#### Azure OpenAI

1. Go to [Azure Portal](https://portal.azure.com)
2. Create an Azure OpenAI resource
3. Deploy your model (e.g., gpt-5.2)
4. Copy the API key and endpoint from the "Keys and Endpoint" section

#### Tavily

1. Sign up at [Tavily](https://tavily.com)
2. Get your API key from the dashboard

---

## Project Structure

```
culture_catalyst/
├── app/
│   ├── api/
│   │   ├── inspiration/
│   │   │   └── route.ts          # Inspiration generation API
│   │   ├── ideas/
│   │   │   └── [id]/
│   │   │       └── analyze/
│   │   │           └── route.ts  # Idea research API
│   │   └── proposals/
│   │       └── [id]/
│   │           └── generate/
│   │               └── route.ts  # Proposal generation API
│   ├── dashboard/
│   │   ├── inspiration/
│   │   │   └── page.tsx          # Inspiration discovery page
│   │   ├── develop/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Idea development page
│   │   └── proposals/
│   │       └── new/
│   │           └── page.tsx      # Proposal generation page
│   └── layout.tsx
├── components/
│   └── ui/                       # shadcn/ui components
├── contexts/
│   └── auth-context.tsx          # Authentication context
├── lib/
│   ├── services/
│   │   ├── azure-openai.ts       # Azure OpenAI service
│   │   └── tavily-search.ts      # Tavily search service
│   ├── api.ts                    # API utilities
│   └── utils.ts                  # Helper functions
├── data/
│   └── users.json                # Sample user profiles
├── types/
│   └── index.ts                  # TypeScript type definitions
└── .env.local.example            # Environment template
```

---

## API Reference

### POST `/api/inspiration`

Generates personalized inspiration cards based on user profile.

**Request Body:**

```json
{
  "userProfile": {
    "name": "John Doe",
    "interests": ["music", "community building", "sustainability"],
    "professionalBackground": "Event Manager",
    "organization": "City Arts Council",
    "workplace": "Downtown Cultural Center",
    "location": "San Francisco, CA",
    "skills": ["project management", "budgeting", "marketing"]
  },
  "sessionId": "optional-existing-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "session_abc123",
    "cards": [...],           // Array of 20 InspirationCard objects
    "currentIndex": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "currentCards": [...]       // Current 4 cards to display
}
```

---

### POST `/api/ideas/[id]/analyze`

Performs comprehensive research on an idea with source citations.

**Request Body:**

```json
{
  "idea": {
    "title": "Community Music Festival",
    "description": "A weekend outdoor music festival celebrating local artists..."
  },
  "userProfile": {
    "name": "John Doe",
    "interests": ["music", "community building"],
    "professionalBackground": "Event Manager"
  }
}
```

**Response:**

```json
{
  "success": true,
  "research": {
    "id": "research_xyz789",
    "ideaId": "idea_123",
    "sections": [
      {
        "aspect": "Event Planning",
        "title": "Planning Your Community Music Festival",
        "content": "Based on successful festivals like...",
        "keyInsights": ["Start planning 6-12 months ahead", ...],
        "actionItems": ["Secure venue permits", ...],
        "sources": [
          {
            "title": "Festival Planning Guide 2024",
            "url": "https://example.com/guide",
            "content": "...",
            "relevantQuote": "Early venue booking is critical..."
          }
        ]
      }
    ],
    "summary": "Your community music festival has strong potential...",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### POST `/api/proposals/[id]/generate`

Generates a complete project proposal.

**Request Body:**

```json
{
  "idea": {
    "title": "Community Music Festival",
    "description": "A weekend outdoor music festival..."
  },
  "research": { ... },              // Research from Phase 2
  "userProfile": { ... },
  "requirements": {
    "hasVenue": true,
    "hasFunding": false,
    "hasTeam": false,
    "budget": "$10,000 - $25,000",
    "timeline": "6 months",
    "additionalNotes": "Have partnership with local radio station"
  }
}
```

**Response:**

```json
{
  "success": true,
  "proposal": {
    "title": "Harmony in the Park: Community Music Festival 2024",
    "visionStatement": "To create an inclusive celebration...",
    "goals": ["Unite 500+ community members", ...],
    "culturalImpact": "This festival will strengthen...",
    "timeline": {
      "duration": "6 months",
      "phases": [
        {
          "name": "Planning & Permits",
          "duration": "2 months",
          "tasks": ["Finalize venue agreement", ...]
        }
      ]
    },
    "budget": {
      "total": "$18,500",
      "breakdown": [
        {
          "category": "Venue & Equipment",
          "amount": "$5,000",
          "description": "Stage rental, sound system..."
        }
      ]
    },
    "collaboratorsNeeded": [
      {
        "role": "Sound Engineer",
        "skills": ["audio mixing", "live sound"],
        "priority": "required",
        "count": 2
      }
    ],
    "resources": ["PA system", "Stage", ...],
    "challengesAndMitigation": [
      {
        "challenge": "Weather dependency",
        "mitigation": "Reserve indoor backup venue..."
      }
    ],
    "nextSteps": ["Post proposal to platform", ...]
  }
}
```

---

## Workflow

### User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CULTURE CATALYST                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INSPIRATION                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ User Profile│───▶│ LLM: Generate│───▶│ Tavily: Web Search     │  │
│  │ Analysis    │    │ Search Queries│   │ for Success Stories    │  │
│  └─────────────┘    └─────────────┘    └───────────┬─────────────┘  │
│                                                     │                │
│                     ┌───────────────────────────────��──────────────┐ │
│                     │ LLM: Generate 20 Inspiration Cards           │ │
│                     │ (Show 4 at a time, shuffle for more)         │ │
│                     └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ User selects inspiration or adds own idea
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: IDEA DEVELOPMENT                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ Idea Input  │───▶│ LLM: Generate│───▶│ Tavily: Multi-aspect   │  │
│  │             │    │ Research     │    │ Research Search        │  │
│  │             │    │ Topics       │    │                        │  │
│  └─────────────┘    └─────────────┘    └───────────┬─────────────┘  │
│                                                     │                │
│                     ┌───────────────────────────────▼──────────────┐ │
│                     │ LLM: Synthesize Research with Sources        │ │
│                     │ • Key Insights    • Action Items             │ │
│                     │ • Source Citations (clickable links)         │ │
│                     └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ User inputs their requirements
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: PROPOSAL GENERATION                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Inputs: Idea + Research + User Profile + Requirements           │ │
│  └───────────────────────────────┬─────────────────────────────────┘ │
│                                  │                                   │
│                                  ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ LLM: Generate Complete Project Proposal                         │ │
│  │ • Vision & Goals      • Timeline & Phases                       │ │
│  │ • Budget Breakdown    • Collaborators Needed                    │ │
│  │ • Risk Mitigation     • Next Steps                              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────���─────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  PUBLISH TO PLATFORM    │
                    └─────────────────────────┘
```

---

## Architecture

### Backend Services

#### Azure OpenAI Service (`lib/services/azure-openai.ts`)

Core LLM integration providing:

- `generateSearchQueries()` - Analyzes user profile to create targeted search queries
- `generateInspirationCards()` - Creates personalized inspiration from search results
- `generateResearchTopics()` - Identifies research aspects for idea development
- `synthesizeResearch()` - Compiles research with proper source citations
- `generateProposal()` - Creates comprehensive project proposals

#### Tavily Search Service (`lib/services/tavily-search.ts`)

Web search integration providing:

- `search()` - Single query search with configurable options
- `searchMultiple()` - Batch search across multiple queries
- `searchForInspiration()` - Specialized search for cultural events and success stories
- `searchForResearch()` - Deep research search with comprehensive results

### Data Flow

1. **User Profile** → Used throughout all phases for personalization
2. **Inspiration Cards** → Stored in session (20 cards, paginated display)
3. **Research Data** → Includes full source URLs for transparency
4. **Proposals** → Complete, structured documents ready for export

---

## Problem Statement

Although cultural platforms have existing user bases, many users remain passive due to:

- Lack of inspiration or awareness of possible cultural initiatives
- Uncertainty in developing ideas into feasible plans
- Concerns about feasibility, logistics, regulations, or funding
- Difficulty structuring or communicating ideas effectively
- Intimidation by the complexity of organizing cultural activities

Culture Catalyst addresses all these barriers through AI-powered guidance.

---

## Expected Impact

- **Increased User Activation**: Users feel genuinely motivated and empowered
- **Higher Proposal Volume**: More ideas become posted opportunities
- **Better Proposal Quality**: Structured, detailed, realistic, and actionable posts
- **Stronger Community Building**: Higher-quality proposals drive more meaningful collaborations

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.
