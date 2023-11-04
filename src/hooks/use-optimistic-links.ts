import { Prisma, Link } from "@prisma/client";
import { useOptimistic } from "react";
import { match } from "ts-pattern";

type LinkAdd = {
  type: "add";
  link: Prisma.LinkCreateInput;
};

type LinkDelete = {
  type: "delete";
  id: number;
};

type LinkUpdate = LinkAdd | LinkDelete;

type AbstractLink = {
  type: "abstract";
  link: Prisma.LinkCreateInput;
};

type ConcreteLink = {
  type: "concrete";
  id: number;
  link: Link;
};

export type OptimisticLink = AbstractLink | ConcreteLink;

export type OptimisticLinks = {
  optimisticLinks: OptimisticLink[];
  addOptimisticLink: (link: Prisma.LinkCreateInput) => Promise<void>;
  removeOptimisticLink: (id: number) => Promise<void>;
};

function handleAdd(
  state: OptimisticLink[]
): (add: LinkAdd) => OptimisticLink[] {
  return ({ link }) => [
    ...state,
    {
      type: "abstract",
      link,
    } satisfies AbstractLink,
  ];
}

function handleDelete(
  state: OptimisticLink[]
): (del: LinkDelete) => OptimisticLink[] {
  return ({ id }) => state.filter((l) => l.type == "abstract" || l.id !== id);
}

export function useOptimisticLinks(links: Link[]): OptimisticLinks {
  const concreteLinks: OptimisticLink[] = links.map((link) => ({
    type: "concrete",
    id: link.id,
    link,
  }));

  const [optimisticLinks, updateOptimisticLinks] = useOptimistic<
    OptimisticLink[],
    LinkUpdate
  >(concreteLinks, (state: OptimisticLink[], update: LinkUpdate) =>
    match(update)
      .with({ type: "add" }, handleAdd(state))
      .with({ type: "delete" }, handleDelete(state))
      .exhaustive()
  );

  async function addOptimisticLink(link: Prisma.LinkCreateInput) {
    updateOptimisticLinks({ type: "add", link });
  }

  async function removeOptimisticLink(id: number) {
    updateOptimisticLinks({ type: "delete", id });
  }

  return {
    optimisticLinks,
    addOptimisticLink,
    removeOptimisticLink,
  };
}
