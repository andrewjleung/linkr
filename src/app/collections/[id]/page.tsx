import LinksView from "@/components/links-view";

export default function Page({ params }: { params: { id: string } }) {
  return <LinksView parentId={Number(params.id)} />;
}
