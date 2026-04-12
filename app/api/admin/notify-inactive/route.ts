import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { render } from "@react-email/components";
import ReengagementEmail from "@/lib/emails/reengagement-email";
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

// POST - Generate rich HTML re-engagement emails
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds } = (await request.json()) as { userIds: string[] };

    if (!userIds || userIds.length === 0) {
      return NextResponse.json({ error: "userIds required" }, { status: 400 });
    }

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, interests, skills, professional_background, location")
      .in("id", userIds);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: "No valid users found" }, { status: 400 });
    }

    // Fetch recent published proposals
    const { data: allProposals } = await supabase
      .from("published_proposals")
      .select("id, title, vision_statement, category, tags, author_name, author_location, collaborators_needed")
      .order("published_at", { ascending: false })
      .limit(20);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culture-catalyst.vercel.app";

    // Inspiration topics (derived from recent proposal categories)
    const inspirationTopics = [
      { title: "AI Meets Art: The Rise of Creative Technology", category: "Visual Arts", description: "Interactive installations using machine learning are transforming how communities experience public art across the globe." },
      { title: "Youth-Led Cultural Movements", category: "Community Events", description: "A new generation of cultural leaders is driving grassroots festivals, mentorship programs, and community-centered creative spaces." },
      { title: "Food as Cultural Bridge", category: "Food & Culinary", description: "Pop-up dining experiences and heritage food festivals are becoming powerful tools for cross-cultural connection and immigrant visibility." },
    ];

    const results = [];

    for (const profile of profiles) {
      // Rank proposals for this specific user
      let topProposals: Array<{
        id: string;
        title: string;
        category: string | null;
        visionStatement: string | null;
        authorName: string;
        matchScore?: number;
      }> = [];

      try {
        if (allProposals && allProposals.length > 0 && profile.interests?.length > 0) {
          const ranked = await rankProposalsForUser(
            {
              name: profile.name,
              interests: profile.interests,
              skills: profile.skills,
              professionalBackground: profile.professional_background,
              location: profile.location,
            },
            allProposals.map((p) => ({
              id: p.id,
              title: p.title,
              visionStatement: p.vision_statement,
              category: p.category,
              tags: p.tags || [],
              authorLocation: p.author_location,
              collaboratorsNeeded: p.collaborators_needed,
            }))
          );

          topProposals = ranked.slice(0, 3).map((r) => {
            const full = allProposals!.find((p) => p.id === r.id);
            return {
              id: r.id,
              title: full?.title || "Untitled",
              category: full?.category || null,
              visionStatement: full?.vision_statement || null,
              authorName: full?.author_name || "Unknown",
              matchScore: r.score,
            };
          });
        }
      } catch (err) {
        console.error("Ranking failed for", profile.name, err);
        // Fallback: just use the 3 most recent proposals
        topProposals = (allProposals || []).slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          visionStatement: p.vision_statement,
          authorName: p.author_name,
        }));
      }

      // Render the email template
      const emailHtml = await render(
        ReengagementEmail({
          userName: profile.name?.split(" ")[0] || "there",
          proposals: topProposals,
          inspirations: inspirationTopics,
          baseUrl,
        })
      );

      results.push({
        userId: profile.id,
        name: profile.name,
        email: profile.email,
        html: emailHtml,
        proposalCount: topProposals.length,
        status: "generated",
      });
    }

    return NextResponse.json({
      success: true,
      notifications: results,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
