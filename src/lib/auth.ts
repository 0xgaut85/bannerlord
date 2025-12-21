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
      if (account?.provider === "discord" && profile) {
        // Only link the account, don't auto-fill profile data
        // User will fill this in via the onboarding flow
        await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId: account.providerAccountId,
            // We use the ID as a fallback name initially, user must set their real in-game name
            discordName: null, 
          }
        }).catch(() => {
          // User might not exist yet, that's fine
        })
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


