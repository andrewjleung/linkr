import { env } from "@/app/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const client = postgres(env.DATABASE_URL, {
  prepare: false,
  transform: { undefined: null },
});
export const db = drizzle(client, { schema });
