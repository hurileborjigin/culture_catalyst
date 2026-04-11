import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify password using PostgreSQL crypt function
    const { data: user, error } = await supabase
      .rpc("verify_user_password", {
        user_email: email.toLowerCase(),
        user_password: password,
      });

    if (error || !user || user.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const verifiedUser = Array.isArray(user) ? user[0] : user;

    // Create JWT token
    const token = await createToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        name: verifiedUser.name,
      },
      token,
    });

    // Set auth cookie on the response
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
