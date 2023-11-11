import LinksView from "@/components/links-view";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Link } from "@prisma/client";

export default async function Page({ params }: { params: { id: string } }) {
  async function validateCollection(id: number) {
    "use server";

    const count = await prisma.collection.count({ where: { id } });

    if (count < 1) {
      redirect("/");
    }
  }

  const parentId = Number(params.id);
  await validateCollection(parentId);
  const links: Link[] = await prisma.link.findMany({
    where: { parentId },
    orderBy: { order: "asc" },
  });

  return <LinksView links={links} />;
}
