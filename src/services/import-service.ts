import { Readable } from "node:stream";
import { db } from "@/database/database";
import { collections, links } from "@/database/schema";
import type { Collection, LinkInsert } from "@/database/types";
import { parse } from "csv-parse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import "server-only";
import { match } from "ts-pattern";
import { z } from "zod";

const raindropCsvRecordSchema = z.object({
	title: z.string(),
	note: z.string(),
	excerpt: z.string(),
	url: z.string().url(),
	folder: z.string(),
	tags: z.string().transform((val) => val.split(",")),
	created: z.string().datetime(),
});

export type ImportedLink = Pick<LinkInsert, "title" | "url" | "description"> & {
	parent: string;
};

export type Edit = Rename | Collapse | Keep | Home;
export type Rename = { type: "rename"; old: string; new: string };
export type Collapse = { type: "collapse"; into: Collection["id"] };
export type Keep = { type: "keep" };
export type Home = { type: "home" };

export async function importFromRaindrop(
	file: ArrayBuffer,
): Promise<ImportedLink[]> {
	const parser = Readable.from(Buffer.from(file)).pipe(
		parse({ columns: true }),
	);

	const links: ImportedLink[] = [];

	for await (const record of parser) {
		const parsed = raindropCsvRecordSchema.parse(record);

		links.push({
			parent: parsed.folder,
			title: parsed.title,
			url: parsed.url,
			description: parsed.note,
		});
	}

	return links;
}

async function applyEdits(
	edits: Record<string, Edit>,
): Promise<Record<string, Collection["parentCollectionId"]>> {
	const createdRenames: Record<string, Collection["id"]> = {};
	const originalCollectionsToIds: Record<
		string,
		Collection["parentCollectionId"]
	> = {};

	for (const [c, edit] of Object.entries(edits)) {
		match(edit)
			.with({ type: "rename" }, async (res) => {
				if (res.new in createdRenames) {
					originalCollectionsToIds[c] = createdRenames[res.new];
					return;
				}

				const results = await db
					.insert(collections)
					.values({ name: res.new, order: 0 })
					.returning({ id: collections.id });

				const id = results[0].id;
				createdRenames[res.new] = id;
				originalCollectionsToIds[c] = id;
				console.log(originalCollectionsToIds);
			})
			.with({ type: "collapse" }, (res) => {
				originalCollectionsToIds[c] = res.into;
			})
			.with({ type: "keep" }, async () => {
				const results = await db
					.insert(collections)
					.values({ name: c, order: 0 })
					.returning({ id: collections.id });

				const id = results[0].id;
				originalCollectionsToIds[c] = id;
			})
			// TODO: This can just be a special case of collapse
			.with({ type: "home" }, () => {
				originalCollectionsToIds[c] = null;
			})
			.exhaustive();
	}

	return originalCollectionsToIds;
}

export async function importLinks(
	importedLinks: ImportedLink[],
	edits: Record<string, Edit>,
) {
	if (importedLinks.length < 1) {
		// TODO: Do something
		return;
	}

	const collectionIds = await applyEdits(edits);
	// console.log("finally", collectionIds);

	// const linkInserts = importedLinks.map((l, i) => ({
	// 	title: l.title,
	// 	description: l.description,
	// 	url: l.url,
	// 	parentCollectionId: collectionIds[l.parent],
	// 	order: i * 100, // TODO: This is a heuristic to just give each a different order.
	// }));
	//
	// await db.insert(links).values(linkInserts);

	revalidatePath("/collections/home");
	redirect("/");
}
