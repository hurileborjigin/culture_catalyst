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

// GET - Check if current user has an existing request for this proposal
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

    const { data: requests, error } = await supabase
      .from("collaboration_requests")
      .select("id, role_applied_for, status, created_at")
      .eq("published_proposal_id", id)
      .eq("requester_id", userId);

    if (error) {
      console.error("Error fetching requests:", error);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error("Collaborate fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a collaboration request
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
    const { roleAppliedFor, message } = await request.json();

    if (!roleAppliedFor?.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Get the proposal author
    const { data: proposal } = await supabase
      .from("published_proposals")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.user_id === userId) {
      return NextResponse.json({ error: "Cannot apply to your own proposal" }, { status: 400 });
    }

    // Create the request
    const { data: collab, error } = await supabase
      .from("collaboration_requests")
      .insert({
        published_proposal_id: id,
        requester_id: userId,
        author_id: proposal.user_id,
        role_applied_for: roleAppliedFor.trim(),
        message: message?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "You already applied for this role" }, { status: 409 });
      }
      console.error("Error creating request:", error);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    // Also insert the initial message if provided
    if (message?.trim() && collab) {
      await supabase.from("collaboration_messages").insert({
        request_id: collab.id,
        sender_id: userId,
        content: message.trim(),
      });
    }

    return NextResponse.json({ success: true, request: collab });
  } catch (error) {
    console.error("Collaborate create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
