import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/app/env.mjs";
import * as schema from "./schema";

export const client = postgres(env.DRIZZLE_DATABASE_URL, {
  prepare: false,
  transform: { undefined: null },
});
export const db = drizzle(client, { schema });
