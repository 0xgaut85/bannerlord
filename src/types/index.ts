import { Division, PlayerCategory } from "@prisma/client"

export type { Division, PlayerCategory }

// Extended user type for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      discordName?: string | null
      team?: string | null
      division?: Division | null
      lastEditAt?: Date | null
      isProfileComplete?: boolean
    }
  }
}

// Player with rating info
export interface PlayerWithRating {
  id: string
  name: string
  category: PlayerCategory
  nationality: string | null
  clan: string | null
  bio: string | null
  avatar: string | null
  division: string | null
  averageRating: number
  totalRatings: number
  rank?: number
}

// User's rating for a player
export interface UserRating {
  playerId: string
  playerName: string
  playerCategory: PlayerCategory
  playerNationality: string
  score: number
}

// Eligibility status
export interface EligibilityStatus {
  isEligible: boolean
  infantry: { current: number; required: number }
  cavalry: { current: number; required: number }
  archer: { current: number; required: number }
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}


