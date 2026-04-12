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

// GET - Fetch collaborators for a published proposal
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

    const { data: collaborators, error } = await supabase
      .from("proposal_collaborators")
      .select("*, profiles(name, organization)")
      .eq("published_proposal_id", id)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching collaborators:", error);
      return NextResponse.json({ error: "Failed to fetch collaborators" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      collaborators: (collaborators || []).map((c: Record<string, unknown>) => {
        const profile = c.profiles as Record<string, unknown> | null;
        return {
          id: c.id,
          publishedProposalId: c.published_proposal_id,
          userId: c.user_id,
          role: c.role,
          skills: c.skills,
          joinedAt: c.joined_at,
          collaboratorName: profile?.name || "Unknown",
          collaboratorOrganization: profile?.organization || null,
        };
      }),
    });
  } catch (error) {
    console.error("Collaborators fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
