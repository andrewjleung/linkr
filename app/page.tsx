import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"

export default async function Page() {
  const session = await getServerSession(authOptions);

  return <h1>Hello world!</h1>
}
