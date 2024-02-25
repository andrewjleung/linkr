"use client";

import { CreateLinkForm } from "@/components/link-form";
import { LinksContext, useOptimisticLinks } from "@/hooks/use-optimistic-links";
import { Links } from "@/components/links";
import { Collection, Link } from "@/database/types";
import { OgObject } from "open-graph-scraper/dist/lib/types";

export default function LinksView({
  links,
  collections,
  ogs,
}: {
  links: Link[];
  collections: Collection[];
  ogs: Map<string, OgObject>;
}) {
  const ol = useOptimisticLinks(links);

  return (
    <LinksContext.Provider value={ol}>
      <Links collections={collections} ogs={ogs} />
      <CreateLinkForm />
    </LinksContext.Provider>
  );
}
