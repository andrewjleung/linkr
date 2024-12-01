"use client";

import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import LinksProvider from "@/components/links-provider";
import OpenGraphProvider from "@/components/opengraph-provider";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { getOgs } from "@/lib/opengraph";
import { and, asc, eq, isNull } from "drizzle-orm";
import { useLinkStore } from "../state";

export default function CollectionsHomePage() {
	const links = useLinkStore((state) => state.links)
		.filter(
			(link) => link.parentCollectionId === null && link.deleted === false,
		)
		.sort((a, b) => a.order - b.order);

	return (
		<LinksProvider links={links}>
			<OpenGraphProvider ogs={[]}>
				<Links />
				<CreateLinkForm />
			</OpenGraphProvider>
		</LinksProvider>
	);
}
