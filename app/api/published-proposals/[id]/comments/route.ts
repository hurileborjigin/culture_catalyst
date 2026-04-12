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

// GET - Fetch comments for a published proposal
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

    const { data: comments, error } = await supabase
      .from("proposal_comments")
      .select("*, profiles(name, organization)")
      .eq("published_proposal_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comments: (comments || []).map((c: Record<string, unknown>) => {
        const profile = c.profiles as Record<string, unknown> | null;
        return {
          id: c.id,
          publishedProposalId: c.published_proposal_id,
          userId: c.user_id,
          content: c.content,
          createdAt: c.created_at,
          commenterName: profile?.name || "Unknown",
          commenterOrganization: profile?.organization || null,
        };
      }),
    });
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add a comment
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
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("proposal_comments")
      .insert({
        published_proposal_id: id,
        user_id: userId,
        content: content.trim(),
      })
      .select("*, profiles(name, organization)")
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    const profile = comment.profiles as Record<string, unknown> | null;
    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        publishedProposalId: comment.published_proposal_id,
        userId: comment.user_id,
        content: comment.content,
        createdAt: comment.created_at,
        commenterName: profile?.name || "Unknown",
        commenterOrganization: profile?.organization || null,
      },
    });
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
