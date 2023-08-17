import { validateCollection } from "@/app/actions";
import { Links } from "@/components/links";
import LinksView from "@/components/links-view";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);
  await validateCollection(parentId);

  return (
    <LinksView>
      <Links parentId={parentId} />
    </LinksView>
  );
}
