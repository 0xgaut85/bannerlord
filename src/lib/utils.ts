import { Division } from "@prisma/client"

// Division weight coefficients
export const DIVISION_WEIGHTS: Record<Division, number> = {
  A: 1.0,
  B: 0.9,
  C: 0.8,
  D: 0.7,
  E: 0.6,
  F: 0.5,
  G: 0.5,
  H: 0.5,
  I: 0.5,
  J: 0.5,
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
  INFANTRY: 20,
  CAVALRY: 10,
  ARCHER: 10,
} as const

// Minimum ratings for a player to appear in global ranking
export const MIN_PLAYER_RATINGS = 5

// Maximum deviation from current average for established players (±15)
export const MAX_RATING_DEVIATION = 15

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
  UK: "United Kingdom",
  GB: "United Kingdom",
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
  IE: "Ireland",
  CA: "Canada",
  AU: "Australia",
  BR: "Brazil",
  AR: "Argentina",
  MX: "Mexico",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
