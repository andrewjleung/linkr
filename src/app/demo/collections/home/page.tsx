"use client";

import { CreateLinkForm } from "@/components/link-form";
import { Links } from "@/components/links";
import { DemoLinksProvider } from "@/components/links-provider";
import OpenGraphProvider from "@/components/opengraph-provider";

export default function CollectionsHomePage() {
  return (
    <DemoLinksProvider>
      <OpenGraphProvider ogs={[]}>
        <Links />
        <CreateLinkForm />
      </OpenGraphProvider>
    </DemoLinksProvider>
  );
}
