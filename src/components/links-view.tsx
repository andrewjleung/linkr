import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/create-link-form";
import LinkComponent from "@/components/link";
import { Collection as CollectionModel } from "@prisma/client";
import { CreateCollectionForm } from "./create-collection-form";
import Collection from "@/components/collection";

export default async function LinksView({
  parentId,
}: {
  parentId: CollectionModel["parentId"];
}) {
  const links = await prisma.link.findMany({ where: { parentId } });
  const collections = await prisma.collection.findMany();

  return (
    <>
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-4 gap-8 p-8">
        <div className="col-span-1">
          <CreateCollectionForm />
          {collections.length > 0 ? (
            <ul className="mt-4 flex flex-col space-y-2">
              <Collection
                collection={{ type: "home" }}
                isSelected={parentId === null}
              />
              {collections.map((c) => (
                <Collection
                  key={`collection-${c.id}`}
                  collection={{ type: "non-home", collection: c }}
                  isSelected={c.id === parentId}
                />
              ))}
            </ul>
          ) : (
            <h2>There&apos;s nothing here!</h2>
          )}
        </div>
        <div className="col-span-3">
          <CreateLinkForm parentId={parentId} />
          {links.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <LinkComponent key={`link-${l.id}`} link={l} />
              ))}
            </ul>
          ) : (
            <h2>There&apos;s nothing here!</h2>
          )}
        </div>
      </div>
    </>
  );
}
