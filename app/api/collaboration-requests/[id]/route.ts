import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

// GET - Fetch a single request with messages
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

    const { data: req, error } = await supabase
      .from("collaboration_requests")
      .select("*, published_proposals(id, title, category), requester:profiles!collaboration_requests_requester_id_fkey(name, skills, organization), author:profiles!collaboration_requests_author_id_fkey(name)")
      .eq("id", id)
      .single();

    if (error || !req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only requester or author can view
    if (req.requester_id !== userId && req.author_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from("collaboration_messages")
      .select("*, profiles(name)")
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    const requester = req.requester as Record<string, unknown> | null;
    const author = req.author as Record<string, unknown> | null;
    const proposal = req.published_proposals as Record<string, unknown> | null;

    return NextResponse.json({
      success: true,
      request: {
        id: req.id,
        publishedProposalId: req.published_proposal_id,
        requesterId: req.requester_id,
        authorId: req.author_id,
        roleAppliedFor: req.role_applied_for,
        message: req.message,
        status: req.status,
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        requesterName: requester?.name || "Unknown",
        requesterSkills: requester?.skills || [],
        requesterOrganization: requester?.organization || null,
        authorName: author?.name || "Unknown",
        proposalTitle: proposal?.title || "Unknown",
      },
      messages: (messages || []).map((m: Record<string, unknown>) => {
        const profile = m.profiles as Record<string, unknown> | null;
        return {
          id: m.id,
          requestId: m.request_id,
          senderId: m.sender_id,
          content: m.content,
          createdAt: m.created_at,
          senderName: profile?.name || "Unknown",
        };
      }),
    });
  } catch (error) {
    console.error("Request fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Accept or decline a request (author only)
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
    const { status } = await request.json();

    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'accepted' or 'declined'" }, { status: 400 });
    }

    // Fetch the request
    const { data: req, error: fetchError } = await supabase
      .from("collaboration_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only author can accept/decline
    if (req.author_id !== userId) {
      return NextResponse.json({ error: "Only the proposal author can accept or decline" }, { status: 403 });
    }

    if (req.status !== "pending") {
      return NextResponse.json({ error: "Request has already been processed" }, { status: 400 });
    }

    // Update status
    const { error: updateError } = await supabase
      .from("collaboration_requests")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating request:", updateError);
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    // If accepted, add collaborator and update proposal gaps
    if (status === "accepted") {
      // Get requester's profile for skills
      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", req.requester_id)
        .single();

      // Insert collaborator
      await supabase.from("proposal_collaborators").insert({
        published_proposal_id: req.published_proposal_id,
        user_id: req.requester_id,
        role: req.role_applied_for,
        skills: requesterProfile?.skills || [],
      });

      // Update collaborators_needed on the published proposal
      const { data: proposal } = await supabase
        .from("published_proposals")
        .select("collaborators_needed")
        .eq("id", req.published_proposal_id)
        .single();

      if (proposal?.collaborators_needed) {
        const needs = proposal.collaborators_needed as Array<{
          role: string;
          skills: string[];
          priority: string;
          count: number;
        }>;

        const updatedNeeds = needs
          .map((need) => {
            if (need.role === req.role_applied_for) {
              return { ...need, count: Math.max(0, (need.count || 1) - 1) };
            }
            return need;
          })
          .filter((need) => need.count > 0);

        await supabase
          .from("published_proposals")
          .update({ collaborators_needed: updatedNeeds })
          .eq("id", req.published_proposal_id);
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Withdraw a request (requester only)
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

    const { data: req } = await supabase
      .from("collaboration_requests")
      .select("requester_id, status")
      .eq("id", id)
      .single();

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (req.requester_id !== userId) {
      return NextResponse.json({ error: "Only the requester can withdraw" }, { status: 403 });
    }

    if (req.status !== "pending") {
      return NextResponse.json({ error: "Can only withdraw pending requests" }, { status: 400 });
    }

    await supabase.from("collaboration_requests").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Request delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
