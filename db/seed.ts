/**
 * Seed Script — creates demo admin and user accounts
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Make sure DATABASE_URL is set in .env.local
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Create tables if they don't exist (run db:push first ideally)
  await sql`
    DO $$ BEGIN
      CREATE TYPE role AS ENUM ('user', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role role NOT NULL DEFAULT 'user',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  const adminPassword = await bcrypt.hash("admin123!", 12);
  const userPassword = await bcrypt.hash("user1234!", 12);

  // Upsert admin
  await sql`
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin User', 'admin@demo.com', ${adminPassword}, 'admin')
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      updated_at = NOW();
  `;
  console.log("✅ Admin created: admin@demo.com / admin123!");

  // Upsert regular user
  await sql`
    INSERT INTO users (name, email, password, role)
    VALUES ('Regular User', 'user@demo.com', ${userPassword}, 'user')
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      updated_at = NOW();
  `;
  console.log("✅ User created:  user@demo.com  / user1234!");

  // Add a few more sample users
  const sampleUsers = [
    { name: "Alice Johnson", email: "alice@demo.com" },
    { name: "Bob Smith", email: "bob@demo.com" },
    { name: "Carol Williams", email: "carol@demo.com" },
  ];

  for (const u of sampleUsers) {
    const pw = await bcrypt.hash("demo1234!", 12);
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${u.name}, ${u.email}, ${pw}, 'user')
      ON CONFLICT (email) DO NOTHING;
    `;
    console.log(`✅ Sample user:   ${u.email}  / demo1234!`);
  }

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});