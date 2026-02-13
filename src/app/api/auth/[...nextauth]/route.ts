import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // Add other providers here if needed
  ],
  // Optional: Add callbacks, session strategies, etc.
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  callbacks: {
    async session({ session, token, user }) {
      if (token && session.user) { // Ensure session.user exists
        session.user.id = token.sub; // token.sub usually contains the user ID
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // user.id for database user ID
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
