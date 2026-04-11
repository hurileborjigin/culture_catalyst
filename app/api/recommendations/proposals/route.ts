import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { rankProposalsForUser } from "@/lib/services/azure-openai";

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

// GET - Fetch recommendations (cached or generate new)
export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for cached recommendations (less than 24h old)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: cached } = await supabase
      .from("proposal_recommendations")
      .select("*, published_proposals(*)")
      .eq("user_id", userId)
      .gte("created_at", twentyFourHoursAgo)
      .order("relevance_score", { ascending: false });

    if (cached && cached.length > 0) {
      return NextResponse.json({
        success: true,
        recommendations: cached.map((r: Record<string, unknown>) => {
          let parsedReason = {
            reason: "",
            matchingInterests: [] as string[],
            matchingSkills: [] as string[],
            rolesYouCouldFill: [] as string[],
          };
          try {
            if (typeof r.relevance_reason === "string") {
              parsedReason = JSON.parse(r.relevance_reason);
            }
          } catch {
            parsedReason.reason = (r.relevance_reason as string) || "";
          }
          return {
            publishedProposalId: r.published_proposal_id,
            relevanceScore: r.relevance_score,
            relevanceReason: parsedReason,
            publishedProposal: r.published_proposals,
          };
        }),
        cached: true,
      });
    }

    // Generate fresh recommendations
    const recommendations = await generateRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations,
      cached: false,
    });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Force refresh recommendations
export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete existing recommendations
    await supabase
      .from("proposal_recommendations")
      .delete()
      .eq("user_id", userId);

    const recommendations = await generateRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations,
      cached: false,
    });
  } catch (error) {
    console.error("Recommendations refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateRecommendations(userId: string) {
  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, interests, skills, professional_background, location")
    .eq("id", userId)
    .single();

  if (!profile || !profile.interests?.length) {
    return [];
  }

  // Fetch all published proposals (excluding user's own)
  const { data: proposals } = await supabase
    .from("published_proposals")
    .select("id, title, vision_statement, category, tags, author_location, collaborators_needed")
    .neq("user_id", userId)
    .order("published_at", { ascending: false })
    .limit(100);

  if (!proposals || proposals.length === 0) {
    return [];
  }

  // Rank via LLM
  const ranked = await rankProposalsForUser(
    {
      name: profile.name,
      interests: profile.interests,
      skills: profile.skills,
      professionalBackground: profile.professional_background,
      location: profile.location,
    },
    proposals.map((p) => ({
      id: p.id,
      title: p.title,
      visionStatement: p.vision_statement,
      category: p.category,
      tags: p.tags || [],
      authorLocation: p.author_location,
      collaboratorsNeeded: p.collaborators_needed,
    }))
  );

  // Store recommendations in cache (only those above threshold)
  const MIN_SCORE = 50;
  const filtered = ranked.filter((r) => r.score >= MIN_SCORE);

  const inserts = filtered.map((r) => ({
    user_id: userId,
    published_proposal_id: r.id,
    relevance_score: r.score,
    relevance_reason: JSON.stringify({
      reason: r.reason,
      matchingInterests: r.matchingInterests || [],
      matchingSkills: r.matchingSkills || [],
      rolesYouCouldFill: r.rolesYouCouldFill || [],
    }),
  }));

  if (inserts.length > 0) {
    await supabase.from("proposal_recommendations").insert(inserts);
  }

  // Fetch full published proposal data for the filtered results
  const rankedIds = filtered.map((r) => r.id);
  if (rankedIds.length === 0) return [];

  const { data: fullProposals } = await supabase
    .from("published_proposals")
    .select("*")
    .in("id", rankedIds);

  const proposalMap = new Map(
    (fullProposals || []).map((p: Record<string, unknown>) => [p.id, p])
  );

  return filtered.map((r) => ({
    publishedProposalId: r.id,
    relevanceScore: r.score,
    relevanceReason: {
      reason: r.reason,
      matchingInterests: r.matchingInterests || [],
      matchingSkills: r.matchingSkills || [],
      rolesYouCouldFill: r.rolesYouCouldFill || [],
    },
    publishedProposal: proposalMap.get(r.id) || null,
  }));
}
