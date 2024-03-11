import { Links } from "@/components/links";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { asc, isNull } from "drizzle-orm";
import LinksProvider from "@/components/links-provider";
import { RenameCollectionForm } from "@/components/collection-form";
import { CommandMenu } from "@/components/command-menu";
import { CreateCollectionForm } from "@/components/collection-form";
import { CreateLinkForm } from "@/components/link-form";

export default async function Home() {
  const links = await db
    .select()
    .from(linksSchema)
    .where(isNull(linksSchema.parentCollectionId))
    .orderBy(asc(linksSchema.order));

  return (
    <LinksProvider links={links}>
      <Links />
      <CommandMenu />
      <CreateLinkForm />
      <CreateCollectionForm />
      <RenameCollectionForm />
    </LinksProvider>
  );
}
