import { validateCollection } from "@/app/actions";
import { LinkSearcher } from "@/components/link-searcher";
import { Links } from "@/components/links";
import LinksProvider from "@/components/links-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { asc, eq, isNull } from "drizzle-orm";
import { RenameCollectionForm } from "@/components/collection-form";
import { CommandMenu } from "@/components/command-menu";
import { CreateCollectionForm } from "@/components/collection-form";
import { CreateLinkForm } from "@/components/link-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "linkr",
  description: "A home for your links.",
};

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  const links = await db
    .select()
    .from(linksSchema)
    .where(eq(linksSchema.parentCollectionId, parentId))
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
