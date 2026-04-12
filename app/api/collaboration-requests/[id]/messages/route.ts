import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

// GET - Fetch messages for a collaboration request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is part of this request
    const { data: req } = await supabase
      .from("collaboration_requests")
      .select("requester_id, author_id")
      .eq("id", id)
      .single();

    if (!req || (req.requester_id !== userId && req.author_id !== userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: messages, error } = await supabase
      .from("collaboration_messages")
      .select("*, profiles(name)")
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: (messages || []).map((m: Record<string, unknown>) => {
        const profile = m.profiles as Record<string, unknown> | null;
        return {
          id: m.id,
          requestId: m.request_id,
          senderId: m.sender_id,
          content: m.content,
          createdAt: m.created_at,
          senderName: profile?.name || "Unknown",
        };
      }),
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Send a message in a collaboration thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify user is part of this request
    const { data: req } = await supabase
      .from("collaboration_requests")
      .select("requester_id, author_id")
      .eq("id", id)
      .single();

    if (!req || (req.requester_id !== userId && req.author_id !== userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: message, error } = await supabase
      .from("collaboration_messages")
      .insert({
        request_id: id,
        sender_id: userId,
        content: content.trim(),
      })
      .select("*, profiles(name)")
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    const profile = message.profiles as Record<string, unknown> | null;
    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        requestId: message.request_id,
        senderId: message.sender_id,
        content: message.content,
        createdAt: message.created_at,
        senderName: profile?.name || "Unknown",
      },
    });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
