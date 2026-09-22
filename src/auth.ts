import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { createWorkspace, getUserWorkspaces } from "@/lib/workspaces/service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) {
        try {
          await createWorkspace(
            user.id,
            user.name ? `${user.name}'s Workspace` : "My Workspace"
          );
        } catch (err) {
          console.error("Failed to auto-create workspace on createUser:", err);
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        try {
          const userWorkspaces = await getUserWorkspaces(user.id);
          if (userWorkspaces.length === 0) {
            await createWorkspace(
              user.id,
              user.name ? `${user.name}'s Workspace` : "My Workspace"
            );
          }
        } catch (err) {
          console.error("Failed to ensure default workspace on sign in:", err);
        }
      }
      if (user?.image) {
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      if (token?.picture && session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});

