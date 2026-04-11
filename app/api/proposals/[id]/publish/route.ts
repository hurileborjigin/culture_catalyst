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
