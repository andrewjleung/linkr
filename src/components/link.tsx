import { Link } from "@prisma/client";
import DeleteLinkButton from "./delete-link-button";

export default function Link({ link }: { link: Link }) {
  return (
    <span className="flex flex-row items-center gap-4">
      <DeleteLinkButton link={link} />
      {link.url}
    </span>
  );
}
