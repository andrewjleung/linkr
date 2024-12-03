"use client";

import LinkComponent from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { useKeyPress } from "@/hooks/use-keyboard";
import {
  type ConcreteLink,
  LinksContext,
  type OptimisticLink,
} from "@/hooks/use-optimistic-links";
import { cn } from "@/lib/utils";
import { openedFormAtom } from "@/state";
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { useCallback, useContext, useState } from "react";

type UseLinkSelection = {
  selectedLinks: number[];
  selecting: boolean;
  cursor: number;
  setCursor: React.Dispatch<React.SetStateAction<number>>;
  isLinkSelected: (optimisticLink: OptimisticLink) => boolean;
  setIsLinkSelected: (
    optimisticLink: OptimisticLink,
    selected: React.SetStateAction<boolean>,
  ) => void;
};

function useLinkSelection(optimisticLinks: OptimisticLink[]): UseLinkSelection {
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const selecting = selectedLinks.length > 0;
  const [cursor, setCursor] = useState(0);

  useKeyPress(
    { shiftKey: false, metaKey: false, key: "Escape" },
    (event) => {
      event.preventDefault();
      setSelectedLinks([]);
      setCursor(0);
    },
    selectedLinks.length < 1,
  );

  useKeyPress(
    { shiftKey: false, metaKey: false, key: "j" },
    (event) => {
      event.preventDefault();
      setCursor((c) => Math.min(optimisticLinks.length - 1, c + 1));
    },
    !selecting,
  );

  useKeyPress(
    { shiftKey: false, metaKey: false, key: "k" },
    (event) => {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    },
    !selecting,
  );

  useKeyPress(
    { shiftKey: false, metaKey: false, key: " " },
    (event) => {
      event.preventDefault();
      setIsLinkSelected(optimisticLinks[cursor], (s) => !s);
    },
    !selecting,
  );

  const isLinkSelected = useCallback(
    (link: OptimisticLink) => {
      if (link.type === "abstract") {
        return false;
      }

      return selectedLinks.includes(link.id);
    },
    [selectedLinks],
  );

  const setIsLinkSelected = useCallback(
    (link: OptimisticLink, selectedAction: React.SetStateAction<boolean>) => {
      if (link.type === "abstract") {
        return;
      }

      if (typeof selectedAction === "boolean") {
        setSelectedLinks((sl) =>
          selectedAction ? [...sl, link.id] : sl.filter((id) => id !== link.id),
        );
        return;
      }

      const currentSelected = isLinkSelected(link);
      setSelectedLinks((sl) =>
        selectedAction(currentSelected)
          ? [...sl, link.id]
          : sl.filter((id) => id !== link.id),
      );
    },
    [isLinkSelected],
  );

  return {
    selectedLinks,
    selecting,
    cursor,
    setCursor,
    isLinkSelected,
    setIsLinkSelected,
  };
}

export function Links() {
  const { optimisticLinks, reorderOptimisticLinks } = useContext(LinksContext);
  const [, setOpenedForm] = useAtom(openedFormAtom);
  const { selecting, cursor, isLinkSelected, setIsLinkSelected } =
    useLinkSelection(optimisticLinks);

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
      result.destination.index,
    );
  }

  if (optimisticLinks.length < 1) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col gap-2 mb-24">
          <div className="flex flex-row items-center">
            <Badge
              variant="secondary"
              className="hover:cursor-pointer w-7 h-6 flex items-center justify-center rounded-md px-2 mr-2"
              onClick={() => setOpenedForm("create-link-form")}
            >
              q
            </Badge>
            to create a link
          </div>
          <div className="flex flex-row items-center">
            <Badge
              variant="secondary"
              className="hover:cursor-pointer w-7 h-6 flex items-center justify-center rounded-md px-2 mr-2"
              onClick={() => setOpenedForm("create-collection-form")}
            >
              Q
            </Badge>
            to create a collection
          </div>
        </div>
      </div>
    );
  }

  if (selecting) {
    return (
      <AnimatePresence>
        <div className="w-full flex flex-col">
          {optimisticLinks.map((l, i) => (
            <div
              key={`link-${l.id}`}
              className={cn("mb-2 relative", {
                "outline outline-neutral-400 dark:outline-neutral-600 rounded-lg":
                  cursor === i,
              })}
            >
              <LinkComponent
                optimisticLink={l}
                showIcon={!selecting}
                selecting={selecting}
                selected={isLinkSelected(l)}
                onSelect={(selected) => setIsLinkSelected(l, selected)}
              />
            </div>
          ))}
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="w-full flex flex-col">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="w-full">
            <Droppable droppableId="LINK-LIST">
              {(provided, _snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {optimisticLinks.map((l, i) => (
                    <Draggable
                      key={`link-${l.id}`}
                      draggableId={`${l.type}-link-${l.id}`}
                      index={i}
                    >
                      {(provided, _snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          <LinkComponent
                            optimisticLink={l}
                            showIcon={!selecting}
                            selecting={selecting}
                            selected={isLinkSelected(l)}
                            onSelect={(selected) =>
                              setIsLinkSelected(l, selected)
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </AnimatePresence>
  );
}
