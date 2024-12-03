import { CollectionComponent, HomeCollection } from "@/components/collection";
import { Separator } from "@/components/ui/separator";
import {
  CollectionsContext,
  type ConcreteCollection,
  OptimisticCollection,
  OptimisticCollections,
} from "@/hooks/use-optimistic-collections";
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useContext } from "react";

export function Collections() {
  const { optimisticCollections, reorderCollection } =
    useContext(CollectionsContext);

  function onDragEnd(result: DropResult) {
    if (optimisticCollections.some((c) => c.type === "abstract")) {
      console.error(
        "cannot reorder collections while not all collections are persisted",
      );
      return;
    }

    const concreteCollections = optimisticCollections as ConcreteCollection[];

    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const collection = concreteCollections[result.source.index];

    reorderCollection(
      collection.collection.id,
      result.source.index,
      result.destination.index,
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <HomeCollection />
      <Separator />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="COLLECTION-LIST">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {optimisticCollections.map((c, i) => (
                <Draggable
                  key={`collection-${c.id}`}
                  draggableId={`${c.type}-collection-${c.id}`}
                  index={i}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-2"
                    >
                      <CollectionComponent optimisticCollection={c} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
