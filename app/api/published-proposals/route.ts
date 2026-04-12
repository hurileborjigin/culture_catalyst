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

// GET - Browse all published proposals
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const proposalId = searchParams.get("proposal_id");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("published_proposals")
      .select("*", { count: "exact" })
      .range(offset, offset + pageSize - 1);

    // New voices: surface proposals from less-active users (oldest published first)
    if (sort === "new_voices") {
      query = query.neq("user_id", userId).order("published_at", { ascending: true });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (proposalId) {
      query = query.eq("proposal_id", proposalId);
    }

    const { data: proposals, error, count } = await query;

    if (error) {
      console.error("Error fetching published proposals:", error);
      return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      proposals: proposals || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > offset + pageSize,
    });
  } catch (error) {
    console.error("Published proposals fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
