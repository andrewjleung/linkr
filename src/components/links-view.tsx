"use client";

import { CreateLinkForm } from "@/components/link-form";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";
import { Links } from "@/components/links";
import { Link } from "@/database/types";
import { OgObject } from "open-graph-scraper/dist/lib/types";

export default function LinksView({
  links,
  ogs,
}: {
  links: Link[];
  ogs: Map<string, OgObject>;
}) {
  const {
    optimisticLinks,
    addOptimisticLink,
    removeOptimisticLink,
    reorderOptimisticLinks,
    editOptimisticLink,
  } = useOptimisticLinks(links);

  return (
    <>
      <Links
        optimisticLinks={optimisticLinks}
        ogs={ogs}
        removeOptimisticLink={removeOptimisticLink}
        reorderOptimisticLinks={reorderOptimisticLinks}
        editOptimisticLink={editOptimisticLink}
      />
      <CreateLinkForm addOptimisticLink={addOptimisticLink} />
    </>
  );
}
