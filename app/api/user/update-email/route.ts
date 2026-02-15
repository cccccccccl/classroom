import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getSession, setSession } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    };

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    };

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), ne(users.id, session.userId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This email is already in use by another account" },
        { status: 409 },
      );
    };

    const [updatedUser] = await db
      .update(users)
      .set({ email: normalizedEmail, updatedAt: new Date() })
      .where(eq(users.id, session.userId))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    await setSession(
      { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
      session.tokenId,
    );

    return NextResponse.json({ message: "Email updated successfully", email: updatedUser.email });
  } catch (error) {
    console.error("Update email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};