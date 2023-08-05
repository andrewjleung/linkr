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

export async function deleteCollection(id: number) {
  const result = await prisma.collection.delete({
    where: {
      id,
    },
  });
  revalidatePath("/");

  return result;
}
