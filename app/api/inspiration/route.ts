import { NextRequest, NextResponse } from "next/server";
import { azureOpenAI } from "@/lib/services/azure-openai";
import { tavilySearch } from "@/lib/services/tavily-search";
import type { InspirationCard, UserProfile } from "@/types";

// In-memory session storage (in production, use Redis or database)
const inspirationSessions = new Map<
  string,
  {
    cards: InspirationCard[];
    currentIndex: number;
    createdAt: Date;
  }
>();

/**
 * GET /api/inspiration
 * Get current inspiration cards for a user session
 * Query params:
 * - sessionId: existing session ID to get cards from
 * - category: filter by category
 * - search: search within cards
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (sessionId && inspirationSessions.has(sessionId)) {
      const session = inspirationSessions.get(sessionId)!;
      let cards = session.cards;

      // Filter by category if provided
      if (category && category !== "all") {
        cards = cards.filter(
          (c) => c.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Filter by search if provided
      if (search) {
        const searchLower = search.toLowerCase();
        cards = cards.filter(
          (c) =>
            c.title.toLowerCase().includes(searchLower) ||
            c.summary.toLowerCase().includes(searchLower) ||
            c.tags.some((t) => t.toLowerCase().includes(searchLower))
        );
      }

      // Return current set of 4 cards
      const startIndex = session.currentIndex;
      const currentCards = cards.slice(startIndex, startIndex + 4);

      return NextResponse.json({
        success: true,
        sessionId,
        inspirations: currentCards,
        total: cards.length,
        currentIndex: startIndex,
        hasMore: startIndex + 4 < cards.length,
      });
    }

    // No session - return empty
    return NextResponse.json({
      success: true,
      inspirations: [],
      total: 0,
      message: "No active session. Use POST to generate inspirations.",
    });
  } catch (error) {
    console.error("Inspiration fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inspiration
 * Generate new inspiration cards based on user profile
 * Body:
 * - userProfile: { name, interests, professionalBackground, organization, location }
 * - regenerate: boolean - if true, generates new cards for existing session
 * - sessionId: string - existing session ID for shuffle/regenerate
 * - shuffle: boolean - if true, shows next 4 cards from existing batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, regenerate, sessionId, shuffle } = body as {
      userProfile?: UserProfile;
      regenerate?: boolean;
      sessionId?: string;
      shuffle?: boolean;
    };

    // Handle shuffle - show next 4 cards from existing batch
    if (shuffle && sessionId && inspirationSessions.has(sessionId)) {
      const session = inspirationSessions.get(sessionId)!;
      let newIndex = session.currentIndex + 4;
      
      // If we've shown all cards, loop back to beginning
      if (newIndex >= session.cards.length) {
        newIndex = 0;
      }
      
      session.currentIndex = newIndex;
      inspirationSessions.set(sessionId, session);

      const currentCards = session.cards.slice(newIndex, newIndex + 4);

      return NextResponse.json({
        success: true,
        sessionId,
        inspirations: currentCards,
        total: session.cards.length,
        currentIndex: newIndex,
        hasMore: newIndex + 4 < session.cards.length,
      });
    }

    // For regenerate or new generation, we need user profile
    if (!userProfile || !userProfile.name || !userProfile.interests?.length) {
      return NextResponse.json(
        { error: "User profile with name and interests is required" },
        { status: 400 }
      );
    }

    console.log("[Inspiration API] Generating inspirations for:", userProfile.name);
    console.log("[Inspiration API] User interests:", userProfile.interests);

    // Step 1: Generate search queries based on user profile
    console.log("[Inspiration API] Generating search queries...");
    const searchQueries = await azureOpenAI.generateSearchQueries({
      name: userProfile.name,
      interests: userProfile.interests,
      professionalBackground: userProfile.professionalBackground,
      organization: userProfile.organization,
      location: userProfile.location,
    });

    console.log("[Inspiration API] Generated queries:", searchQueries);

    // Step 2: Perform web searches using Tavily
    console.log("[Inspiration API] Searching for inspiration...");
    const searchResults = await tavilySearch.searchForInspiration(
      searchQueries,
      5 // 5 results per query
    );

    console.log("[Inspiration API] Found", searchResults.length, "search results");

    // Step 3: Generate inspiration cards using LLM
    console.log("[Inspiration API] Generating inspiration cards...");
    const generatedCards = await azureOpenAI.generateInspirationCards(
      searchResults,
      userProfile,
      20 // Generate 20 cards
    );

    console.log("[Inspiration API] Generated", generatedCards.length, "cards");

    // Transform to InspirationCard format with IDs
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

    // Create or update session
    const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    inspirationSessions.set(newSessionId, {
      cards: inspirationCards,
      currentIndex: 0,
      createdAt: new Date(),
    });

    // Return first 4 cards
    const currentCards = inspirationCards.slice(0, 4);

    return NextResponse.json({
      success: true,
      sessionId: newSessionId,
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
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
