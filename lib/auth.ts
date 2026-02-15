import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload {
  tokenId: string;
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
  exp?: number;
};

export async function createToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
};

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(payload: Omit<SessionPayload, "exp" | "tokenId">, existingTokenId?: string): Promise<string> {
  const tokenId = existingTokenId ?? randomUUID();
  const token = await createToken({ ...payload, tokenId });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return tokenId;
};

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};

export function generateTokenId(): string {
  return randomUUID();
};