"use client";

import { Link } from "@/database/types";
import { LinksContext, useOptimisticLinks } from "@/hooks/use-optimistic-links";

export default function LinksProvider({
  links,
  children,
}: {
  links: Link[];
  children: React.ReactNode;
}) {
  const ol = useOptimisticLinks(links);

  return <LinksContext.Provider value={ol}>{children}</LinksContext.Provider>;
}
