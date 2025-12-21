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
  },
  events: {
    async signIn({ user, account }) {
      // Update discordId after PrismaAdapter creates the user
      if (account?.provider === "discord" && account.providerAccountId) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              discordId: account.providerAccountId,
            }
          })
        } catch (error) {
          console.error("Error updating discordId:", error)
        }
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
}


