import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const canonicalSchemaPath = path.join(rootDir, "prisma/schema.prisma");
const postgresSchemaPath = path.join(rootDir, "prisma/schema.postgresql.prisma");

export function generatePostgresSchema() {
  const canonical = fs.readFileSync(canonicalSchemaPath, "utf-8");
  
  // Replace sqlite datasource provider with postgresql
  const postgresSchema = canonical.replace(
    /datasource\s+db\s*\{[^}]*provider\s*=\s*"sqlite"[^}]*\}/s,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );

  fs.writeFileSync(postgresSchemaPath, postgresSchema, "utf-8");
  console.log(`[Prisma Sync] Generated ${postgresSchemaPath} from canonical ${canonicalSchemaPath}`);
  return postgresSchemaPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePostgresSchema();
}
