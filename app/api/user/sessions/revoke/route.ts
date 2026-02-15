import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { revokeSession } from "@/lib/sessions";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    };

    const revoked = await revokeSession(sessionId, session.userId);

    if (!revoked) {
      return NextResponse.json({ error: "Session not found or already revoked"}, { status: 404 });
    };

    return NextResponse.json({ message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};