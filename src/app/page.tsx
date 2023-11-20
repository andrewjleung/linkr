import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { asc, isNull } from "drizzle-orm";
import { getOgs } from "@/lib/opengraph";

export default async function Home() {
  const links = await db
    .select()
    .from(linksSchema)
    .where(isNull(linksSchema.parentCollectionId))
    .orderBy(asc(linksSchema.order));

  const ogs = await getOgs(links);

  return <LinksView links={links} ogs={ogs} />;
}
