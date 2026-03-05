import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';

async function ensureDefaultRole(userId: string): Promise<void> {
  const existingMembership = await prisma.member.findFirst({
    where: { userId },
  });

  if (existingMembership) return;

  const defaultRole = await prisma.role.findFirst({
    where: { isDefault: true, scope: 'GLOBAL' },
  });

  if (!defaultRole) return;

  const member = await prisma.member.create({
    data: {
      userId,
      employerId: null,
    },
  });

  await prisma.memberRole.create({
    data: {
      memberId: member.id,
      roleId: defaultRole.id,
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureDefaultRole(user.id);
      }
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
  },
};
