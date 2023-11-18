"use client";

import { CreateLinkForm } from "@/components/link-form";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";
import { Links } from "@/components/links";
import { LinkWithOg } from "@/app/page";

export default function LinksView({ links }: { links: LinkWithOg[] }) {
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
