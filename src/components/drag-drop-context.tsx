"use client";

import { DragDropContext as DndDragDropContext } from "@hello-pangea/dnd";

export function DragDropContext({
  children,
  ...dndProps
}: { children: React.ReactNode } & React.ComponentProps<
  typeof DndDragDropContext
>) {
  return <DndDragDropContext {...dndProps}>{children}</DndDragDropContext>;
}
