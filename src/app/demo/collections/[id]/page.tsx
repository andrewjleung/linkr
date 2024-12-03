"use client";

import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import { DemoLinksProvider } from "@/components/links-provider";
import OpenGraphProvider from "@/components/opengraph-provider";
import { useCollectionStore } from "@/hooks/use-collection-store";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { collections } = useCollectionStore();
  const router = useRouter();
  const parentId = useParentCollection();
  const collection = collections().find((c) => c.id === parentId);

  useEffect(() => {
    if (collection === undefined) {
      router.replace("/demo/collections/home");
    }
  }, [router, collection]);

  return (
    <DemoLinksProvider>
      <OpenGraphProvider ogs={[]}>
        <Links />
        <CreateLinkForm />
      </OpenGraphProvider>
    </DemoLinksProvider>
  );
}
