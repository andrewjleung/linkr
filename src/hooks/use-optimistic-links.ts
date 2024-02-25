import {
  createLink,
  deleteLink,
  editLink,
  moveLink,
  updateLinkOrder,
} from "@/app/actions";
import type { Collection, Link, LinkInsert } from "@/database/types";
import { OgObject } from "open-graph-scraper/dist/lib/types";
// @ts-ignore
import { createContext, startTransition, useOptimistic } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { useParentCollection } from "./use-parent-collection";

const ORDER_BUFFER = 100;

function orderForReorderedElement(
  orders: number[],
  source: number,
  destination: number
): number {
  if (destination === 0) {
    return orders[0] / 2;
  } else if (destination >= orders.length - 1) {
    return orders[orders.length - 1] + ORDER_BUFFER;
  } else {
    if (destination < source) {
      const before = orders[destination - 1];
      const after = orders[destination];
      return (after - before) / 2 + before;
    } else {
      const before = orders[destination];
      const after = orders[destination + 1];
      return (after - before) / 2 + before;
    }
  }
}

const DEFAULT_LINKS_CONTEXT: OptimisticLinks = {
  optimisticLinks: [],
  async addOptimisticLink() {},
  async removeOptimisticLink() {},
  async reorderOptimisticLinks() {},
  async editOptimisticLink() {},
  async moveOptimisticLink() {},
};

export const LinksContext = createContext<OptimisticLinks>(
  DEFAULT_LINKS_CONTEXT
);

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
  addOptimisticLink: (link: Omit<LinkInsert, "order">) => Promise<void>;
  removeOptimisticLink: (id: number) => Promise<void>;
  reorderOptimisticLinks: (
    id: number,
    sourceIndex: number,
    destinationIndex: number
  ) => Promise<void>;
  editOptimisticLink: (id: Link["id"], edit: LinkEdit["edit"]) => Promise<void>;
  moveOptimisticLink: (
    link: Link,
    newParent: Collection | null
  ) => Promise<void>;
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
  const parentId = useParentCollection();

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

  async function addOptimisticLink(link: Omit<LinkInsert, "order">) {
    startTransition(() => updateOptimisticLinks({ type: "add", link }));
    toast("Link has been created.", { description: link.url });
    await createLink(link);
  }

  async function removeOptimisticLink(id: number) {
    startTransition(() => updateOptimisticLinks({ type: "delete", id }));
    toast("Link has been deleted.");
    await deleteLink(id);
  }

  async function reorderOptimisticLinks(
    id: number,
    sourceIndex: number,
    destinationIndex: number
  ) {
    startTransition(() =>
      updateOptimisticLinks({ type: "reorder", sourceIndex, destinationIndex })
    );

    const order = orderForReorderedElement(
      concreteLinks.map((l) => l.link.order),
      sourceIndex,
      destinationIndex
    );

    await updateLinkOrder(id, order);
  }

  async function editOptimisticLink(id: Link["id"], edit: LinkEdit["edit"]) {
    startTransition(() => updateOptimisticLinks({ type: "edit", id, edit }));
    toast("Link has been edited.", { description: edit.url });
    await editLink(id, edit);
  }

  async function moveOptimisticLink(link: Link, newParent: Collection | null) {
    const newParentId = newParent?.id || null;
    const newParentName = newParent?.name || "Home";

    if (newParentId === parentId) {
      toast.info("Link is already in this collection.");
      return;
    }

    startTransition(() =>
      updateOptimisticLinks({ type: "delete", id: link.id })
    );
    toast.success(`Link has been moved to collection "${newParentName}"`);
    await moveLink(link.id, newParentId);
  }

  return {
    optimisticLinks,
    addOptimisticLink,
    removeOptimisticLink,
    reorderOptimisticLinks,
    editOptimisticLink,
    moveOptimisticLink,
  };
}
