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

// GET - Fetch inactive users based on last_login
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const daysParam = request.nextUrl.searchParams.get("days") || "14";
    const inactiveDays = parseInt(daysParam);
    const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all profiles with last_login
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email, interests, skills, organization, location, last_login, created_at")
      .order("last_login", { ascending: true, nullsFirst: true });

    if (profilesError || !profiles) {
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    // Get idea counts per user for context
    const { data: ideas } = await supabase
      .from("ideas")
      .select("user_id");

    const ideaCount: Record<string, number> = {};
    for (const idea of ideas || []) {
      const uid = idea.user_id as string;
      ideaCount[uid] = (ideaCount[uid] || 0) + 1;
    }

    const dormantUsers = [];
    const deadUsers = [];

    for (const profile of profiles) {
      const hasProfile = (profile.interests?.length > 0) || (profile.skills?.length > 0);
      const hasLoggedIn = !!profile.last_login;
      const lastLoginDate = profile.last_login || null;

      if (!hasLoggedIn || (!hasProfile && !ideaCount[profile.id])) {
        // Dead user: never logged in, OR logged in but never set up profile and never created anything
        deadUsers.push({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          createdAt: profile.created_at,
          lastLogin: lastLoginDate,
          reason: !hasLoggedIn
            ? "Never logged in"
            : "No profile data, no activity",
        });
      } else if (hasProfile && lastLoginDate && lastLoginDate < cutoffDate) {
        // Dormant user: has profile, has logged in before, but not recently
        const daysSince = Math.floor(
          (Date.now() - new Date(lastLoginDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        dormantUsers.push({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          organization: profile.organization,
          interests: profile.interests || [],
          skills: profile.skills || [],
          lastLogin: lastLoginDate,
          ideasCount: ideaCount[profile.id] || 0,
          daysSinceLogin: daysSince,
        });
      }
    }

    // Sort dormant by most days since login
    dormantUsers.sort((a, b) => b.daysSinceLogin - a.daysSinceLogin);

    return NextResponse.json({
      success: true,
      dormantUsers,
      deadUsers,
      summary: {
        totalUsers: profiles.length,
        dormant: dormantUsers.length,
        dead: deadUsers.length,
        active: profiles.length - dormantUsers.length - deadUsers.length,
      },
    });
  } catch (error) {
    console.error("Inactive users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
