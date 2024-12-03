import { validateCollection } from "@/app/actions";
import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import { DatabaseLinksProvider } from "@/components/links-provider";
import OpenGraphProvider from "@/components/opengraph-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { getOgs } from "@/lib/opengraph";
import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

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
		.where(
			and(
				eq(linksSchema.parentCollectionId, parentId),
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
