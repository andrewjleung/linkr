import type { Link, LinkInsert } from "@/database/types";
import { OgObject } from "open-graph-scraper/dist/lib/types";
// @ts-ignore
import { startTransition, useOptimistic } from "react";
import { match } from "ts-pattern";

type LinkAdd = {
  type: "add";
  link: Omit<LinkInsert, "order">;
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

type LinkEdit = {
  type: "edit";
  id: Link["id"];
  edit: Pick<Link, "title" | "url" | "description">;
};

type LinkUpdate = LinkAdd | LinkDelete | LinkReorder | LinkEdit;

export type AbstractLink = {
  type: "abstract";
  id: string;
  link: Pick<Link, "title" | "url" | "description" | "order">;
};

export type ConcreteLink = {
  type: "concrete";
  id: number;
  link: Link;
  og?: OgObject;
};

export type OptimisticLink = AbstractLink | ConcreteLink;

export type OptimisticLinks = {
  optimisticLinks: OptimisticLink[];
  addOptimisticLink: (link: Omit<LinkInsert, "parentCollectionId">) => void;
  removeOptimisticLink: (id: number) => void;
  reorderOptimisticLinks: (
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  editOptimisticLink: (id: Link["id"], edit: LinkEdit["edit"]) => void;
};

function handleAdd(
  state: OptimisticLink[]
): (add: LinkAdd) => OptimisticLink[] {
  return ({ link }) => [
    ...state,
    {
      type: "abstract",
      id: crypto.randomUUID(),
      link: {
        title: link.title || null,
        url: link.url,
        description: link.description || null,
        order: Number.POSITIVE_INFINITY,
      },
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

function handleEdit(
  state: OptimisticLink[]
): (edit: LinkEdit) => OptimisticLink[] {
  return ({ id, edit }) => {
    const updateIndex = state.findIndex((l) => l.id === id);

    if (updateIndex === -1) {
      console.error("could not find link to edit");
      return state;
    }

    const originalLink = state[updateIndex];
    const updatedLink: AbstractLink | null = (() => {
      if (originalLink.type === "abstract") {
        return null;
      }

      return {
        type: "abstract",
        id: crypto.randomUUID(),
        link: {
          ...originalLink.link,
          ...edit,
        },
      };
    })();

    if (updatedLink === null) {
      console.error("cannot edit abstract link");
      return state;
    }

    return [
      ...state.slice(0, updateIndex),
      updatedLink,
      ...state.slice(updateIndex + 1),
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
      .with({ type: "edit" }, handleEdit(state))
      .exhaustive()
  );

  function addOptimisticLink(link: AbstractLink["link"]) {
    startTransition(() => updateOptimisticLinks({ type: "add", link }));
  }

  function removeOptimisticLink(id: number) {
    startTransition(() => updateOptimisticLinks({ type: "delete", id }));
  }

  function reorderOptimisticLinks(
    sourceIndex: number,
    destinationIndex: number
  ) {
    startTransition(() =>
      updateOptimisticLinks({ type: "reorder", sourceIndex, destinationIndex })
    );
  }

  function editOptimisticLink(id: Link["id"], edit: LinkEdit["edit"]) {
    startTransition(() => updateOptimisticLinks({ type: "edit", id, edit }));
  }

  return {
    optimisticLinks,
    addOptimisticLink,
    removeOptimisticLink,
    reorderOptimisticLinks,
    editOptimisticLink,
  };
}
