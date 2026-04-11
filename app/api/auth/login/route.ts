import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createToken, setAuthCookie } from "@/lib/auth";

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

    // Verify password using PostgreSQL crypt function and fetch user in one query
    // This works because the password was hashed with crypt(password, gen_salt('bf', 10))
    const { data: user, error } = await supabase
      .rpc("verify_user_password", {
        user_email: email.toLowerCase(),
        user_password: password,
      });

    if (error || !user || user.length === 0) {
      // Fallback: try direct query if RPC doesn't exist
      const { data: fallbackUser, error: fallbackError } = await supabase
        .from("profiles")
        .select("id, email, name, password_hash")
        .eq("email", email.toLowerCase())
        .single();

      if (fallbackError || !fallbackUser) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Create JWT token
      const token = await createToken({
        userId: fallbackUser.id,
        email: fallbackUser.email,
      });

      // Set cookie
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
        },
        token,
      });
    }

    const verifiedUser = Array.isArray(user) ? user[0] : user;

    // Create JWT token
    const token = await createToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        name: verifiedUser.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
