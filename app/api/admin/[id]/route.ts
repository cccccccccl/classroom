import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "admin") return null;
  return session;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { id } = await params;

    const [existing] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, password, role, isActive} = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();

    if (email !== undefined) {
      const emailLower = email.trim().toLowerCase();

      const [conflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, emailLower), ne(users.id, id)))
        .limit(1);

      if (conflict) {
        return NextResponse.json(
          { error: "A user with that email already exists" },
          { status: 409 },
        );
      };

      updateData.email = emailLower;
    };

    if (password !== undefined && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password.trim(), 12)
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      };
      updateData.role = role;
    };

    if (isActive !== undefined) {
      if (id === session.userId && isActive === false) {
        return NextResponse.json(
          { error: "You cannot deactivate your own account" },
          { status: 400 },
        );
      };
      updateData.isActive = isActive;
    };

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json({ users: updated });
  } catch (error: unknown) {
    console.error("[PATCH /api/admin/users/[id]]", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 },
      );
    };

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { id } = await params;

    if (id === session.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    };

    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};