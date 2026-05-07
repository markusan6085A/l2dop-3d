import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/** Каталог репозиторію — не залежить від `process.cwd()`. */
const repoRoot = path.dirname(fileURLToPath(import.meta.url));

loadEnv({ path: path.join(repoRoot, "server", ".env") });

export default defineConfig({
  schema: path.join("server", "prisma", "schema.prisma"),
});
