import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { asc, isNull } from "drizzle-orm";
import LinksProvider from "@/components/links-provider";
import { CreateCollectionForm } from "@/components/collection-form";

export default async function Home() {
  const links = await db
    .select()
    .from(linksSchema)
    .where(isNull(linksSchema.parentCollectionId))
    .orderBy(asc(linksSchema.order));

  return (
    <LinksProvider links={links}>
      <Links />
    </LinksProvider>
  );
}
