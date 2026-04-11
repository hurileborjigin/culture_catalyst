import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import type { GeneratedProposal, ProposalRequirements, UserProfile, ResearchSection } from "@/types";

// In-memory storage for generated proposals (in production, use database)
const proposalCache = new Map<
  string,
  {
    proposal: GeneratedProposal;
    createdAt: Date;
  }
>();

// Reference to research cache (would be shared in production)
const researchCache = new Map<
  string,
  {
    sections: ResearchSection[];
    summary: string;
    createdAt: Date;
  }
>();

/**
 * POST /api/proposals/[id]/generate
 * Generate a comprehensive project proposal based on:
 * - Idea details
 * - Research synthesis (from step 2)
 * - User profile
 * - User's available requirements (what they already have)
 * 
 * Body:
 * - idea: { title, description, category }
 * - userProfile: { name, interests, professionalBackground, organization }
 * - requirements: { hasVenue, hasFunding, hasTeam, budget, timeline, additionalNotes }
 * - researchSummary: (optional) pre-computed research if available
 * - forceRefresh: boolean
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      idea, 
      userProfile, 
      requirements, 
      researchSummary,
      forceRefresh 
    } = body as {
      idea: {
        title: string;
        description: string;
        category: string;
      };
      userProfile?: UserProfile;
      requirements?: ProposalRequirements;
      researchSummary?: {
        sections: Array<{
          aspect: string;
          title: string;
          content: string;
          keyInsights: string[];
          actionItems: string[];
        }>;
        summary: string;
      };
      forceRefresh?: boolean;
    };

    if (!idea || !idea.title || !idea.description) {
      return NextResponse.json(
        { error: "Idea with title and description is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `proposal_${id}`;
    if (!forceRefresh && proposalCache.has(cacheKey)) {
      const cached = proposalCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        proposalId: id,
        proposal: cached.proposal,
        cached: true,
        generatedAt: cached.createdAt.toISOString(),
      });
    }

    console.log("[Proposal Generation] Starting for:", idea.title);

    // Get research synthesis if not provided
    let research = researchSummary;
    if (!research) {
      const researchCacheKey = `research_${id}`;
      if (researchCache.has(researchCacheKey)) {
        const cachedResearch = researchCache.get(researchCacheKey)!;
        research = {
          sections: cachedResearch.sections.map((s) => ({
            aspect: s.aspect,
            title: s.title,
            content: s.content,
            keyInsights: s.keyInsights,
            actionItems: s.actionItems,
          })),
          summary: cachedResearch.summary,
        };
      } else {
        // Create a minimal research summary if none exists
        research = {
          sections: [],
          summary: `Research pending for: ${idea.title}`,
        };
      }
    }

    console.log("[Proposal Generation] Using research with", research.sections.length, "sections");

    // Generate the proposal using LLM
    console.log("[Proposal Generation] Generating proposal...");
    const generatedProposal = await azureOpenAI.generateProposal(
      idea,
      research,
      userProfile || {
        name: "Project Organizer",
        interests: [],
      },
      requirements
    );

    console.log("[Proposal Generation] Proposal generated successfully");

    // Cache the proposal
    proposalCache.set(cacheKey, {
      proposal: generatedProposal,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      proposalId: id,
      proposal: generatedProposal,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Proposal generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate proposal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/proposals/[id]/generate
 * Get cached generated proposal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `proposal_${id}`;

    if (proposalCache.has(cacheKey)) {
      const cached = proposalCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        proposalId: id,
        proposal: cached.proposal,
        cached: true,
        generatedAt: cached.createdAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      proposalId: id,
      proposal: null,
      message: "No generated proposal available. Use POST to generate.",
    });
  } catch (error) {
    console.error("Get proposal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
