"use client";

import type { Link } from "@/database/types";
import { useLinkStore } from "@/hooks/use-link-store";
import {
  LinksContext,
  type OptimisticLinks,
  useOptimisticLinks,
} from "@/hooks/use-optimistic-links";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { orderForReorderedElement } from "@/lib/order";
import databaseLinkStore from "@/repository/database-link-repository";
import type { LinkRepository } from "@/repository/link-repository";
import { useCallback } from "react";

export function DatabaseLinksProvider({
  links,
  children,
}: {
  links: Link[];
  children: React.ReactNode;
}) {
  const linkStore = databaseLinkStore(links);
  const ol = useOptimisticLinks(linkStore);

  return <LinksContext.Provider value={ol}>{children}</LinksContext.Provider>;
}

export function DemoLinksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const parentId = useParentCollection();
  const linkRepository = useLinkStore(parentId);
  const wrap = useCallback(
    (linkRepository: LinkRepository): OptimisticLinks => {
      return {
        optimisticLinks: linkRepository.links().map((l) => ({
          type: "concrete",
          id: l.id,
          link: l,
        })),
        addOptimisticLink: linkRepository.addLink,
        removeOptimisticLink: linkRepository.removeLink,
        reorderOptimisticLinks: async (
          id: number,
          sourceIndex,
          destinationIndex,
        ) => {
          const order = orderForReorderedElement(
            linkRepository.links().map((l) => l.order),
            sourceIndex,
            destinationIndex,
          );

          linkRepository.reorderLink(id, order);
        },
        editOptimisticLink: linkRepository.editLink,
        moveOptimisticLink: linkRepository.moveLink,
        undoLinkDeletion: linkRepository.undoLinkDeletion,
      };
    },
    [],
  );

  return (
    <LinksContext.Provider value={wrap(linkRepository)}>
      {children}
    </LinksContext.Provider>
  );
}
