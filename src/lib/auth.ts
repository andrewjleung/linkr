import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { env } from "../app/env.mjs";

// const prisma = new PrismaClient();
//
// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GithubProvider({
//       clientId: env.GITHUB_CLIENT_ID,
//       clientSecret: env.GITHUB_CLIENT_SECRET
//     })
//   ]
// }
//
