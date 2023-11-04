import LinksView from "@/components/links-view";
import prisma from "@/lib/prisma";

export default async function Home() {
  const links = await prisma.link.findMany({
    where: { parentId: null },
  });

  return <LinksView links={links} />;
}
