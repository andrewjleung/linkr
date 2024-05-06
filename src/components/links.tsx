"use client";

import LinkComponent from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { type ConcreteLink, LinksContext } from "@/hooks/use-optimistic-links";
import { openedFormAtom } from "@/state";
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from "@hello-pangea/dnd";
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { useContext } from "react";

export function Links() {
	const { optimisticLinks, reorderOptimisticLinks } = useContext(LinksContext);
	const [, setOpenedForm] = useAtom(openedFormAtom);

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
			<div className="flex flex-1 items-center justify-center ">
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
