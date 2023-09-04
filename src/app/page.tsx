import LinksView from "@/components/links-view";
import { getLinks } from "./actions";

export default async function Home() {
  const links = await getLinks();

  return <LinksView links={links} />;
}
