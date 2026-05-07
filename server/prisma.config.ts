import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/** Каталог `server/` — для команд з `cd server` і `npx prisma …`. */
const serverDir = path.dirname(fileURLToPath(import.meta.url));

loadEnv({ path: path.join(serverDir, ".env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
