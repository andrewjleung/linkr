"use client";

import type { getOgs } from "@/lib/opengraph";
import type { SuccessResult } from "open-graph-scraper";
import { createContext } from "react";

type Og = Pick<
	SuccessResult["result"],
	"ogTitle" | "ogDescription" | "favicon"
>;

export const OpenGraphContext = createContext<[number, Og][]>([]);

export default function OpenGraphProvider({
	ogs,
	children,
}: { ogs: Awaited<ReturnType<typeof getOgs>>; children: React.ReactNode }) {
	return (
		<OpenGraphContext.Provider value={ogs}>
			{children}
		</OpenGraphContext.Provider>
	);
}
