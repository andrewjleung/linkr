import { Readable } from "node:stream";
import type { LinkInsert } from "@/database/types";
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

export type ImportedLink = Pick<LinkInsert, "title" | "url" | "description"> & {
	parent: string;
};

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
