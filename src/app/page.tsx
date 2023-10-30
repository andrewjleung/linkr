import LinksView from "@/components/links-view";
import { getLinks } from "./actions";

export default async function Home() {
  const unoptimisticLinks = await getLinks();

  return <LinksView unoptimisticLinks={unoptimisticLinks} />;
}
