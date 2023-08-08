import { validateCollection } from "@/app/actions";
import LinksView from "@/components/links-view";

export default async function Page({ params }: { params: { id: string } }) {
  await validateCollection(Number(params.id));
  return <LinksView parentId={Number(params.id)} />;
}
