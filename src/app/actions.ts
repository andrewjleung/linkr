"use server";

import { env } from "@/app/env.mjs";
import { db } from "@/database/database";
import { collections, links } from "@/database/schema";
import type { CollectionInsert, LinkInsert } from "@/database/types";
import { createClient } from "@/lib/supabase/server";
import { importFromRaindrop, importLinks } from "@/services/import-service";
import type { Edit, ImportedLink } from "@/services/import-service";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// TODO: DRY this up...
const ORDER_BUFFER = 100;

type Action<T extends Array<P>, R, P> = (...params: T) => Promise<R>;

async function loggedIn(): Promise<boolean> {
	const client = createClient();

	const {
		data: { user },
		error,
	} = await client.auth.getUser();

	return error === null && user !== null && user.id === env.NEXT_PUBLIC_USER_ID;
}

const createProtectedAction =
	<T extends Array<P>, R, P>(action: Action<T, R, P>) =>
	async (...params: T) => {
		const li = await loggedIn();
		if (!li) {
			console.log("not logged in");
			return;
		}

		return action(...params);
	};

export const createLink = createProtectedAction(
	async (link: Omit<LinkInsert, "order" | "deleted">) => {
		// TODO: Reset ordering numbers of links in collection
		const lastLinkInCollection = await db.query.links.findFirst({
			where:
				link.parentCollectionId === null
					? isNull(links.parentCollectionId)
					: eq(links.parentCollectionId, link.parentCollectionId),
			orderBy: desc(links.order),
		});

		const order =
			lastLinkInCollection === undefined
				? ORDER_BUFFER
				: lastLinkInCollection.order + ORDER_BUFFER;

		const result = await db.insert(links).values({ ...link, order });
		revalidatePath("/collections/home");

		return result;
	},
);

export const deleteLink = createProtectedAction(async (id: number) => {
	const result = await db
		.update(links)
		.set({ deleted: true })
		.where(eq(links.id, id));
	revalidatePath("/collections/home");

	return result;
});

export const undoLinkDeletion = createProtectedAction(async (id: number) => {
	const result = await db
		.update(links)
		.set({ deleted: false })
		.where(eq(links.id, id));

	revalidatePath("/collections/home");
	return result;
});

export const updateLinkOrder = createProtectedAction(
	async (id: number, order: number) => {
		const result = await db
			.update(links)
			.set({ order })
			.where(eq(links.id, id));
		revalidatePath("/collections/home");

		return result;
	},
);

export const editLink = createProtectedAction(
	async (
		id: number,
		data: Pick<LinkInsert, "title" | "url" | "description">,
	) => {
		const result = await db
			.update(links)
			.set({ ...data, updatedAt: new Date(Date.now()) })
			.where(eq(links.id, id));
		revalidatePath("/collections/home");

		return result;
	},
);

export const moveLink = createProtectedAction(
	async (id: number, parentCollectionId: number | null) => {
		const lastLinkInCollection = await db.query.links.findFirst({
			where:
				parentCollectionId === null
					? isNull(links.parentCollectionId)
					: eq(links.parentCollectionId, parentCollectionId),
			orderBy: desc(links.order),
		});

		const order =
			lastLinkInCollection === undefined
				? ORDER_BUFFER
				: lastLinkInCollection.order + ORDER_BUFFER;

		const result = db
			.update(links)
			.set({ parentCollectionId, order })
			.where(eq(links.id, id));

		revalidatePath("/collections/home");
		revalidatePath("/collections/[slug]", "page");

		return result;
	},
);

export const validateCollection = createProtectedAction(async (id: number) => {
	const results = await db
		.select({ id: collections.id })
		.from(collections)
		.where(and(eq(collections.id, id), eq(collections.deleted, false)));

	if (results.length < 1) {
		redirect("/");
	}
});

export const createCollection = createProtectedAction(
	async (collection: Omit<CollectionInsert, "order" | "deleted">) => {
		const lastCollectionInCollection = await db.query.collections.findFirst({
			where:
				collection.parentCollectionId === null
					? isNull(collections.parentCollectionId)
					: eq(collections.parentCollectionId, collection.parentCollectionId),
			orderBy: desc(collections.order),
		});

		const order =
			lastCollectionInCollection === undefined
				? ORDER_BUFFER
				: lastCollectionInCollection.order + ORDER_BUFFER;

		const result = await db
			.insert(collections)
			.values({ ...collection, order })
			.returning();
		revalidatePath("/collections/home");

		return result;
	},
);

export const renameCollection = createProtectedAction(
	async (id: number, name: string) => {
		const result = await db
			.update(collections)
			.set({ name })
			.where(eq(collections.id, id));

		revalidatePath("/collections/home");

		return result;
	},
);

export const safeDeleteCollection = createProtectedAction(
	async (id: number) => {
		await db
			.update(collections)
			.set({ parentCollectionId: null })
			.where(eq(collections.parentCollectionId, id));

		await db
			.update(links)
			.set({ parentCollectionId: null })
			.where(eq(links.parentCollectionId, id));

		await db
			.update(collections)
			.set({ deleted: true })
			.where(eq(collections.id, id));

		revalidatePath("/collections/home");
		redirect("/");
	},
);

export const unsafeDeleteCollection = createProtectedAction(
	async (id: number) => {
		// TODO: This is going to run a ton of queries...
		const nestedCollections = await db
			.select({ id: collections.id })
			.from(collections)
			.where(eq(collections.parentCollectionId, id));

		await Promise.all(
			nestedCollections.map(({ id }) => {
				unsafeDeleteCollection(id);
			}),
		);

		await db
			.update(links)
			.set({ deleted: true })
			.where(eq(links.parentCollectionId, id));

		await db
			.update(collections)
			.set({ deleted: true })
			.where(eq(collections.id, id));

		revalidatePath("/collections/home");
		redirect("/");
	},
);

export const undoUnsafeCollectionDeletion = createProtectedAction(
	async (id: number) => {
		// TODO: This is going to run a ton of queries...
		const nestedCollections = await db
			.select({ id: collections.id })
			.from(collections)
			.where(eq(collections.parentCollectionId, id));

		await Promise.all(
			nestedCollections.map(({ id }) => {
				undoUnsafeCollectionDeletion(id);
			}),
		);

		await db
			.update(links)
			.set({ deleted: false })
			.where(eq(links.parentCollectionId, id));

		await db
			.update(collections)
			.set({ deleted: false })
			.where(eq(collections.id, id));

		revalidatePath("/collections/home");
		redirect("/");
	},
);

export const updateCollectionOrder = createProtectedAction(
	async (id: number, order: number) => {
		const result = await db
			.update(collections)
			.set({ order })
			.where(eq(collections.id, id));

		revalidatePath("/collections/home");

		return result;
	},
);

export const parseRaindropImport = createProtectedAction(
	async (file: string) => {
		const encoded = new TextEncoder().encode(file);
		const result = await importFromRaindrop(encoded);

		return result;
	},
);

export const insertImports = createProtectedAction(
	async (importedLinks: ImportedLink[], edits: Record<string, Edit>) => {
		await importLinks(importedLinks, edits);
	},
);
