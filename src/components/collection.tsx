import { Collection } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CollectionProps = HomeCollection | NonHomeCollection;

type HomeCollection = {
  type: "home";
};

type NonHomeCollection = {
  type: "non-home";
  collection: Collection;
};

export default function Collection({
  collection,
  isSelected,
}: {
  collection: CollectionProps;
  isSelected: boolean;
}) {
  const [id, name] =
    collection.type === "home"
      ? ["", "Home"]
      : [collection.collection.id, collection.collection.name];

  if (isSelected) {
    return (
      <Button variant="secondary" asChild>
        <Link href={`/collections/${id}`}>
          <div className="h-full w-full">{name}</div>
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" asChild>
      <Link href={`/collections/${id}`}>
        <div className="h-full w-full">{name}</div>
      </Link>
    </Button>
  );
}
