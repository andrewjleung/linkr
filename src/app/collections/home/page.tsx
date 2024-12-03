import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import { DatabaseLinksProvider } from "@/components/links-provider";
import OpenGraphProvider from "@/components/opengraph-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { getOgs } from "@/lib/opengraph";
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

	const ogs = await getOgs(links);

	return (
		<DatabaseLinksProvider links={links}>
			<OpenGraphProvider ogs={ogs}>
				<Links />
				<CreateLinkForm />
			</OpenGraphProvider>
		</DatabaseLinksProvider>
	);
}
