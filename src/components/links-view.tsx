"use client";

import { CreateLinkForm } from "@/components/link-form";
import { Link } from "@prisma/client";
import { Links } from "@/components/links";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";

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
