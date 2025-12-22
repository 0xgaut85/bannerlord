import { Division } from "@prisma/client"

// Check if user is rating themselves (exact in-game name match only, case-insensitive)
// Only checks against discordName (the in-game name user sets), not Discord OAuth display name
export function isSelfRating(discordName: string | null, playerName: string): boolean {
  if (!discordName) return false
  
  const playerNameClean = playerName.toLowerCase().trim()
  const discordNameClean = discordName.toLowerCase().trim()
  
  return discordNameClean === playerNameClean
}

// Division weight coefficients
export const DIVISION_WEIGHTS: Record<Division, number> = {
  A: 1.0,
  B: 0.8,
  C: 0.5,
  D: 0.3,
  E: 0.15,
  F: 0.075,
  G: 0.075,
  H: 0.075,
  I: 0.075,
  J: 0.075,
}

// Default ratings for new players based on division
export const DIVISION_DEFAULT_RATINGS: Record<Division, number> = {
  A: 85,
  B: 80,
  C: 75,
  D: 70,
  E: 65,
  F: 60,
  G: 55,
  H: 50,
  I: 50,
  J: 50,
}

// Minimum ratings required for user eligibility (to count their votes)
export const MIN_RATINGS = {
  INFANTRY: 10,
  CAVALRY: 5,
  ARCHER: 5,
} as const

// Minimum ratings for a player to appear in global ranking
export const MIN_PLAYER_RATINGS = 5

// Maximum deviation from current average for established players (±20)
export const MAX_RATING_DEVIATION = 20

// Check if user can edit (24h cooldown)
export function canUserEdit(lastEditAt: Date | null): boolean {
  if (!lastEditAt) return true
  const now = new Date()
  const diff = now.getTime() - lastEditAt.getTime()
  const hours24 = 24 * 60 * 60 * 1000
  return diff >= hours24
}

// Get time remaining until user can edit again
export function getTimeUntilEdit(lastEditAt: Date | null): number {
  if (!lastEditAt) return 0
  const now = new Date()
  const diff = now.getTime() - lastEditAt.getTime()
  const hours24 = 24 * 60 * 60 * 1000
  return Math.max(0, hours24 - diff)
}

// Format remaining time as HH:MM:SS
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Calculate weighted average rating for a player
export function calculateWeightedAverage(
  ratings: { score: number; raterDivision: Division | null }[]
): number {
  if (ratings.length === 0) return 0
  
  let weightedSum = 0
  let totalWeight = 0
  
  for (const rating of ratings) {
    const weight = rating.raterDivision ? DIVISION_WEIGHTS[rating.raterDivision] : 0.5
    weightedSum += rating.score * weight
    totalWeight += weight
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

// Country code to flag emoji
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Country code to full name
export const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  DE: "Germany",
  PL: "Poland",
  "gb-eng": "England",
  "gb-sct": "Scotland",
  "gb-wls": "Wales",
  IE: "Ireland",
  US: "United States",
  ES: "Spain",
  IT: "Italy",
  RU: "Russia",
  TR: "Turkey",
  NL: "Netherlands",
  BE: "Belgium",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PT: "Portugal",
  CZ: "Czech Republic",
  AT: "Austria",
  CH: "Switzerland",
  GR: "Greece",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  UA: "Ukraine",
  SK: "Slovakia",
  HR: "Croatia",
  RS: "Serbia",
  SI: "Slovenia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  CA: "Canada",
  AU: "Australia",
  BR: "Brazil",
  AR: "Argentina",
  MX: "Mexico",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  // Custom flag files
  kazakhstan: "Kazakhstan",
  liban: "Lebanon",
  belarus: "Belarus",
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Calculate division from rating (for filtering purposes)
export function getDivisionFromRating(rating: number): Division {
  if (rating >= 85) return "A" as Division
  if (rating >= 80) return "B" as Division
  if (rating >= 75) return "C" as Division
  if (rating >= 70) return "D" as Division
  if (rating >= 65) return "E" as Division
  if (rating >= 60) return "F" as Division
  if (rating >= 55) return "G" as Division
  return "H" as Division // 50 and below
}

// Calculate tier from rating (for FIFA card display)
export function getTierFromRating(rating: number): string {
  if (rating >= 95) return "S"
  if (rating >= 90) return "A+"
  if (rating >= 85) return "A"
  if (rating >= 80) return "B+"
  if (rating >= 75) return "B"
  if (rating >= 70) return "B-"
  if (rating >= 65) return "C+"
  if (rating >= 60) return "C"
  if (rating >= 55) return "C-"
  return "D" // 50 and below
}

// Clean player name - replace "(Legend)" with "(L)" for display
export function cleanPlayerName(name: string): string {
  return name.replace(/ \(Legend\)/g, ' (L)')
}
