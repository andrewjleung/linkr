import { Readable } from "node:stream";
import { db } from "@/database/database";
import { collections, links } from "@/database/schema";
import type { Collection, LinkInsert } from "@/database/types";
import { parse } from "csv-parse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export type Edit = Rename | Collapse | Keep;
export type Rename = { type: "rename"; old: string; new: string };
export type Collapse = {
  type: "collapse";
  into: Collection["parentCollectionId"];
};
export type Keep = { type: "keep" };

export async function importFromRaindrop(
  file: Uint8Array,
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
    if (edit.type === "rename") {
      if (edit.new in createdRenames) {
        originalCollectionsToIds[c] = createdRenames[edit.new];
      } else {
        const results = await db
          .insert(collections)
          .values({ name: edit.new, order: 0 })
          .returning({ id: collections.id });

        createdRenames[edit.new] = results[0].id;
        originalCollectionsToIds[c] = createdRenames[edit.new];
      }
    } else if (edit.type === "collapse") {
      originalCollectionsToIds[c] = edit.into;
    } else if (edit.type === "keep") {
      const results = await db
        .insert(collections)
        .values({ name: c, order: 0 })
        .returning({ id: collections.id });

      originalCollectionsToIds[c] = results[0].id;
    }
  }

  return originalCollectionsToIds;
}

function uneditedCollections(
  importedLinks: ImportedLink[],
  edits: Record<string, Edit>,
) {
  // TODO: Ensure empty string not allowed for name?
  const collectionsFromLinks = Array.from(
    new Set(importedLinks.map((l) => l.parent).filter(Boolean)),
  );

  const editedCollections = Object.keys(edits);
  return collectionsFromLinks.filter((c) => !editedCollections.includes(c));
}

async function createCollectionsByName(
  names: string[],
): Promise<Record<string, Collection["id"]>> {
  if (names.length < 1) {
    return {};
  }

  const createdCollections = await db
    .insert(collections)
    .values(names.map((name) => ({ name, order: 0 })))
    .returning({ id: collections.id, name: collections.name });

  const result: Record<string, Collection["id"]> = {};

  for (const { id, name } of createdCollections) {
    if (name === null) {
      continue;
    }

    result[name] = id;
  }

  return result;
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
  const remainingCollections = uneditedCollections(importedLinks, edits);
  const remainingCollectionsIds =
    await createCollectionsByName(remainingCollections);

  const allCollectionIds = { ...collectionIds, ...remainingCollectionsIds };

  const linkInserts = importedLinks.map((l, i) => ({
    title: l.title,
    description: l.description,
    url: l.url,
    parentCollectionId: allCollectionIds[l.parent],
    order: i,
  }));

  await db.insert(links).values(linkInserts);

  revalidatePath("/collections/home");
  redirect("/");
}
