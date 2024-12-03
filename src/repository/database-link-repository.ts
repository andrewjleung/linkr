import {
	createLink,
	deleteLink,
	editLink,
	moveLink,
	undoLinkDeletion,
	updateLinkOrder,
} from "@/app/actions";
import type { Link } from "@/database/types";
import type { LinkRepository } from "./link-repository";

function discard<U extends unknown[], R>(fn: (...args: U) => Promise<R>) {
	return (...args: U) =>
		fn(...args).then(() => {
			return;
		});
}

export default function databaseLinkStore(links: Link[]): LinkRepository {
	return {
		links: () => links,
		addLink: discard(createLink),
		removeLink: discard(deleteLink),
		reorderLink: discard(updateLinkOrder),
		editLink: discard(editLink),
		moveLink: discard(moveLink),
		undoLinkDeletion: discard(undoLinkDeletion),
	};
}
