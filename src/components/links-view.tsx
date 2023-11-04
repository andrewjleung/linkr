"use client";

import { CreateLinkForm } from "@/components/create-link-form";
import { Link } from "@prisma/client";
import { Links } from "@/components/links";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";

export default function LinksView({ links }: { links: Link[] }) {
  const { optimisticLinks, addOptimisticLink, removeOptimisticLink } =
    useOptimisticLinks(links);

  return (
    <>
      <Links
        optimisticLinks={optimisticLinks}
        removeOptimisticLink={removeOptimisticLink}
      />
      <CreateLinkForm addOptimisticLink={addOptimisticLink} />
    </>
  );
}
