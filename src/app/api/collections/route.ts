import { withUnkey } from "@unkey/nextjs";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/database/database";
import { collections } from "@/database/schema";
import { env } from "@/env";

export const GET = withUnkey(
  async (_req) => {
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
    rootKey: env.UNKEY_ROOT_KEY,
  },
);
