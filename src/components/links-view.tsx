"use client";

import { CreateLinkForm } from "@/components/link-form";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";
import type { Link } from "@/database/types";
import { Links } from "@/components/links";

export default function LinksView({ links }: { links: Link[] }) {
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
        removeOptimisticLink={removeOptimisticLink}
        reorderOptimisticLinks={reorderOptimisticLinks}
        editOptimisticLink={editOptimisticLink}
      />
      <CreateLinkForm addOptimisticLink={addOptimisticLink} />
    </>
  );
}
