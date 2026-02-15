import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserSessions } from "@/lib/sessions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const activeSessions = await getUserSessions(session.userId, session.tokenId);

    return NextResponse.json({ sessions: activeSessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};