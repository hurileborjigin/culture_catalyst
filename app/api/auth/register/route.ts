import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createToken } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, interests, professionalBackground, organization, location, bio, skills } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user with hashed password using PostgreSQL crypt function
    const { data: newUser, error: insertError } = await supabase.rpc(
      "create_user_with_password",
      {
        user_email: email,
        user_password: password,
        user_name: name,
        user_interests: interests || [],
        user_professional_background: professionalBackground || null,
        user_organization: organization || null,
        user_location: location || null,
        user_bio: bio || null,
        user_skills: skills || [],
      }
    );

    if (insertError) {
      console.error("Error creating user:", insertError);
      // If the RPC function doesn't exist, fall back to direct insert
      // Note: This requires the password to be hashed on the client or we need to create the function
      return NextResponse.json(
        { error: "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        interests: newUser.interests || [],
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
