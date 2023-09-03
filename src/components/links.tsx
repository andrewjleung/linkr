"use client";

import LinkComponent from "@/components/link";
import {
  Collection as CollectionModel,
  Link as LinkModel,
} from "@prisma/client";
import { Skeleton } from "./ui/skeleton";
import { experimental_useOptimistic as useOptimistic } from "react";
import { deleteLink } from "@/app/actions";

type OptimisticLinkAdd = {
  type: "add";
  link: LinkModel;
};

type OptimisticLinkDelete = {
  type: "delete";
  id: LinkModel["id"];
};

type OptimisticLinkUpdate = OptimisticLinkAdd | OptimisticLinkDelete;

export async function Links({ links }: { links: LinkModel[] }) {
  const [optimisticLinks, updateOptimisticLinks] = useOptimistic<
    LinkModel[],
    OptimisticLinkUpdate
  >(links, (state: LinkModel[], update: OptimisticLinkUpdate) => {
    if (update.type === "add") {
      return [...state, update.link];
    }

    return state.filter((l) => l.id !== update.id);
  });

  async function deleteLinkWithOptimistic(id: number) {
    updateOptimisticLinks({ type: "delete", id });
    await deleteLink(id);
  }

  return (
    <>
      {optimisticLinks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {optimisticLinks
            .sort((a, b) => a.url.localeCompare(b.url))
            .map((l) => (
              <LinkComponent
                key={`link-${l.id}`}
                link={l}
                deleteLink={deleteLinkWithOptimistic}
              />
            ))}
        </div>
      ) : (
        <div className="flex h-1/4 w-full flex-col items-center justify-center gap-2">
          <h1 className="text-4xl">There&apos;s nothing here! 🙀</h1>
          <p className="text-sm">
            The world is your oyster. Go find some links!
          </p>
        </div>
      )}
    </>
  );
}

export function LinksSkeleton() {
  return (
    <div className="mt-4 space-y-2">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div
            key={`links-skeleton-${i}`}
            className="flex h-10 w-full items-center justify-center"
          >
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
    </div>
  );
}
