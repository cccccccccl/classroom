import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/auth";
import { revokeSession } from "@/lib/sessions";

export async function POST() {
  try {
    const session = await getSession();

    if (session?.tokenId) {
      await revokeSession(session.tokenId, session.userId);
    };

    await clearSession();

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};