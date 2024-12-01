"use client";

import { useLinkStore } from "@/app/demo/collections/state";
import type { Link } from "@/database/types";
import { LinksContext, useOptimisticLinks } from "@/hooks/use-optimistic-links";
import databaseLinkStore from "@/store/database-link-store";

function DatabaseLinksProvider({
	links,
	children,
}: {
	links: Link[];
	children: React.ReactNode;
}) {
	const linkStore = databaseLinkStore(links);
	const ol = useOptimisticLinks(linkStore);

	return <LinksContext.Provider value={ol}>{children}</LinksContext.Provider>;
}

function DemoLinksProvider({
	links,
	children,
}: {
	links: Link[];
	children: React.ReactNode;
}) {
	const linkStore = useLinkStore(links)();
	const ol = useOptimisticLinks(linkStore);

	return <LinksContext.Provider value={ol}>{children}</LinksContext.Provider>;
}

export default function LinksProvider({
	links,
	store,
	children,
}: {
	links: Link[];
	store?: "database" | "demo";
	children: React.ReactNode;
}) {
	if (store === "demo") {
		return <DemoLinksProvider links={links}>{children}</DemoLinksProvider>;
	}

	return (
		<DatabaseLinksProvider links={links}>{children}</DatabaseLinksProvider>
	);
}
