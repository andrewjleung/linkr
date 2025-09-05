"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

interface LoginResponse {
  error: null | string;
}

export async function login() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${getURL()}api/auth/callback`,
    },
  });

  if (error) {
    if (error?.message) {
      return { error: `Login failed: ${error?.message}` };
    }

    return { error: "Login failed" };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: null };
}
