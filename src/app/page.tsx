import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import {
  collections as collectionsSchema,
  links as linksSchema,
} from "@/database/schema";
import { asc, isNull } from "drizzle-orm";
import { getOgs } from "@/lib/opengraph";

export default async function Home() {
  const links = await db
    .select()
    .from(linksSchema)
    .where(isNull(linksSchema.parentCollectionId))
    .orderBy(asc(linksSchema.order));

  const collections = await db
    .select()
    .from(collectionsSchema)
    .orderBy(asc(collectionsSchema.order));

  const ogs = await getOgs(links);

  return <LinksView links={links} collections={collections} ogs={ogs} />;
}
