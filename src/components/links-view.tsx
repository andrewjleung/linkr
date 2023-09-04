"use client";

import { CreateLinkForm } from "@/components/create-link-form";
import { Link } from "@prisma/client";
import { Links } from "@/components/links";
import { useOptimisticLinks } from "@/hooks/use-optimistic-links";

export default function LinksView({
  links: unoptimisticLinks,
}: {
  links: Link[];
}) {
  const { links, addLink, removeLink } = useOptimisticLinks(unoptimisticLinks);

  return (
    <>
      <Links links={links} removeLink={removeLink} />
      <CreateLinkForm addLink={addLink} />
    </>
  );
}
