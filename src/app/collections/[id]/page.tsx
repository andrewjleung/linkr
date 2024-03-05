import { validateCollection } from "@/app/actions";
import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";

export default async function Page({ params }: { params: { id: string } }) {
  const parentId = Number(params.id);

  await validateCollection(parentId);

  return (
    <>
      <Links />
      <CreateLinkForm />
    </>
  );
}
