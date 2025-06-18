import { env } from "@/app/env.mjs";
import { db } from "@/database/database";
import { collections } from "@/database/schema";
import { withUnkey } from "@unkey/nextjs";
import { and, asc, eq, isNotNull } from "drizzle-orm";

export const GET = withUnkey(
  async (req) => {
    const results = await db
      .select()
      .from(collections)
      .where(and(isNotNull(collections.name), eq(collections.deleted, false)))
      .orderBy(asc(collections.name));

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
  {
    apiId: env.UNKEY_API_ID,
    handleInvalidKey: (_req, _res) => {
      return new Response("Unauthorized", { status: 401 });
    },
  },
);
