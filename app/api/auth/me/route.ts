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

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

async function loadUsers(): Promise<StoredUser[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json");
    const fileContents = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    return data.users || [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Load users and find the user by ID
    const users = await loadUsers();
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
