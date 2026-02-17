import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { asc, ilike, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "admin") return null;
  return session;
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(
        search
          ? or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
          )
        : undefined
      )
      .orderBy(asc(users.createdAt));

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const body = await request.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "name, email, and password are required" },
        { status: 400 },
      );
    };

    if (!["user", "admin"].includes(role ?? "")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    };

    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: (role as "user" | "admin") ?? "user",
        isActive: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/users]", error);

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