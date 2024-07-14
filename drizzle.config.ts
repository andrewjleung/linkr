import type { Config } from "drizzle-kit";
import { env } from "./src/app/env.mjs";

export default {
	schema: "./src/database/schema.ts",
	out: "./drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		// @ts-ignore
		url: env.DATABASE_URL,
	},
} satisfies Config;
