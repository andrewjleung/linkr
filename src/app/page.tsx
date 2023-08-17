import { Links } from "@/components/links";
import LinksView from "@/components/links-view";

export default async function Home({ params }: { params: { id: string } }) {
  const parentId = Number(params.id) || null;

  return (
    <LinksView>
      <Links parentId={parentId} />
    </LinksView>
  );
}
