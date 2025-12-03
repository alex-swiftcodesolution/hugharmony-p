import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.AUTH_SECRET,

  events: {
    async createUser({ user }) {
      try {
        const [firstName, ...rest] = (user.name || "").split(" ");
        const lastName = rest.join(" ") || null;

        await prisma.personalInfo.create({
          data: {
            userId: user.id!,
            firstName: firstName || null,
            lastName: lastName,
          },
        });

        console.log("PersonalInfo created for:", user.email);
      } catch (err) {
        console.error("Error creating PersonalInfo:", err);
      }
    },
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
