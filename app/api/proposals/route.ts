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

/**
 * GET /api/proposals
 * Get all proposals for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: proposals, error } = await query;

    if (error) {
      console.error("Error fetching proposals:", error);
      return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      proposals: proposals || [],
      total: proposals?.length || 0,
    });
  } catch (error) {
    console.error("Get proposals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/proposals
 * Create a new proposal
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, ideaId, status, content } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data: newProposal, error } = await supabase
      .from("proposals")
      .insert({
        user_id: userId,
        idea_id: ideaId || null,
        title,
        status: status || "draft",
        content: content || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating proposal:", error);
      return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      proposal: newProposal,
    });
  } catch (error) {
    console.error("Proposal creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/proposals
 * Delete a proposal
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting proposal:", error);
      return NextResponse.json({ error: "Failed to delete proposal" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete proposal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
