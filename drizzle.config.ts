import type { Config } from "drizzle-kit";
import { env } from "./src/app/env.mjs";

export default {
  schema: "./src/database/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
} satisfies Config;
