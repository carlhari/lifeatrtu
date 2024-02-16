import { prisma } from "@/utils/PrismaConfig";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Capitalize } from "@/utils/Capitalize";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          scopes: ["profile"],
          prompt:"consent",
          response_type: "code"
        },
      },
    
    }),
  ],
  pages:{
    signIn: "/"
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
      const existingUser = await prisma.user.findUnique({
        where: {
          email: profile?.email,
        },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: user.id as string,
            email: user.email as string,
            name: Capitalize(user.name) as string,
          },
        });
      }

      return Promise.resolve(true);
    },
   
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
