import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth";

// Helper to get user ID from JWT token
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try cookie first
  const cookieToken = request.cookies.get("auth_token")?.value;
  // Then try Authorization header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  const token = cookieToken || bearerToken;
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/profile
 * Update the current user's profile (full update)
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      professional_background,
      organization,
      workplace,
      location,
      bio,
      interests,
      skills,
      avatar_url,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (name !== undefined) updates.name = name;
    if (professional_background !== undefined) updates.professional_background = professional_background;
    if (organization !== undefined) updates.organization = organization;
    if (workplace !== undefined) updates.workplace = workplace;
    if (location !== undefined) updates.location = location;
    if (bio !== undefined) updates.bio = bio;
    if (interests !== undefined) updates.interests = interests;
    if (skills !== undefined) updates.skills = skills;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/profile
 * Partial update of user profile
 */
export async function PATCH(request: NextRequest) {
  // PATCH uses the same logic as PUT for partial updates
  return PUT(request);
}
