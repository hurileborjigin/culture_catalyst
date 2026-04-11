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

// GET - Single published proposal detail
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

    const { data: proposal, error } = await supabase
      .from("published_proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Published proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    console.error("Published proposal fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
