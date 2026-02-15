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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    };

    const ip = extractIp(request);
    const geo = await getGeoInfo(ip);
    const ua = request.headers.get("user-agent") || "";

    const tokenId = await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await createSession({
      userId: user.id,
      tokenId,
      ip,
      ...geo,
      browser: parseBrowser(ua),
      os: parseOS(ua),
      userAgent: ua,
    });

    return NextResponse.json({
      message: "Logged in successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  };
};