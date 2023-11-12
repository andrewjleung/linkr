"use server";

import { Collection, Link, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLink(
  link: Parameters<typeof prisma.link.create>[0]["data"]
) {
  const lastLinkInCollection = await prisma.link.findFirst({
    where: { parentId: link.parentId },
    orderBy: { order: "desc" },
  });

  const order =
    lastLinkInCollection === null ? 100 : lastLinkInCollection.order + 100;

  const result = await prisma.link.create({ data: { ...link, order } });
  revalidatePath("/");

  return result;
}

export async function deleteLink(id: number) {
  const result = await prisma.link.delete({
    where: {
      id,
    },
  });
  revalidatePath("/");

  return result;
}

export async function updateLinkOrder(id: number, order: number) {
  const result = await prisma.link.update({ where: { id }, data: { order } });
  revalidatePath("/");

  return result;
}

export async function editLink(id: number, data: Prisma.LinkUpdateInput) {
  const result = await prisma.link.update({ where: { id }, data });
  revalidatePath("/");

  return result;
}

export async function validateCollection(id: number) {
  "use server";

  const count = await prisma.collection.count({ where: { id } });

  if (count < 1) {
    redirect("/");
  }
}

export async function createCollection(
  collection: Prisma.CollectionCreateInput
) {
  const result = await prisma.collection.create({ data: collection });

  revalidatePath("/");

  return result;
}

export async function renameCollection(id: number, name: string) {
  const updatedCollection = await prisma.collection.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  revalidatePath("/");

  return updatedCollection;
}

export async function safeDeleteCollection(id: number) {
  const updatedCollections = await prisma.collection.updateMany({
    where: {
      parentId: id,
    },
    data: {
      parentId: undefined,
    },
  });

  const updatedLinks = await prisma.link.updateMany({
    where: {
      parentId: id,
    },
    data: {
      parentId: undefined,
    },
  });

  const deletedCollection = await prisma.collection.delete({
    where: {
      id,
    },
  });

  revalidatePath("/");

  return {
    updatedCollections,
    updatedLinks,
    deletedCollection,
  };
}

export async function unsafeDeleteCollection(id: number) {
  const nestedCollections: Collection[] = await prisma.collection.findMany({
    where: {
      parentId: id,
    },
  });

  const deletedNestedCollections = await Promise.all(
    nestedCollections.map((collection) => {
      unsafeDeleteCollection(collection.id);
    })
  );

  const deletedLinks = await prisma.link.deleteMany({
    where: {
      parentId: id,
    },
  });

  const deletedCollection = await prisma.collection.delete({
    where: {
      id,
    },
  });

  revalidatePath("/");

  return {
    deletedNestedCollections,
    deletedLinks,
    deletedCollection,
  };
}
