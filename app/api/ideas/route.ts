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
 * GET /api/ideas
 * Get all ideas for the current user
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
      .from("ideas")
      .select(`
        *,
        saved_inspirations (
          id,
          title,
          category
        ),
        idea_research (
          id,
          summary,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: ideas, error } = await query;

    if (error) {
      console.error("Error fetching ideas:", error);
      return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ideas: ideas || [],
      total: ideas?.length || 0,
    });
  } catch (error) {
    console.error("Ideas fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/ideas
 * Create a new idea
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, inspirationId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data: newIdea, error } = await supabase
      .from("ideas")
      .insert({
        user_id: userId,
        title,
        description: description || "",
        inspiration_id: inspirationId || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating idea:", error);
      return NextResponse.json({ error: "Failed to create idea" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      idea: newIdea,
    });
  } catch (error) {
    console.error("Idea creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/ideas
 * Delete an idea
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
      return NextResponse.json({ error: "Idea ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting idea:", error);
      return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete idea error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
