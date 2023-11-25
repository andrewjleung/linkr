"use client";

import { Collection, Link } from "@/database/types";
import { CollectionsView } from "./collections-view";
import { LinksView } from "./links-view";
import { OgObject } from "open-graph-scraper/dist/lib/types";
import { DragDropContext } from "./drag-drop-context";
import { DropResult, Droppable } from "@hello-pangea/dnd";
import { ConcreteLink, useOptimisticLinks } from "@/hooks/use-optimistic-links";

export function LinksAndCollectionsView({
  links,
  ogs,
  collections,
}: {
  links: Link[];
  collections: Collection[];
  ogs: Map<string, OgObject>;
}) {
  const optimisticLinksProps = useOptimisticLinks(links);

  function onDragEnd(result: DropResult) {
    console.log(result);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="COLLECTIONS-AND-LINKS" isCombineEnabled>
        {(provided, snapshost) => (
          <div
            ref={provided.innerRef}
            className="mx-auto grid h-full w-full max-w-7xl grid-cols-3 gap-8 px-8 pt-8"
            {...provided.droppableProps}
          >
            <div className="col-span-1">
              <CollectionsView unoptimisticCollections={collections} />
            </div>
            <div className="col-span-2 mr-4 h-[calc(100vh-97px)] overflow-y-auto">
              <LinksView
                optimisticLinksProps={optimisticLinksProps}
                collections={collections}
                ogs={ogs}
              />
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
