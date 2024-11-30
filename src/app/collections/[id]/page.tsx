import { validateCollection } from "@/app/actions";
import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import LinksProvider from "@/components/links-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
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

	return (
		<LinksProvider links={links}>
			<Links />
			<CreateLinkForm />
		</LinksProvider>
	);
}
