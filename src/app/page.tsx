import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/create-link-form";
import Link from "@/components/link";

export default async function Home() {
  const links = await prisma.link.findMany();

  return (
    <main>
      <CreateLinkForm />
      <ul>
        {links.map((l) => (
          <Link key={`link-${l.id}`} link={l} />
        ))}
      </ul>
    </main>
  );
}
