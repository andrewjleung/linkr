"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function createLink(link: Prisma.LinkCreateInput) {
  return prisma.link.create({ data: link });
}

export async function deleteLink(id: number) {
  return prisma.link.delete({
    where: {
      id,
    },
  });
}
