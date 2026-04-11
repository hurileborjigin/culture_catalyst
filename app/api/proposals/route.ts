import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/proposals
 * Get all proposals for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
      .eq("user_id", user.id)
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, ideaId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data: newProposal, error } = await supabase
      .from("proposals")
      .insert({
        user_id: user.id,
        idea_id: ideaId || null,
        title,
        status: "draft",
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
      .eq("user_id", user.id);

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
