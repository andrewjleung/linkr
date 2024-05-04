import { RenameCollectionForm } from "@/components/collection-form";
import { CreateCollectionForm } from "@/components/collection-form";
import { CommandMenu } from "@/components/command-menu";
import { Container } from "@/components/container";
import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import LinksProvider from "@/components/links-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { asc, isNull } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "linkr",
	description: "A home for your links.",
};

export default async function CollectionsHomePage() {
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
