import { Prisma, Link } from "@prisma/client";
import { startTransition, useOptimistic } from "react";
import { match } from "ts-pattern";

type LinkAdd = {
  type: "add";
  link: Prisma.LinkCreateInput;
};

type LinkDelete = {
  type: "delete";
  id: number;
};

type LinkReorder = {
  type: "reorder";
  sourceIndex: number;
  destinationIndex: number;
};

type LinkUpdate = LinkAdd | LinkDelete | LinkReorder;

export type AbstractLink = {
  type: "abstract";
  id: string;
  link: Prisma.LinkCreateInput;
};

export type ConcreteLink = {
  type: "concrete";
  id: number;
  link: Link;
};

export type OptimisticLink = AbstractLink | ConcreteLink;

export type OptimisticLinks = {
  optimisticLinks: OptimisticLink[];
  addOptimisticLink: (link: Prisma.LinkCreateInput) => void;
  removeOptimisticLink: (id: number) => void;
  reorderOptimisticLinks: (
    sourceIndex: number,
    destinationIndex: number
  ) => void;
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
  return ({ id }) => state.filter((l) => l.type == "abstract" || l.id !== id);
}

function handleReorder(
  state: OptimisticLink[]
): (reorder: LinkReorder) => OptimisticLink[] {
  return ({ sourceIndex, destinationIndex }) => {
    if (state.length < 2) {
      return state;
    }

    const element = state[sourceIndex];
    // console.log(sourceIndex, destinationIndex);

    const withoutSource = [
      ...state.slice(0, sourceIndex),
      ...state.slice(sourceIndex + 1),
    ];
    return [
      ...withoutSource.slice(0, destinationIndex),
      element,
      ...withoutSource.slice(destinationIndex),
    ];
  };
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
      .with({ type: "reorder" }, handleReorder(state))
      .exhaustive()
  );

  function addOptimisticLink(link: Prisma.LinkCreateInput) {
    updateOptimisticLinks({ type: "add", link });
  }

  function removeOptimisticLink(id: number) {
    updateOptimisticLinks({ type: "delete", id });
  }

  function reorderOptimisticLinks(
    sourceIndex: number,
    destinationIndex: number
  ) {
    startTransition(() =>
      updateOptimisticLinks({ type: "reorder", sourceIndex, destinationIndex })
    );
  }

  return {
    optimisticLinks,
    addOptimisticLink,
    removeOptimisticLink,
    reorderOptimisticLinks,
  };
}
