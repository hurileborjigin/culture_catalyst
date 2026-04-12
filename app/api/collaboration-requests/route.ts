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

// GET - List collaboration requests (incoming or outgoing)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type") || "incoming";

    let query = supabase
      .from("collaboration_requests")
      .select("*, published_proposals(id, title, category), requester:profiles!collaboration_requests_requester_id_fkey(name, skills, organization), author:profiles!collaboration_requests_author_id_fkey(name)")
      .order("created_at", { ascending: false });

    if (type === "incoming") {
      query = query.eq("author_id", userId);
    } else if (type === "outgoing") {
      query = query.eq("requester_id", userId);
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'incoming' or 'outgoing'" }, { status: 400 });
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Error fetching requests:", error);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      requests: (requests || []).map((r: Record<string, unknown>) => {
        const requester = r.requester as Record<string, unknown> | null;
        const author = r.author as Record<string, unknown> | null;
        const proposal = r.published_proposals as Record<string, unknown> | null;
        return {
          id: r.id,
          publishedProposalId: r.published_proposal_id,
          requesterId: r.requester_id,
          authorId: r.author_id,
          roleAppliedFor: r.role_applied_for,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          requesterName: requester?.name || "Unknown",
          requesterSkills: requester?.skills || [],
          requesterOrganization: requester?.organization || null,
          authorName: author?.name || "Unknown",
          proposalTitle: proposal?.title || "Unknown",
          proposalCategory: proposal?.category || null,
        };
      }),
    });
  } catch (error) {
    console.error("Requests list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
