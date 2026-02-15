import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenId: varchar("token_id", { length: 36 }).notNull().unique(),
  ip: varchar("ip", { length: 45 }).default("Unknown").notNull(),
  city: varchar("city", { length: 100 }).default("Unknown").notNull(),
  country: varchar("country", { length: 100 }).default("Unknown").notNull(),
  region: varchar("region", { length: 100 }).default("Unknown").notNull(),
  browser: varchar("browser", { length: 100 }).default("Unknown").notNull(),
  os: varchar("os", { length: 100 }).default("Unknown").notNull(),
  userAgent: text("user_agent").default("").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;