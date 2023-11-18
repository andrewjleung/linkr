import LinksView from "@/components/links-view";
import { db } from "@/database/database";
import { links as linksSchema } from "@/database/schema";
import { Link } from "@/database/types";
import { asc, isNull } from "drizzle-orm";
import ogs, { SuccessResult } from "open-graph-scraper";

export type LinkWithOg = Link & {
  og?: SuccessResult["result"];
};

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

export default async function Home() {
  const links = await db
    .select()
    .from(linksSchema)
    .where(isNull(linksSchema.parentCollectionId))
    .orderBy(asc(linksSchema.order));

  const linksWithOgs = await getLinksWithOgs(links);

  return <LinksView links={linksWithOgs} />;
}
