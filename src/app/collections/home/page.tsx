import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import LinksProvider from "@/components/links-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "linkr",
	description: "A home for your links.",
};

export default async function CollectionsHomePage() {
	const links = await db
		.select()
		.from(linksSchema)
		.where(
			and(
				isNull(linksSchema.parentCollectionId),
				eq(linksSchema.deleted, false),
			),
		)
		.orderBy(asc(linksSchema.order));

	return (
		<LinksProvider links={links}>
			<Links />
			<CreateLinkForm />
		</LinksProvider>
	);
}
