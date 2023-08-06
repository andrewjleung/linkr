"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLink(link: Prisma.LinkUncheckedCreateInput) {
  const result = await prisma.link.create({ data: link });
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

export async function createCollection(
  collection: Prisma.CollectionCreateInput
) {
  const result = await prisma.collection.create({ data: collection });
  revalidatePath("/");

  return result;
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
  const nestedCollections = await prisma.collection.findMany({
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
