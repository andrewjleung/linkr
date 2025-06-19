import { env } from "@/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loggedIn(): Promise<boolean> {
  const client = createClient();

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  return error === null && user !== null && user.id === env.NEXT_PUBLIC_USER_ID;
}
