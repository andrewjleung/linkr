import { validateCollection } from "@/app/actions";
import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import {
  collections as collectionsSchema,
  links as linksSchema,
} from "@/database/schema";
import { getOgs } from "@/lib/opengraph";
import { asc, eq } from "drizzle-orm";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  const links = await db
    .select()
    .from(linksSchema)
    .where(eq(linksSchema.parentCollectionId, parentId))
    .orderBy(asc(linksSchema.order));

  const collections = await db
    .select()
    .from(collectionsSchema)
    .orderBy(asc(collectionsSchema.order));

  const ogs = await getOgs(links);

  return <LinksView links={links} collections={collections} ogs={ogs} />;
}
