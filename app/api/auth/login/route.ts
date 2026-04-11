import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "culture-catalyst-secret-key-change-in-production";

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  interests: string[];
  professionalBackground?: string;
  organization?: string;
  workplace?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

async function loadUsers(): Promise<StoredUser[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json");
    console.log("[v0] Loading users from:", filePath);
    const fileContents = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    console.log("[v0] Parsed users successfully, count:", data.users?.length || 0);
    return data.users || [];
  } catch (error) {
    console.error("[v0] Error loading users:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("[v0] Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      console.log("[v0] Login failed: missing email or password");
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Load users from JSON file
    const users = await loadUsers();
    console.log("[v0] Loaded users count:", users.length);
    
    // Find user by email (case-insensitive)
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    console.log("[v0] User found:", user ? user.email : "NOT FOUND");

    if (!user) {
      console.log("[v0] Login failed: user not found");
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      console.log("[v0] Login failed: password mismatch");
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    console.log("[v0] Password verified, generating token");

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
