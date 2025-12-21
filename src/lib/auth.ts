import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import type { Adapter } from "next-auth/adapters"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        // Fetch additional user data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            discordName: true,
            team: true,
            division: true,
            lastEditAt: true,
            isProfileComplete: true,
          }
        })
        
        if (dbUser) {
          session.user.discordName = dbUser.discordName
          session.user.team = dbUser.team
          session.user.division = dbUser.division
          session.user.lastEditAt = dbUser.lastEditAt
          session.user.isProfileComplete = dbUser.isProfileComplete
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        try {
          // Use upsert to handle both new and existing users
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              discordId: account.providerAccountId,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              discordId: account.providerAccountId,
              discordName: null, // User will set this in onboarding
            }
          })
        } catch (error) {
          console.error("Error updating user during sign-in:", error)
          // Don't block sign-in if there's an error
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "database",
  },
}


