import { Link as LinkModel } from "@prisma/client";
import DeleteLinkButton from "./delete-link-button";
import Link from "next/link";

export default function LinkComponent({ link }: { link: LinkModel }) {
  return (
    <span className="flex flex-row items-center gap-4">
      <DeleteLinkButton link={link} />
      <Link className="hover:underline" href={link.url}>
        {link.title}
      </Link>
    </span>
  );
}
