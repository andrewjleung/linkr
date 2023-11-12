import { validateCollection } from "@/app/actions";
import LinksView from "@/components/links-view";
import prisma from "@/lib/prisma";
import { Link } from "@prisma/client";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  const links: Link[] = await prisma.link.findMany({
    where: { parentId },
    orderBy: { order: "asc" },
  });

  return <LinksView links={links} />;
}
