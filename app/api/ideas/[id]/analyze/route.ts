import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import { tavilySearch } from "@/lib/services/tavily-search";
import type { ResearchSection, UserProfile } from "@/types";

// In-memory storage for research results (in production, use database)
const researchCache = new Map<
  string,
  {
    sections: ResearchSection[];
    summary: string;
    createdAt: Date;
  }
>();

/**
 * POST /api/ideas/[id]/analyze
 * Perform comprehensive research on an idea to help make it happen
 * 
 * Body:
 * - idea: { title, description, category }
 * - userProfile: { name, interests, professionalBackground, location }
 * - forceRefresh: boolean - regenerate even if cached
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { idea, userProfile, forceRefresh } = body as {
      idea: {
        title: string;
        description: string;
        category: string;
      };
      userProfile?: UserProfile;
      forceRefresh?: boolean;
    };

    if (!idea || !idea.title || !idea.description) {
      return NextResponse.json(
        { error: "Idea with title and description is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `research_${id}`;
    if (!forceRefresh && researchCache.has(cacheKey)) {
      const cached = researchCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        ideaId: id,
        research: {
          sections: cached.sections,
          summary: cached.summary,
        },
        cached: true,
        generatedAt: cached.createdAt.toISOString(),
      });
    }

    console.log("[Idea Analysis] Starting research for:", idea.title);

    // Step 1: Generate research topics and search queries using LLM
    console.log("[Idea Analysis] Generating research topics...");
    const researchTopics = await azureOpenAI.generateResearchTopics(
      idea,
      userProfile || {
        name: "User",
        interests: [],
      }
    );

    console.log("[Idea Analysis] Generated", researchTopics.topics.length, "research topics");

    // Step 2: Perform web searches for each topic using Tavily
    console.log("[Idea Analysis] Searching for research sources...");
    const researchResults: Array<{
      aspect: string;
      sources: Array<{
        title: string;
        url: string;
        content: string;
      }>;
    }> = [];

    for (const topic of researchTopics.topics) {
      console.log(`[Idea Analysis] Researching: ${topic.aspect}`);
      
      const searchResult = await tavilySearch.searchForResearch(
        topic.aspect,
        topic.searchQueries,
        6 // Get top 6 sources per topic
      );

      researchResults.push({
        aspect: topic.aspect,
        sources: searchResult.sources.map((s) => ({
          title: s.title,
          url: s.url,
          content: s.content,
        })),
      });
    }

    console.log("[Idea Analysis] Completed searches, synthesizing results...");

    // Step 3: Synthesize research results into actionable guidance with sources
    const synthesis = await azureOpenAI.synthesizeResearch(idea, researchResults);

    console.log("[Idea Analysis] Research synthesis complete");

    // Cache the results
    researchCache.set(cacheKey, {
      sections: synthesis.sections,
      summary: synthesis.summary,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      ideaId: id,
      research: {
        sections: synthesis.sections,
        summary: synthesis.summary,
      },
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze idea",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ideas/[id]/analyze
 * Get cached research results for an idea
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `research_${id}`;

    if (researchCache.has(cacheKey)) {
      const cached = researchCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        ideaId: id,
        research: {
          sections: cached.sections,
          summary: cached.summary,
        },
        cached: true,
        generatedAt: cached.createdAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      ideaId: id,
      research: null,
      message: "No research available. Use POST to generate research.",
    });
  } catch (error) {
    console.error("Get research error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
