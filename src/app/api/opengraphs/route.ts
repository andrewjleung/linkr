import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { getOgs } from "@/lib/opengraph";
import { asc, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: only fetch for links of page
  const links = await db
    .select()
    .from(linksSchema)
    .orderBy(asc(linksSchema.order));

  const ogs = await getOgs(links);

  return Response.json({ data: ogs });
}
