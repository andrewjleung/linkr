import { Links } from "@/components/links";
import LinksView from "@/components/links-view";
import prisma from "@/lib/prisma";

export default async function Home() {
  const links = await prisma.link.findMany({ where: { parentId: null } });

  return (
    <LinksView>
      <Links links={links} />
    </LinksView>
  );
}
