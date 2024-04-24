import { Readable } from "node:stream";
import type { CollectionInsert, LinkInsert } from "@/database/types";
import { parse } from "csv-parse";
import "server-only";
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

export type ImportedLink = Pick<LinkInsert, "title" | "url" | "description">;

export async function importFromRaindrop(
	file: ArrayBuffer,
): Promise<Map<CollectionInsert["name"], ImportedLink[]>> {
	const parser = Readable.from(Buffer.from(file)).pipe(
		parse({ columns: true }),
	);
	const collections: Map<CollectionInsert["name"], ImportedLink[]> = new Map();

	for await (const record of parser) {
		console.log(record);
		const parsed = raindropCsvRecordSchema.parse(record);

		const links = collections.get(parsed.folder) || [];
		links.push({
			title: parsed.title,
			url: parsed.url,
			description: parsed.note,
		});

		collections.set(parsed.folder, links);
	}

	return collections;
}
