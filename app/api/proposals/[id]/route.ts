import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { generateProposalTags } from "@/lib/services/azure-openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserIdFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload?.userId || null;
}

// GET single proposal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(`
        *,
        ideas (
          id,
          title,
          description,
          status
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Proposal fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH update a proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log("[v0] PATCH proposal request:", { id, body });

    // Only allow updating specific fields to prevent invalid column errors
    const allowedFields = ["status", "title", "vision_statement", "goals", "cultural_impact", 
      "timeline", "budget", "collaborators_needed", "resources", "challenges_and_mitigation", "next_steps"];
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    console.log("[v0] Update data:", updateData);

    const { data: updatedProposal, error } = await supabase
      .from("proposals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating proposal:", error);
      return NextResponse.json({ error: "Failed to update proposal", details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error("Proposal update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Publish a proposal to the global published_proposals table
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the proposal and verify ownership
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (!["draft", "finalized"].includes(proposal.status)) {
      return NextResponse.json(
        { error: "Only draft or finalized proposals can be published" },
        { status: 400 }
      );
    }

    // Check if already published
    const { data: existing } = await supabase
      .from("published_proposals")
      .select("id")
      .eq("proposal_id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Proposal is already published", publishedId: existing.id },
        { status: 409 }
      );
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, organization, location")
      .eq("id", userId)
      .single();

    // Generate tags and category via LLM
    const { tags, category } = await generateProposalTags({
      title: proposal.title,
      visionStatement: proposal.vision_statement,
      goals: proposal.goals,
      culturalImpact: proposal.cultural_impact,
    });

    // Insert into published_proposals
    const { data: published, error: publishError } = await supabase
      .from("published_proposals")
      .insert({
        proposal_id: id,
        user_id: userId,
        title: proposal.title,
        vision_statement: proposal.vision_statement,
        goals: proposal.goals || [],
        cultural_impact: proposal.cultural_impact,
        timeline: proposal.timeline,
        budget: proposal.budget,
        collaborators_needed: proposal.collaborators_needed || [],
        resources: proposal.resources || [],
        challenges_and_mitigation: proposal.challenges_and_mitigation || [],
        next_steps: proposal.next_steps || [],
        author_name: profile?.name || "Anonymous",
        author_organization: profile?.organization,
        author_location: profile?.location,
        tags,
        category,
      })
      .select()
      .single();

    if (publishError) {
      console.error("Error publishing proposal:", publishError);
      return NextResponse.json({ error: "Failed to publish proposal" }, { status: 500 });
    }

    // Update original proposal status to submitted
    await supabase
      .from("proposals")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    return NextResponse.json({ success: true, published });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE a proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting proposal:", error);
      return NextResponse.json({ error: "Failed to delete proposal" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Proposal ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Proposal delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
