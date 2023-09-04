import { getLinks, validateCollection } from "@/app/actions";
import LinksView from "@/components/links-view";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);
  const links = await getLinks(parentId);

  await validateCollection(parentId);

  return <LinksView links={links} />;
}
