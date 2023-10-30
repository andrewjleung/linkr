import { createLink, deleteLink } from "@/app/actions";
import { Prisma, Link } from "@prisma/client";
import { useOptimistic } from "react";
import { match } from "ts-pattern";

type LinkAdd = {
  type: "add";
  link: Prisma.LinkCreateInput;
};

type LinkDelete = {
  type: "delete";
  id: string | number;
};

type LinkUpdate = LinkAdd | LinkDelete;

type AbstractLink = {
  type: "abstract";
  id: string;
  link: Prisma.LinkCreateInput;
};

type ConcreteLink = {
  type: "concrete";
  id: number;
  link: Link;
};

export type OptimisticLink = AbstractLink | ConcreteLink;

type OptimisticLinks = {
  optimisticLinks: OptimisticLink[];
  addLink: (link: Prisma.LinkCreateInput) => Promise<void>;
  removeLink: (id: number | string) => Promise<void>;
};

function handleAdd(
  state: OptimisticLink[]
): (add: LinkAdd) => OptimisticLink[] {
  return ({ link }) => [
    ...state,
    {
      type: "abstract",
      id: crypto.randomUUID(),
      link,
    } satisfies AbstractLink,
  ];
}

function handleDelete(
  state: OptimisticLink[]
): (del: LinkDelete) => OptimisticLink[] {
  return ({ id }) => state.filter((l) => l.id !== id);
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

  async function addLink(link: Prisma.LinkCreateInput) {
    updateOptimisticLinks({ type: "add", link });
    console.log("yay");
    await createLink(link);
    console.log("nooo");
  }

  async function removeLink(id: number | string) {
    updateOptimisticLinks({ type: "delete", id });

    if (typeof id === "number") {
      await deleteLink(id);
    }
  }

  return {
    optimisticLinks,
    addLink,
    removeLink,
  };
}
