import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/CreateLinkForm";

export default async function Home() {
  const foo = await prisma.link.findMany();

  return (
    <main>
      <CreateLinkForm />
    </main>
  );
}
