import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import type { GeneratedProposal, ProposalRequirements, UserProfile, ResearchSection } from "@/types";

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
 * - requirements: { hasVenue, hasFunding, hasTeam, budget, timeline, additionalNotes }
 * - researchSummary: (optional) pre-computed research if available
 * - forceRefresh: boolean
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
    const { 
      idea, 
      requirements, 
      researchSummary,
      forceRefresh 
    } = body as {
      idea: {
        title: string;
        description: string;
        category: string;
      };
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

    // Check for existing proposal first
    if (!forceRefresh) {
      const { data: existingProposal } = await supabase
        .from("proposals")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingProposal) {
        const proposal: GeneratedProposal = {
          title: existingProposal.title,
          visionStatement: existingProposal.vision_statement,
          goals: existingProposal.goals || [],
          culturalImpact: existingProposal.cultural_impact,
          timeline: existingProposal.timeline,
          budget: existingProposal.budget,
          collaboratorsNeeded: existingProposal.collaborators_needed || [],
          resources: existingProposal.resources || [],
          challengesAndMitigation: existingProposal.challenges_and_mitigation || [],
          nextSteps: existingProposal.next_steps || [],
        };

        return NextResponse.json({
          success: true,
          proposalId: existingProposal.id,
          proposal,
          cached: true,
          generatedAt: existingProposal.created_at,
        });
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const userProfile: UserProfile = {
      name: profile?.name || user.email?.split("@")[0] || "Project Organizer",
      interests: profile?.interests || [],
      professionalBackground: profile?.professional_background,
      organization: profile?.organization,
      location: profile?.location,
      skills: profile?.skills,
    };

    console.log("[Proposal Generation] Starting for:", idea.title);

    // Get research synthesis if not provided
    let research = researchSummary;
    if (!research) {
      const { data: ideaResearch } = await supabase
        .from("idea_research")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (ideaResearch) {
        const sections = ideaResearch.sections as ResearchSection[];
        research = {
          sections: sections.map((s) => ({
            aspect: s.aspect,
            title: s.title,
            content: s.content,
            keyInsights: s.keyInsights,
            actionItems: s.actionItems,
          })),
          summary: ideaResearch.summary || "",
        };
      } else {
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
      userProfile,
      requirements
    );

    console.log("[Proposal Generation] Proposal generated successfully");

    // Save proposal to database
    const { data: savedProposal, error: saveError } = await supabase
      .from("proposals")
      .insert({
        user_id: user.id,
        idea_id: ideaId,
        title: generatedProposal.title,
        vision_statement: generatedProposal.visionStatement,
        goals: generatedProposal.goals,
        cultural_impact: generatedProposal.culturalImpact,
        timeline: generatedProposal.timeline,
        budget: generatedProposal.budget,
        collaborators_needed: generatedProposal.collaboratorsNeeded,
        resources: generatedProposal.resources,
        challenges_and_mitigation: generatedProposal.challengesAndMitigation,
        next_steps: generatedProposal.nextSteps,
        requirements: requirements || null,
        status: "draft",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving proposal:", saveError);
    }

    // Update idea status
    await supabase
      .from("ideas")
      .update({ status: "proposal_created", updated_at: new Date().toISOString() })
      .eq("id", ideaId);

    return NextResponse.json({
      success: true,
      proposalId: savedProposal?.id || ideaId,
      proposal: generatedProposal,
      cached: false,
      generatedAt: savedProposal?.created_at || new Date().toISOString(),
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
 * Get generated proposal for an idea
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

    const { data: existingProposal, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !existingProposal) {
      return NextResponse.json({
        success: true,
        proposalId: ideaId,
        proposal: null,
        message: "No generated proposal available. Use POST to generate.",
      });
    }

    const proposal: GeneratedProposal = {
      title: existingProposal.title,
      visionStatement: existingProposal.vision_statement,
      goals: existingProposal.goals || [],
      culturalImpact: existingProposal.cultural_impact,
      timeline: existingProposal.timeline,
      budget: existingProposal.budget,
      collaboratorsNeeded: existingProposal.collaborators_needed || [],
      resources: existingProposal.resources || [],
      challengesAndMitigation: existingProposal.challenges_and_mitigation || [],
      nextSteps: existingProposal.next_steps || [],
    };

    return NextResponse.json({
      success: true,
      proposalId: existingProposal.id,
      proposal,
      cached: true,
      generatedAt: existingProposal.created_at,
    });
  } catch (error) {
    console.error("Get proposal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
