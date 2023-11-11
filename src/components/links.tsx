"use client";

import LinkComponent from "@/components/link";
import {
  ConcreteLink,
  OptimisticLink,
  OptimisticLinks,
} from "@/hooks/use-optimistic-links";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { updateLinkOrder } from "@/app/actions";

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

export function Links({
  optimisticLinks,
  removeOptimisticLink,
  reorderOptimisticLinks,
}: {
  optimisticLinks: OptimisticLink[];
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  reorderOptimisticLinks: OptimisticLinks["reorderOptimisticLinks"];
}) {
  console.count("render");
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

    reorderOptimisticLinks(result.source.index, result.destination.index);

    // TODO: Put this logic into the optimistic links hook
    const order = orderForReorderedElement(
      concreteLinks.map((l) => l.link.order),
      result.source.index,
      result.destination.index
    );

    updateLinkOrder(link.id, order);
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
    <div>
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
                        className="mb-4"
                      >
                        <motion.div whileHover={{ scale: 1.025 }}>
                          <LinkComponent
                            optimisticLink={l}
                            removeOptimisticLink={removeOptimisticLink}
                          />
                        </motion.div>
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
    </div>
  );
}

export function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card
            key={`link-skeleton-${i}`}
            className="w-full ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:animate-pulse dark:ring-offset-neutral-950"
          >
            <CardHeader>
              <div className="h-[1.25rem] w-full"></div>
            </CardHeader>
          </Card>
        ))}
    </div>
  );
}
