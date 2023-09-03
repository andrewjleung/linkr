import { createLink } from "@/app/actions";
import { Link } from "@prisma/client";
import { experimental_useOptimistic as useOptimistic } from "react";

type OptimisticLinkAdd = {
  type: "add";
  link: Link;
};

type OptimisticLinkDelete = {
  type: "delete";
  id: Link["id"];
};

type OptimisticLinkUpdate = OptimisticLinkAdd | OptimisticLinkDelete;

type OptimisticLinks = {
  links: Link[];
  addLink: (link: Link) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
};

export function useOptimisticLinks(links: Link[]): OptimisticLinks {
  const [optimisticLinks, updateOptimisticLinks] = useOptimistic<
    Link[],
    OptimisticLinkUpdate
  >(links, (state: Link[], update: OptimisticLinkUpdate) => {
    if (update.type === "add") {
      return [...state, update.link];
    }

    return state.filter((l) => l.id !== update.id);
  });

  async function addLink(link: Link) {
    updateOptimisticLinks({ type: "add", link });
    await createLink(link);
  }

  async function deleteLink(id: number) {
    updateOptimisticLinks({ type: "delete", id });
    await deleteLink(id);
  }

  return {
    links: optimisticLinks,
    addLink,
    deleteLink,
  };
}
