"use server";

import { Collection, Link, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CollectionInsert, LinkInsert } from "@/database/types";
import { db } from "@/database/database";
import { collections, links } from "@/database/schema";
import { desc, eq, isNull } from "drizzle-orm";

// TODO: DRY this up...
const ORDER_BUFFER = 100;

export async function createLink(link: Omit<LinkInsert, "order">) {
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
  revalidatePath("/");

  return result;
}

export async function deleteLink(id: number) {
  const result = await db.delete(links).where(eq(links.id, id));
  revalidatePath("/");

  return result;
}

export async function updateLinkOrder(id: number, order: number) {
  const result = await db.update(links).set({ order }).where(eq(links.id, id));
  revalidatePath("/");

  return result;
}

export async function editLink(id: number, data: LinkInsert) {
  const result = await db.update(links).set(data).where(eq(links.id, id));
  revalidatePath("/");

  return result;
}

export async function validateCollection(id: number) {
  const results = await db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, id));

  if (results.length < 1) {
    redirect("/");
  }
}

export async function createCollection(
  collection: Omit<CollectionInsert, "order">
) {
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

  const result = await db.insert(collections).values({ ...collection, order });
  revalidatePath("/");

  return result;
}

export async function renameCollection(id: number, name: string) {
  const result = await db
    .update(collections)
    .set({ name })
    .where(eq(collections.id, id));

  revalidatePath("/");

  return result;
}

export async function safeDeleteCollection(id: number) {
  const updatedCollections = await db
    .update(collections)
    .set({ parentCollectionId: null })
    .where(eq(collections.parentCollectionId, id));

  const updatedLinks = await db
    .update(links)
    .set({ parentCollectionId: null })
    .where(eq(links.parentCollectionId, id));

  const deletedCollection = await db
    .delete(collections)
    .where(eq(collections.id, id));

  revalidatePath("/");

  return {
    updatedCollections,
    updatedLinks,
    deletedCollection,
  };
}

export async function unsafeDeleteCollection(id: number) {
  // TODO: This is going to run a ton of queries...
  const nestedCollections = await db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.parentCollectionId, id));

  const deletedNestedCollections = await Promise.all(
    nestedCollections.map(({ id }) => {
      unsafeDeleteCollection(id);
    })
  );

  const deletedLinks = await db
    .delete(links)
    .where(eq(links.parentCollectionId, id));

  const deletedCollection = await db
    .delete(collections)
    .where(eq(collections.id, id));

  revalidatePath("/");

  return {
    deletedNestedCollections,
    deletedLinks,
    deletedCollection,
  };
}

export async function updateCollectionOrder(id: number, order: number) {
  const result = await db
    .update(collections)
    .set({ order })
    .where(eq(collections.id, id));

  revalidatePath("/");

  return result;
}
