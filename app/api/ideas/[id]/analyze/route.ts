import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import { tavilySearch } from "@/lib/services/tavily-search";
import type { ResearchSection, UserProfile } from "@/types";

/**
 * POST /api/ideas/[id]/analyze
 * Perform comprehensive research on an idea to help make it happen
 * 
 * Body:
 * - idea: { title, description, category }
 * - forceRefresh: boolean - regenerate even if cached
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;
    const body = await request.json();
    const { idea, forceRefresh } = body as {
      idea: {
        title: string;
        description: string;
        category: string;
      };
      forceRefresh?: boolean;
    };

    if (!idea || !idea.title || !idea.description) {
      return NextResponse.json(
        { error: "Idea with title and description is required" },
        { status: 400 }
      );
    }

    // Check for existing research first
    if (!forceRefresh) {
      const { data: existingResearch } = await supabase
        .from("idea_research")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingResearch) {
        return NextResponse.json({
          success: true,
          ideaId,
          research: {
            sections: existingResearch.sections as ResearchSection[],
            summary: existingResearch.summary,
          },
          cached: true,
          generatedAt: existingResearch.created_at,
        });
      }
    }

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const userProfile: UserProfile = {
      name: profile?.name || user.email?.split("@")[0] || "User",
      interests: profile?.interests || [],
      professionalBackground: profile?.professional_background,
      organization: profile?.organization,
      location: profile?.location,
      skills: profile?.skills,
    };

    console.log("[Idea Analysis] Starting research for:", idea.title);

    // Step 1: Generate research topics
    console.log("[Idea Analysis] Generating research topics...");
    const researchTopics = await azureOpenAI.generateResearchTopics(idea, userProfile);
    console.log("[Idea Analysis] Generated", researchTopics.topics.length, "research topics");

    // Step 2: Perform web searches for each topic
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
        6
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

    // Step 3: Synthesize research results
    const synthesis = await azureOpenAI.synthesizeResearch(idea, researchResults);
    console.log("[Idea Analysis] Research synthesis complete");

    // First, ensure the idea exists in the database
    const { data: existingIdea } = await supabase
      .from("ideas")
      .select("id")
      .eq("id", ideaId)
      .eq("user_id", user.id)
      .single();

    let actualIdeaId = ideaId;

    // If idea doesn't exist, create it
    if (!existingIdea) {
      const { data: newIdea, error: ideaError } = await supabase
        .from("ideas")
        .insert({
          user_id: user.id,
          title: idea.title,
          description: idea.description,
          status: "researched",
        })
        .select()
        .single();

      if (ideaError) {
        console.error("Error creating idea:", ideaError);
        // Continue without persisting to database
      } else {
        actualIdeaId = newIdea.id;
      }
    } else {
      // Update existing idea status
      await supabase
        .from("ideas")
        .update({ status: "researched", updated_at: new Date().toISOString() })
        .eq("id", ideaId);
    }

    // Save research to database
    const { data: savedResearch, error: researchError } = await supabase
      .from("idea_research")
      .insert({
        idea_id: actualIdeaId,
        user_id: user.id,
        sections: synthesis.sections,
        summary: synthesis.summary,
      })
      .select()
      .single();

    if (researchError) {
      console.error("Error saving research:", researchError);
    }

    return NextResponse.json({
      success: true,
      ideaId: actualIdeaId,
      research: {
        sections: synthesis.sections,
        summary: synthesis.summary,
      },
      cached: false,
      generatedAt: savedResearch?.created_at || new Date().toISOString(),
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;

    const { data: research, error } = await supabase
      .from("idea_research")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !research) {
      return NextResponse.json({
        success: true,
        ideaId,
        research: null,
        message: "No research available. Use POST to generate research.",
      });
    }

    return NextResponse.json({
      success: true,
      ideaId,
      research: {
        sections: research.sections as ResearchSection[],
        summary: research.summary,
      },
      cached: true,
      generatedAt: research.created_at,
    });
  } catch (error) {
    console.error("Get research error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
