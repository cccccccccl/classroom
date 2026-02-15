import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, setSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    };

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 },
      );
    };

    const [updatedUser] = await db
      .update(users)
      .set({ name: trimmedName, updatedAt: new Date() })
      .where(eq(users.id, session.userId))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    await setSession(
      { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
      session.tokenId,
    );

    return NextResponse.json({ message: "Name updated successfully", name: updatedUser.name });
  } catch (error) {
    console.error("Update name error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};