"use client";

import { CreateLinkForm } from "@/components/create-link-form";
import { Link } from "@prisma/client";
import { Links } from "@/components/links";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";

export default function LinksView({
  unoptimisticLinks,
}: {
  unoptimisticLinks: Link[];
}) {
  const { optimisticLinks, addLink, removeLink } =
    useOptimisticLinks(unoptimisticLinks);

  return (
    <>
      <Links optimisticLinks={optimisticLinks} removeLink={removeLink} />
      <CreateLinkForm addLink={addLink} />
    </>
  );
}
