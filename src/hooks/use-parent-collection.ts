import { useParams } from "next/navigation";

export function useParentCollection(): number | null {
  const { id } = useParams();
  const parentId = Number(id) || null;

  return parentId;
}
