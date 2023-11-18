import { validateCollection } from "@/app/actions";
import { LinkWithOg } from "@/app/page";
import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { Link } from "@/database/types";
import { asc, eq } from "drizzle-orm";
import ogs from "open-graph-scraper";

// TODO: DRY this up w/ home page
async function getLinksWithOgs(links: Link[]): Promise<LinkWithOg[]> {
  const linkOgs = await Promise.allSettled(
    links.map((l) => ogs({ url: l.url }))
  );

  const linksWithOgs = links.map((l, i) => {
    const linkOg = linkOgs[i];

    if (linkOg.status === "rejected") {
      return l;
    }

    if (linkOg.value.result.error) {
      return l;
    }

    return {
      ...l,
      og: linkOg.value.result,
    };
  });

  return linksWithOgs;
}

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  const links = await db
    .select()
    .from(linksSchema)
    .where(eq(linksSchema.parentCollectionId, parentId))
    .orderBy(asc(linksSchema.order));

  const linksWithOgs = await getLinksWithOgs(links);

  return <LinksView links={linksWithOgs} />;
}
