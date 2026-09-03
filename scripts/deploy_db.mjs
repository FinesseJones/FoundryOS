import { execSync } from "node:child_process";
import dotenv from "dotenv";
import { generatePostgresSchema } from "./generate_postgres_schema.mjs";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "";

if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
  console.log("[Database Deploy] Postgres DATABASE_URL detected. Synchronizing Postgres schema & running migrations...");
  generatePostgresSchema();
  execSync("npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma", { stdio: "inherit" });
  console.log("[Database Deploy] PostgreSQL migration applied successfully.");
} else {
  console.log("[Database Deploy] DATABASE_URL is SQLite or not set. Keeping local SQLite database.");
  console.log("[Database Deploy] Status: Local SQLite active (Postgres pending DATABASE_URL).");
  console.log("[Database Deploy] Once a Postgres URL is provided, run: npm run db:migrate:postgres");
}
