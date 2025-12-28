// Types for curated rankings

export type Tab = "rankings" | "rate"
export type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

export interface CuratedRanking {
  id: string
  playerId: string
  playerName: string
  category: string
  nationality: string | null
  clan: string | null
  rating: number
  avatar: string | null
  clanLogo: string | null
}

export interface CuratedSession {
  id: string
  playerId: string
  playerName: string
  category: string
  nationality: string | null
  clan: string | null
  avatar: string | null
  clanLogo: string | null
  isActive: boolean
  isConfirmed: boolean
  finalRating: number | null
  ratings: CuratedRating[]
}

export interface CuratedRating {
  id: string
  raterName: string
  score: number | null
  note: string | null
  confirmed: boolean
}

export interface PlayerNotes {
  player: {
    id: string
    name: string
    category: string
    nationality: string | null
    clan: string | null
    rating: number
  }
  ratings: {
    id: string
    raterName: string
    score: number | null
    note: string | null
    sessionDate: string
  }[]
}

export interface SearchPlayer {
  id: string
  name: string
  category: string
  nationality: string | null
  clan: string | null
  avatar: string | null
}

// The 10 predefined rater slots (Rater 10 is reserved for the streamer)
export const RATER_NAMES = [
  "Rater 1", "Rater 2", "Rater 3", "Rater 4", "Rater 5",
  "Rater 6", "Rater 7", "Rater 8", "Rater 9", "Streamer"
]

