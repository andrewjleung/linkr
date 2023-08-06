import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/create-link-form";
import LinkComponent from "@/components/link";
import { Collection as CollectionModel } from "@prisma/client";

async function Links({ parentId }: { parentId: CollectionModel["parentId"] }) {
  const links = await prisma.link.findMany({ where: { parentId } });

  return (
    <>
      {links.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {links.map((l) => (
            <LinkComponent key={`link-${l.id}`} link={l} />
          ))}
        </ul>
      ) : (
        <h2>There&apos;s nothing here!</h2>
      )}
    </>
  );
}

export default function LinksView({
  parentId,
  loading,
}: {
  parentId: CollectionModel["parentId"];
  loading?: boolean;
}) {
  return (
    <>
      <div className="col-span-3">
        <CreateLinkForm parentId={parentId} />
        {loading ? null : <Links parentId={parentId} />}
      </div>
    </>
  );
}
