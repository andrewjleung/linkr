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

export function Links() {
  const { optimisticLinks, reorderOptimisticLinks } = useContext(LinksContext);

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
      <div className="mt-16 flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl">There&apos;s nothing here! 🙀</h1>
        <p className="text-md">The world is your oyster. Go find some links!</p>
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
                      <LinkComponent optimisticLink={l} />
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
