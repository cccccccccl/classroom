import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth";
import { createSession } from "@/lib/sessions";
import { extractIp, getGeoInfo, parseBrowser, parseOS } from "@/lib/geo";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    };

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    };

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    };

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "user",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    const ip = extractIp(request);
    const geo = await getGeoInfo(ip);
    const ua = request.headers.get("user-agent") || "";

    const tokenId = await setSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    await createSession({
      userId: newUser.id,
      tokenId,
      ip,
      ...geo,
      browser: parseBrowser(ua),
      os: parseOS(ua),
      userAgent: ua,
    });

    return NextResponse.json(
      { message: "Account created successfully", user: { id: newUser.id, email: newUser.email, name: newUser.name } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  };
};