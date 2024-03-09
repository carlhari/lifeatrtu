import { prisma } from "@/utils/PrismaConfig";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Capitalize } from "@/utils/Capitalize";
import { signIn } from "next-auth/react";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          scopes: ["profile"],
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "",
  session: {
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    async signIn({ user, profile }) {
      try {
        if (!user || !profile) {
          throw new Error("User or profile data is missing.");
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email as string,
              name: Capitalize(user.name) as string,
            },
          });
        }

        const checkBan = await prisma.blacklist.findFirst({
          where: {
            OR: [{ userId: user.id }, { email: user.email as string }],
          },
        });

        if (checkBan) {
          throw new Error("User is blacklisted.");
        }

        return true;
      } catch (error: any) {
        console.error("Error signing in:", error.message);
        return false;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
