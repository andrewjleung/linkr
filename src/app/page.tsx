import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import { links } from "@/database/schema";
import { asc, isNull } from "drizzle-orm";

export default async function Home() {
  const result = await db
    .select()
    .from(links)
    .where(isNull(links.parentCollectionId))
    .orderBy(asc(links.order));

  return <LinksView links={result} />;
}
