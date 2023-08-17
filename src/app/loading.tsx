import { LinksSkeleton } from "@/components/links";
import LinksView from "@/components/links-view";

export default function Loading() {
  return (
    <LinksView>
      <LinksSkeleton />
    </LinksView>
  );
}
