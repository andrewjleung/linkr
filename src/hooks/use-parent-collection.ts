import { useParams } from "next/navigation";

export function useParentCollection(): number | null {
	const { id } = useParams();

	const parentId = (() => {
		if (id === undefined) {
			return null;
		}

		return Number(id) || null;
	})();

	return parentId;
}
