"use client";

import LinkComponent from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { useKeyPress } from "@/hooks/use-keyboard";
import {
	type ConcreteLink,
	LinksContext,
	type OptimisticLink,
} from "@/hooks/use-optimistic-links";
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

export function Links() {
	const { optimisticLinks, reorderOptimisticLinks } = useContext(LinksContext);
	const [, setOpenedForm] = useAtom(openedFormAtom);
	const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
	const selecting = selectedLinks.length > 0;

	useKeyPress(
		{ shiftKey: false, metaKey: false, key: "Escape" },
		(event) => {
			event.preventDefault();
			setSelectedLinks([]);
		},
		selectedLinks.length < 1,
	);

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

	const selected = useCallback(
		(link: OptimisticLink) => {
			if (link.type === "abstract") {
				return false;
			}

			return selectedLinks.includes(link.id);
		},
		[selectedLinks],
	);

	const setSelected = useCallback(
		(link: OptimisticLink) =>
			(selectedAction: React.SetStateAction<boolean>) => {
				if (link.type === "abstract") {
					return;
				}

				if (typeof selectedAction === "boolean") {
					setSelectedLinks((sl) =>
						selectedAction
							? [...sl, link.id]
							: sl.filter((id) => id !== link.id),
					);
					return;
				}

				const currentSelected = selected(link);
				setSelectedLinks((sl) =>
					selectedAction(currentSelected)
						? [...sl, link.id]
						: sl.filter((id) => id !== link.id),
				);
			},
		[selected],
	);

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

	return (
		<AnimatePresence>
			<DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
				<div className="w-full">
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
													showIcon={!selecting}
													selecting={selecting}
													selected={selected(l)}
													setSelected={setSelected(l)}
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
		</AnimatePresence>
	);
}
