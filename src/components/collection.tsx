import { Collection } from "@prisma/client";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const variant = isSelected ? "secondary" : "ghost";

  return (
    <div className="group flex flex-row gap-4">
      <Link
        href={`/collections/${id}`}
        className={cn(buttonVariants({ variant: variant }), "w-full")}
      >
        <div className="w-full">{name}</div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="invisible text-neutral-400 transition-all duration-100 group-hover:visible group-hover:ease-in dark:text-neutral-600"
      >
        <MoreHorizontal />
      </Button>
    </div>
  );
}
