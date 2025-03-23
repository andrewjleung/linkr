import { env } from "@/app/env.mjs";
import { db } from "@/database/database";
import { eq, count } from "drizzle-orm";
import { links } from "@/database/schema";

function isCronJob(request: Request): boolean {
  const authHeader = request.headers.get("authorization");

  return authHeader === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isCronJob(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const linksCount = await db
    .select({ count: count() })
    .from(links)
    .where(eq(links.deleted, false));

  return new Response(`Linkr is live with ${linksCount[0].count} links.`, {
    status: 400,
  });
}
