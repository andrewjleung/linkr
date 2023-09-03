import { validateCollection } from "@/app/actions";
import { Links } from "@/components/links";
import LinksView from "@/components/links-view";
import prisma from "@/lib/prisma";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);
  const links = await prisma.link.findMany({ where: { parentId } });

  await validateCollection(parentId);

  return (
    <LinksView>
      <Links links={links} />
    </LinksView>
  );
}
