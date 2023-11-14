import { validateCollection } from "@/app/actions";
import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import { links } from "@/database/schema";
import { asc, eq } from "drizzle-orm";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  const result = await db
    .select()
    .from(links)
    .where(eq(links.parentCollectionId, parentId))
    .orderBy(asc(links.order));

  return <LinksView links={result} />;
}
