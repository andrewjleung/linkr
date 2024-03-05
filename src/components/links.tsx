"use client";

import LinkComponent from "@/components/link";
import { ConcreteLink, LinksContext } from "@/hooks/use-optimistic-links";
import { AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const OgObjectSchema = z.object({
  ogTitle: z.optional(z.string()),
  ogDescription: z.optional(z.string()),
});

const OgsResponseSchema = z.array(z.tuple([z.string(), OgObjectSchema]));

export function Links() {
  const { optimisticLinks, reorderOptimisticLinks } = useContext(LinksContext);

  const { data: ogs } = useQuery({
    queryKey: ["ogs"],
    queryFn: () =>
      fetch("/api/opengraphs", { method: "GET", next: { tags: ["ogs"] } })
        .then((res) => res.json())
        .then(OgsResponseSchema.parse)
        .then((ogs) => new Map(ogs)),
  });

  function onDragStart() {}

  function onDragEnd(result: DropResult) {
    // TODO: Put this in a typeguard
    if (optimisticLinks.some((link) => link.type === "abstract")) {
      console.error("cannot reorder links while not all links are persisted");
      return;
    }

    const concreteLinks = optimisticLinks as ConcreteLink[];

    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const link = concreteLinks[result.source.index];

    reorderOptimisticLinks(
      link.id,
      result.source.index,
      result.destination.index
    );
  }

  if (optimisticLinks.length < 1) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-2xl">There&apos;s nothing here! 🙀</h1>
        <p className="text-xs">The world is your oyster. Go find some links!</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="LINK-LIST">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {optimisticLinks.map((l, i) => (
                <Draggable
                  key={`link-${l.id}`}
                  draggableId={`${l.type}-link-${l.id}`}
                  index={i}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-2"
                    >
                      <LinkComponent
                        optimisticLink={l}
                        og={ogs?.get(new URL(l.link.url).origin)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </AnimatePresence>
  );
}
