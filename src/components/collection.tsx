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
      <Button variant="outline" asChild>
        <Link href={`/collections/${id}`}>{name}</Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" asChild>
      <Link href={`/collections/${id}`}>{name}</Link>
    </Button>
  );
}
