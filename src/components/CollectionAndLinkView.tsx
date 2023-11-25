"use client";

import { CollectionsView } from "./collections-view";
import LinksView from "./links-view";
import { DragDropContext } from "./drag-drop-context";
import { DropResult } from "@hello-pangea/dnd";
import { Collection, Link } from "@/database/types";
import { OgObject } from "open-graph-scraper/dist/lib/types";

export async function CollectionAndLinkView({
  collections,
  links,
  ogs,
}: {
  collections: Collection[];
  links: Link[];
  ogs: Map<string, OgObject>;
}) {
  function onDragEnd(result: DropResult) {}

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-3 gap-8 px-8 pt-8">
        <div className="col-span-1">
          <CollectionsView unoptimisticCollections={collections} />
        </div>
        <div className="col-span-2 mr-4 h-[calc(100vh-97px)] overflow-y-auto">
          <LinksView links={links} collections={collections} ogs={ogs} />
        </div>
      </div>
    </DragDropContext>
  );
}
