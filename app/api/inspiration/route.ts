import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import { tavilySearch } from "@/lib/services/tavily-search";
import { verifyToken } from "@/lib/auth";
import type { InspirationCard, UserProfile } from "@/types";

// Helper to get user ID from JWT token in cookie
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload?.userId || null;
}

/**
 * GET /api/inspiration
 * Get inspiration sessions and saved inspirations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const saved = searchParams.get("saved") === "true";

    // Get saved inspirations
    if (saved) {
      const { data: savedInspirations, error } = await supabase
        .from("saved_inspirations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved inspirations:", error);
        return NextResponse.json({ error: "Failed to fetch saved inspirations" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        savedInspirations: savedInspirations || [],
      });
    }

    // Get specific session
    if (sessionId) {
      const { data: session, error } = await supabase
        .from("inspiration_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (error || !session) {
        return NextResponse.json({
          success: true,
          inspirations: [],
          message: "Session not found",
        });
      }

      const cards = session.cards as InspirationCard[];
      const startIndex = session.current_index || 0;
      const currentCards = cards.slice(startIndex, startIndex + 4);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        inspirations: currentCards,
        total: cards.length,
        currentIndex: startIndex,
        hasMore: startIndex + 4 < cards.length,
      });
    }

    // Get latest session
    const { data: sessions, error } = await supabase
      .from("inspiration_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    if (sessions && sessions.length > 0) {
      const session = sessions[0];
      const cards = session.cards as InspirationCard[];
      const startIndex = session.current_index || 0;
      const currentCards = cards.slice(startIndex, startIndex + 4);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        inspirations: currentCards,
        total: cards.length,
        currentIndex: startIndex,
        hasMore: startIndex + 4 < cards.length,
      });
    }

    return NextResponse.json({
      success: true,
      inspirations: [],
      total: 0,
      message: "No sessions found. Use POST to generate inspirations.",
    });
  } catch (error) {
    console.error("Inspiration fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/inspiration
 * Generate new inspiration cards or shuffle existing ones
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { regenerate, sessionId, shuffle, saveInspiration } = body;

    // Save inspiration to user's collection
    if (saveInspiration) {
      const { data, error } = await supabase
        .from("saved_inspirations")
        .insert({
          user_id: userId,
          title: saveInspiration.title,
          summary: saveInspiration.summary,
          category: saveInspiration.category,
          relevance_explanation: saveInspiration.relevanceExplanation,
          success_highlights: saveInspiration.successHighlights || [],
          source_url: saveInspiration.sourceUrl,
          location: saveInspiration.location,
          tags: saveInspiration.tags || [],
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving inspiration:", error);
        return NextResponse.json({ error: "Failed to save inspiration" }, { status: 500 });
      }

      return NextResponse.json({ success: true, savedInspiration: data });
    }

    // Handle shuffle - show next 4 cards from existing batch
    if (shuffle && sessionId) {
      const { data: session, error } = await supabase
        .from("inspiration_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (error || !session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const cards = session.cards as InspirationCard[];
      let newIndex = (session.current_index || 0) + 4;

      // Loop back to beginning if we've shown all cards
      if (newIndex >= cards.length) {
        newIndex = 0;
      }

      // Update session with new index
      await supabase
        .from("inspiration_sessions")
        .update({ current_index: newIndex })
        .eq("id", sessionId);

      const currentCards = cards.slice(newIndex, newIndex + 4);

      return NextResponse.json({
        success: true,
        sessionId,
        inspirations: currentCards,
        total: cards.length,
        currentIndex: newIndex,
        hasMore: newIndex + 4 < cards.length,
      });
    }

    // Get user profile for AI generation
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found. Please complete your profile first." },
        { status: 400 }
      );
    }

    const userProfile: UserProfile = {
      name: profile.name || profile.email?.split("@")[0] || "User",
      interests: profile.interests || [],
      professionalBackground: profile.professional_background,
      organization: profile.organization,
      location: profile.location,
      skills: profile.skills,
    };

    if (!userProfile.interests.length) {
      return NextResponse.json(
        { error: "Please add some interests to your profile first." },
        { status: 400 }
      );
    }

    console.log("[Inspiration API] Generating inspirations for:", userProfile.name);

    // Step 1: Generate search queries
    const searchQueries = await azureOpenAI.generateSearchQueries(userProfile);
    console.log("[Inspiration API] Generated queries:", searchQueries);

    // Step 2: Perform web searches
    const searchResults = await tavilySearch.searchForInspiration(searchQueries, 5);
    console.log("[Inspiration API] Found", searchResults.length, "search results");

    // Step 3: Generate inspiration cards
    const generatedCards = await azureOpenAI.generateInspirationCards(
      searchResults,
      userProfile,
      20
    );
    console.log("[Inspiration API] Generated", generatedCards.length, "cards");

    // Transform cards
    const inspirationCards: InspirationCard[] = generatedCards.map((card, index) => ({
      id: `insp_${Date.now()}_${index}`,
      title: card.title,
      summary: card.summary,
      category: card.category,
      location: card.location,
      relevanceExplanation: card.relevanceExplanation,
      successHighlights: card.successHighlights,
      tags: card.tags,
      sourceUrl: card.sourceUrl,
      saved: false,
    }));

    // Create new session in database
    const { data: newSession, error: sessionError } = await supabase
      .from("inspiration_sessions")
      .insert({
        user_id: userId,
        cards: inspirationCards,
        current_index: 0,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }

    const currentCards = inspirationCards.slice(0, 4);

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      inspirations: currentCards,
      total: inspirationCards.length,
      currentIndex: 0,
      hasMore: inspirationCards.length > 4,
    });
  } catch (error) {
    console.error("AI inspiration generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate inspirations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inspiration
 * Remove a saved inspiration
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inspiration ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("saved_inspirations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting inspiration:", error);
      return NextResponse.json({ error: "Failed to delete inspiration" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete inspiration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
