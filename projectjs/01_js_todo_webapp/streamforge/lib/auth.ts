import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },

    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },

    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) throw new Error('No account found with this email');
                if (!user.password)
                    throw new Error('Please sign in with GitHub');

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!passwordMatch) throw new Error('Incorrect password');

                return user;
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.channelHandle = (user as any).channelHandle;
                token.image = user.image;
                token.bannerImage = (user as any).bannerImage;
            }

            if (trigger === 'update' && session) {
                token.name = session.name;
                token.image = session.image;
                token.channelHandle = session.channelHandle;
                token.bannerImage = session.bannerImage;
            }

            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.channelHandle = token.channelHandle as
                    | string
                    | null;
                session.user.image = token.image as string | null;
                session.user.bannerImage = token.bannerImage as string | null;
            }
            return session;
        },
    },
};
