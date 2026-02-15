import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Session } from "@/db/schema";

export interface CreateSessionParams {
  userId: string;
  tokenId: string;
  ip: string;
  city: string;
  country: string;
  region: string;
  browser: string;
  os: string;
  userAgent: string;
};

export interface ActiveSession {
  id: string;
  tokenId: string;
  ip: string;
  city: string;
  country: string;
  region: string;
  browser: string;
  os: string;
  createdAt: Date;
  lastSeenAt: Date;
  isCurrent: boolean;
};

export async function createSession(params: CreateSessionParams): Promise<Session> {
  const [session] = await db
    .insert(sessions)
    .values(params)
    .returning();

  return session;
};

export async function touchSession(tokenId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(and(eq(sessions.tokenId, tokenId), eq(sessions.isRevoked, false)));
};

export async function getUserSessions(
  userId: string,
  currentTokenId: string,
): Promise<ActiveSession[]> {
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)))
    .orderBy(desc(sessions.lastSeenAt));

  return rows.map((row) => ({
    id: row.id,
    tokenId: row.tokenId,
    ip: row.ip,
    city: row.city,
    country: row.country,
    region: row.region,
    browser: row.browser,
    os: row.os,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
    isCurrent: row.tokenId === currentTokenId,
  }));
};

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(sessions)
    .set({ isRevoked: true })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .returning({ id: sessions.id });

  return result.length > 0;
};

export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ isRevoked: true })
    .where(eq(sessions.userId, userId));
};

export async function revokedOtherSessions(userId: string, currentTokenId: string): Promise<void> {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)));

  const otherIds = rows
    .filter((r) => r.id !== currentTokenId)
    .map((r) => r.id);

  if (otherIds.length === 0) return;

  for (const id of otherIds) {
    await db
      .update(sessions)
      .set({ isRevoked: true })
      .where(eq(sessions.id, id));
  };
};

export async function validateSessions(tokenId: string): Promise<boolean> {
  const [row] = await db
    .select({ isRevoked: sessions.isRevoked })
    .from(sessions)
    .where(eq(sessions.tokenId, tokenId))
    .limit(1);

  if (!row) return false;
  return !row.isRevoked;
};