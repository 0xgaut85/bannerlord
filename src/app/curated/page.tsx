"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

type Tab = "rankings" | "rate"
type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

// The 10 predefined raters
// Rater 10 is reserved for the streamer
const RATER_NAMES = [
  "Rater 1", "Rater 2", "Rater 3", "Rater 4", "Rater 5",
  "Rater 6", "Rater 7", "Rater 8", "Rater 9", "Streamer"
]

interface CuratedRanking {
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

interface CuratedSession {
  id: string
  playerId: string
  playerName: string
  category: string
  nationality: string | null
  clan: string | null
  isActive: boolean
  isConfirmed: boolean
  finalRating: number | null
  ratings: {
    id: string
    raterName: string
    score: number | null
    note: string | null
    confirmed: boolean
  }[]
}

interface PlayerNotes {
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

interface SearchPlayer {
  id: string
  name: string
  category: string
  nationality: string | null
  clan: string | null
  avatar: string | null
}

// Curated card styling - Light Blue to Deep Purple spectrum with heavy grain
function getCuratedCardStyle(rating: number) {
  if (rating >= 95) return {
    // ICON - Black with heavy gold gradient
    bg: "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 15%, #0d0d0d 30%, #1f1a0a 50%, #2a1f0a 65%, #1a1505 80%, #0a0a0a 100%)",
    border: "border-amber-400/80",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-100",
    subtext: "text-amber-300",
    noiseOpacity: 0.50,
    overlayGradient: "linear-gradient(180deg, rgba(251,191,36,0.25) 0%, rgba(217,119,6,0.15) 30%, transparent 60%, rgba(180,83,9,0.1) 100%)",
    boxBg: "bg-amber-500/30",
    tierColor: "text-amber-300",
    glowColor: "shadow-amber-500/60",
  }
  if (rating >= 92.5) return {
    // MYTHIC - Deep dark bright purple
    bg: "linear-gradient(145deg, #0a0510 0%, #1a0a2e 20%, #2d0a4a 40%, #4c0a7a 55%, #2d0a4a 70%, #1a0a2e 85%, #0a0510 100%)",
    border: "border-purple-400/70",
    accent: "from-purple-300 via-fuchsia-200 to-purple-300",
    text: "text-white",
    subtext: "text-purple-200",
    noiseOpacity: 0.48,
    overlayGradient: "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(192,38,211,0.15) 40%, transparent 70%)",
    boxBg: "bg-purple-500/25",
    tierColor: "text-purple-300",
    glowColor: "shadow-purple-500/50",
  }
  if (rating >= 90) return {
    // LEGENDARY - Dark purple
    bg: "linear-gradient(145deg, #0f0520 0%, #1e0a35 25%, #2a0f4a 50%, #1e0a35 75%, #0f0520 100%)",
    border: "border-purple-500/60",
    accent: "from-purple-200 via-violet-100 to-purple-200",
    text: "text-white",
    subtext: "text-purple-300",
    noiseOpacity: 0.42,
    overlayGradient: "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, transparent 50%, rgba(109,40,217,0.1) 100%)",
    boxBg: "bg-purple-600/20",
    tierColor: "text-purple-400",
    glowColor: "shadow-purple-600/40",
  }
  if (rating >= 87.5) return {
    // EPIC - Deep dark bright blue
    bg: "linear-gradient(145deg, #020617 0%, #0a1a3a 20%, #0f2a5a 40%, #1e40af 55%, #0f2a5a 70%, #0a1a3a 85%, #020617 100%)",
    border: "border-blue-400/70",
    accent: "from-blue-300 via-sky-200 to-blue-300",
    text: "text-white",
    subtext: "text-blue-200",
    noiseOpacity: 0.40,
    overlayGradient: "linear-gradient(180deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)",
    boxBg: "bg-blue-500/25",
    tierColor: "text-blue-300",
    glowColor: "shadow-blue-500/50",
  }
  if (rating >= 85) return {
    // RARE - Dark blue
    bg: "linear-gradient(145deg, #030712 0%, #0c1a35 25%, #152850 50%, #0c1a35 75%, #030712 100%)",
    border: "border-blue-500/55",
    accent: "from-blue-200 via-indigo-100 to-blue-200",
    text: "text-white",
    subtext: "text-blue-300",
    noiseOpacity: 0.38,
    overlayGradient: "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, transparent 50%, rgba(30,64,175,0.08) 100%)",
    boxBg: "bg-blue-600/20",
    tierColor: "text-blue-400",
    glowColor: "shadow-blue-600/35",
  }
  if (rating >= 82.5) return {
    // UNCOMMON - Deep light bright blue
    bg: "linear-gradient(145deg, #0a1929 0%, #0d3a5c 20%, #0e7490 40%, #22d3ee 55%, #0e7490 70%, #0d3a5c 85%, #0a1929 100%)",
    border: "border-cyan-400/60",
    accent: "from-cyan-300 via-sky-200 to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(34,211,238,0.2) 0%, rgba(14,165,233,0.15) 40%, transparent 70%)",
    boxBg: "bg-cyan-500/25",
    tierColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/45",
  }
  // COMMON - Light blue (below 82.5)
  return {
    bg: "linear-gradient(145deg, #0c4a6e 0%, #0891b2 25%, #67e8f9 50%, #0891b2 75%, #0c4a6e 100%)",
    border: "border-sky-300/50",
    accent: "from-sky-200 via-white to-sky-200",
    text: "text-white",
    subtext: "text-sky-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(125,211,252,0.15) 0%, transparent 50%)",
    boxBg: "bg-sky-400/20",
    tierColor: "text-sky-300",
    glowColor: "shadow-sky-400/30",
  }
}

function getTierFromRating(rating: number): string {
  if (rating >= 95) return "ICON"
  if (rating >= 92.5) return "S+"
  if (rating >= 90) return "S"
  if (rating >= 87.5) return "A+"
  if (rating >= 85) return "A"
  if (rating >= 82.5) return "B+"
  return "B"
}

function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

// FIFA-style display card for Top 3
function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter,
  onPlayerClick
}: { 
  player: CuratedRanking
  rank: number
  isCenter: boolean
  onPlayerClick?: (id: string) => void
}) {
  const style = getCuratedCardStyle(player.rating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.rating)
  
  const rankLabels: Record<number, string> = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.playerId)}
      className={cn(
        "flex justify-center",
        isCenter ? "md:scale-110 z-10" : ""
      )}
    >
      {/* FIFA Card - AAA+ Premium Design (same layout as current ranking) */}
      <div className={`relative w-48 sm:w-56 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border} hover:scale-105 transition-transform`}>
        {/* Background Base - Rich gradient */}
        <div 
          className="absolute inset-0"
          style={{ background: style.bg }}
        />
        
        {/* Overlay Gradient for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: style.overlayGradient }}
        />
        
        {/* Heavy Noise/Grain Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`noiseFilter-curated-${player.playerId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noiseFilter-curated-${player.playerId})`} />
        </svg>
        
        {/* Secondary grain layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-soft-light" style={{ opacity: style.noiseOpacity * 0.5 }}>
          <filter id={`grainFilter-curated-${player.playerId}`}>
            <feTurbulence type="turbulence" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grainFilter-curated-${player.playerId})`} />
        </svg>

        {/* Inner Border (Dashed) - more inset */}
        <div className="absolute inset-4 border border-dashed border-white/15 rounded-2xl pointer-events-none z-10" />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-15"
          style={{ 
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
          }}
        />

        {/* Content Container */}
        <div className="relative h-full flex flex-col p-4 z-30">
          
          {/* Top Section: Rating & Position Left, Name Right */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center -ml-1">
              <span className={`text-4xl font-black ${style.text} leading-none drop-shadow-lg`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {Math.round(player.rating)}
              </span>
              <span className={`text-[10px] font-bold ${style.subtext} tracking-widest mt-1 uppercase`}>
                {categoryShort[player.category]}
              </span>
              <div className={`h-0.5 w-6 bg-gradient-to-r ${style.accent} mt-1.5 rounded-full`} />
            </div>
            
            <div className="flex-1 text-right mt-1 pl-2">
              <div className={`text-xs font-bold ${style.subtext} mb-0.5 opacity-80 tracking-widest`}>
                {rankLabels[rank]}
              </div>
              <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md truncate`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                {cleanPlayerName(player.playerName)}
              </h2>
            </div>
          </div>

          {/* Middle Section: Avatar */}
          <div className="flex-1 relative flex flex-col items-center justify-start mt-0">
            {/* Background Glow behind avatar */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-t ${style.accent} opacity-15 blur-2xl rounded-full`} />
            
            {/* Avatar with frame */}
            <div className="relative z-10">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 ${style.border} shadow-xl`}>
                <Image
                  src={avatarSrc}
                  alt={player.playerName}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Tier badge */}
            <div className={`mt-2 px-3 py-0.5 rounded-full bg-black/30 backdrop-blur-sm border ${style.border}`}>
              <span className={`text-xs font-bold ${style.tierColor}`}>{playerTier}</span>
            </div>
          </div>
          
          {/* Bottom Section: Bio */}
          <div className="mt-auto text-center pb-1">
            <div className="flex items-center justify-center gap-2">
              <Flag code={player.nationality} size="sm" />
              <span className={`text-xs ${style.subtext}`}>
                {player.clan || "FA"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Elite player card (ranks 4-15) - matches current ranking style
function ElitePlayerCard({ 
  player, 
  onPlayerClick 
}: { 
  player: CuratedRanking
  onPlayerClick?: (id: string) => void 
}) {
  const style = getCuratedCardStyle(player.rating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.rating)
  
  return (
    <button
      onClick={() => onPlayerClick?.(player.playerId)}
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 ${style.border} hover:scale-105 transition-all shadow-lg`}
    >
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{ background: style.bg }}
      />
      
      {/* Overlay Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: style.overlayGradient }}
      />
      
      {/* Heavy Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
        <filter id={`noiseFilter-elite-${player.playerId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noiseFilter-elite-${player.playerId})`} />
      </svg>
      
      {/* Inner dashed border */}
      <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none z-10" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col p-3 z-20">
        {/* Rating */}
        <div className="flex justify-between items-start">
          <div className={`text-2xl font-black ${style.text}`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {Math.round(player.rating)}
          </div>
          <div className={`text-xs font-bold ${style.tierColor}`}>
            {playerTier}
          </div>
        </div>
        
        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${style.border}`}>
            <Image
              src={avatarSrc}
              alt={player.playerName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Info */}
        <div className="text-center mt-auto">
          <div className={`font-bold text-sm truncate ${style.text}`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {cleanPlayerName(player.playerName)}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Flag code={player.nationality} size="sm" />
            <span className={`text-xs ${style.subtext}`}>
              {player.clan || "FA"}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact player card for rest
function CompactPlayerCard({ 
  player,
  rank,
  onPlayerClick 
}: { 
  player: CuratedRanking
  rank: number
  onPlayerClick?: (id: string) => void 
}) {
  const style = getCuratedCardStyle(player.rating)
  const tier = getTierFromRating(player.rating)
  
  return (
    <button
      onClick={() => onPlayerClick?.(player.playerId)}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:brightness-125 transition-all text-left border",
        style.border,
        style.boxBg
      )}
    >
      <span className="text-white/40 w-7 text-xs">#{rank}</span>
      <Flag code={player.nationality} size="sm" />
      <span className="text-white/90 truncate flex-1 font-medium">{cleanPlayerName(player.playerName)}</span>
      <span className={cn("font-bold text-xs", style.tierColor)}>{tier}</span>
      <span className="text-white/70 font-mono text-xs">{player.rating.toFixed(1)}</span>
    </button>
  )
}

export default function CuratedPage() {
  // Access control state
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isStreamer, setIsStreamer] = useState(false)
  const [username, setUsername] = useState("")
  const [usernameSet, setUsernameSet] = useState(false)
  const [codeError, setCodeError] = useState("")

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("rankings")
  const [category, setCategory] = useState<Category>("INFANTRY")

  // Rankings state
  const [rankings, setRankings] = useState<CuratedRanking[]>([])
  const [loadingRankings, setLoadingRankings] = useState(false)

  // Rating session state
  const [activeSession, setActiveSession] = useState<CuratedSession | null>(null)
  const [myRating, setMyRating] = useState<string>("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [myConfirmed, setMyConfirmed] = useState(false) // Whether current rater has confirmed their rating

  // Player search for streamer
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([])
  const [searching, setSearching] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  // Note state
  const [myNote, setMyNote] = useState<string>("")

  // Player notes modal
  const [selectedPlayerNotes, setSelectedPlayerNotes] = useState<PlayerNotes | null>(null)
  const [loadingNotes, setLoadingNotes] = useState(false)

  // Handle code submission (only for rate tab)
  const handleCodeSubmit = () => {
    if (accessCode === "MRASH") {
      setIsStreamer(true)
      setIsAuthenticated(true)
      setUsername("Streamer") // Auto-set username for streamer
      setUsernameSet(true)    // Skip username selection
      setCodeError("")
    } else if (accessCode === "OBELIXNW") {
      setIsStreamer(false)
      setIsAuthenticated(true)
      setCodeError("")
    } else {
      setCodeError("Invalid access code")
    }
  }

  // Fetch rankings (public - no auth needed)
  const fetchRankings = useCallback(async () => {
    setLoadingRankings(true)
    try {
      const res = await fetch(`/api/curated/rankings?category=${category}`)
      if (res.ok) {
        const data = await res.json()
        setRankings(data)
      }
    } catch (error) {
      console.error("Failed to fetch rankings:", error)
    } finally {
      setLoadingRankings(false)
    }
  }, [category])

  // Fetch active session (polling for real-time)
  const fetchActiveSession = useCallback(async () => {
    try {
      const res = await fetch("/api/curated/sessions")
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data)
        if (data && usernameSet) {
          const myRatingData = data.ratings.find((r: { raterName: string }) => r.raterName === username)
          if (myRatingData?.score !== null && myRatingData?.score !== undefined) {
            setMyRating(myRatingData.score.toString())
          }
          if (myRatingData?.note) {
            setMyNote(myRatingData.note)
          }
          // Sync confirmed state
          setMyConfirmed(myRatingData?.confirmed ?? false)
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error)
    }
  }, [username, usernameSet])

  // Fetch player notes
  const fetchPlayerNotes = async (playerId: string) => {
    setLoadingNotes(true)
    try {
      const res = await fetch(`/api/curated/players/${playerId}/notes`)
      if (res.ok) {
        const data = await res.json()
        setSelectedPlayerNotes(data)
      }
    } catch (error) {
      console.error("Failed to fetch player notes:", error)
    } finally {
      setLoadingNotes(false)
    }
  }

  // Search players - only Division A for curated rankings
  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&divisionA=true`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.slice(0, 10))
      }
    } catch (error) {
      console.error("Failed to search players:", error)
    } finally {
      setSearching(false)
    }
  }

  // Create session (streamer only)
  const createSession = async (playerId: string) => {
    setCreatingSession(true)
    try {
      const res = await fetch("/api/curated/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, streamerCode: accessCode })
      })
      if (res.ok) {
        const session = await res.json()
        setActiveSession(session)
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setCreatingSession(false)
    }
  }

  // Submit rating (only if not confirmed, or if editing)
  const submitRating = async (score: string, note?: string, confirmed?: boolean) => {
    if (!usernameSet || !activeSession) return
    // Don't allow changes if confirmed (unless explicitly editing)
    if (myConfirmed && confirmed !== false) return
    
    setSubmittingRating(true)
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: score === "" ? null : parseInt(score),
          note: note !== undefined ? note : myNote,
          raterCode: accessCode,
          confirmed: confirmed ?? false
        })
      })
      setMyRating(score)
      if (confirmed !== undefined) {
        setMyConfirmed(confirmed)
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
    } finally {
      setSubmittingRating(false)
    }
  }

  // Submit note separately
  const submitNote = async (note: string) => {
    if (!usernameSet || !activeSession) return
    // Don't allow changes if confirmed
    if (myConfirmed) return
    
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: myRating === "" ? null : parseInt(myRating),
          note: note,
          raterCode: accessCode,
          confirmed: false
        })
      })
      setMyNote(note)
    } catch (error) {
      console.error("Failed to submit note:", error)
    }
  }

  // Confirm my rating
  const confirmMyRating = async () => {
    if (!usernameSet || !activeSession || !myRating) return
    await submitRating(myRating, myNote, true)
  }

  // Edit my rating (unlock it)
  const editMyRating = async () => {
    if (!usernameSet || !activeSession) return
    setSubmittingRating(true)
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: myRating === "" ? null : parseInt(myRating),
          note: myNote,
          raterCode: accessCode,
          confirmed: false
        })
      })
      setMyConfirmed(false)
    } catch (error) {
      console.error("Failed to edit rating:", error)
    } finally {
      setSubmittingRating(false)
    }
  }

  // Confirm session (streamer only)
  const confirmSession = async () => {
    if (!isStreamer) return
    setConfirming(true)
    try {
      const res = await fetch("/api/curated/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerCode: accessCode })
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Rating confirmed! ${data.playerName}: ${data.rating}`)
        setActiveSession(null)
        fetchRankings()
      }
    } catch (error) {
      console.error("Failed to confirm session:", error)
    } finally {
      setConfirming(false)
    }
  }

  // End session without confirming
  const endSession = async () => {
    if (!isStreamer) return
    try {
      await fetch("/api/curated/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerCode: accessCode })
      })
      setActiveSession(null)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Effects
  useEffect(() => {
    if (activeTab === "rankings") {
      fetchRankings()
    }
  }, [activeTab, fetchRankings])

  useEffect(() => {
    if (activeTab === "rate" && isAuthenticated) {
      fetchActiveSession()
      const interval = setInterval(fetchActiveSession, 2000)
      return () => clearInterval(interval)
    }
  }, [activeTab, isAuthenticated, fetchActiveSession])

  // Calculate average from current ratings
  const calculateAverage = () => {
    if (!activeSession) return null
    const validRatings = activeSession.ratings.filter(r => r.score !== null)
    if (validRatings.length === 0) return null
    const avg = validRatings.reduce((sum, r) => sum + (r.score || 0), 0) / validRatings.length
    return Math.round(avg * 10) / 10
  }

  // Separate rankings by tier
  const top3 = rankings.slice(0, 3)
  const elite = rankings.slice(3, 15)
  const rest = rankings.slice(15)

  // Code entry screen - only for rate tab
  if (activeTab === "rate" && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* Header with tabs */}
        <div className="text-center py-12 sm:py-16">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4">
            Expert Selection
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-8">
            Curated Rankings
          </h1>
          
          {/* Tabs */}
          <div className="flex justify-center gap-2 px-4">
            <button
              onClick={() => setActiveTab("rankings")}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-white/10 text-white/70 hover:bg-white/20"
            >
              Rankings
            </button>
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-violet-500 text-white shadow-xl"
            >
              Rate
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center p-4">
          <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-md w-full">
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
              Rater Access Required
            </p>
            <p className="text-white/50 text-center mb-8">
              Enter your access code to rate players
            </p>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter access code..."
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 text-center text-lg tracking-widest"
              />
              {codeError && (
                <p className="text-red-400 text-center text-sm">{codeError}</p>
              )}
              <button
                onClick={handleCodeSubmit}
                className="w-full py-3 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-xl transition-all shadow-xl"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Username entry for raters
  if (activeTab === "rate" && isAuthenticated && !usernameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-md w-full">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
            {isStreamer ? "Streamer Mode" : "Rater Mode"}
          </p>
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            {isStreamer ? "🎬 Welcome Streamer" : "⭐ Welcome Rater"}
          </h1>
          <p className="text-white/50 text-center mb-8">
            {isStreamer ? "Enter your display name" : "Select your rater name"}
          </p>

          <div className="space-y-4">
            {!isStreamer && (
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">Select your name...</option>
                {RATER_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
            {isStreamer && (
              <input
                type="text"
                placeholder="Your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
              />
            )}
            <button
              onClick={() => username && setUsernameSet(true)}
              disabled={!username}
              className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed shadow-xl"
            >
              Continue
            </button>
            <button
              onClick={() => setActiveTab("rankings")}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              View Rankings Instead
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Player Notes Modal */}
      {selectedPlayerNotes && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-violet-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    {selectedPlayerNotes.player.nationality && (
                      <Flag code={selectedPlayerNotes.player.nationality} size="md" />
                    )}
                    <div>
                      <h2 className="text-2xl font-display text-white">
                        {cleanPlayerName(selectedPlayerNotes.player.name)}
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        {selectedPlayerNotes.player.category} · {selectedPlayerNotes.player.clan || "FA"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-3xl font-bold text-violet-400">
                    {Math.round(selectedPlayerNotes.player.rating)}
                  </div>
                  <div className="text-white/50 text-xs">
                    Curated Rating
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayerNotes(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingNotes ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ) : selectedPlayerNotes.ratings.length === 0 ? (
                <div className="text-center text-white/40 py-8">
                  No ratings yet
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPlayerNotes.ratings.map((rating) => (
                    <div 
                      key={rating.id}
                      className="bg-black/20 rounded-xl p-4 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {rating.raterName}
                        </span>
                        <span className="text-violet-400 font-bold text-xl">{rating.score}</span>
                      </div>
                      {rating.note && (
                        <p className="text-white/70 text-sm leading-relaxed border-t border-white/10 pt-3 mt-2">
                          &ldquo;{rating.note}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center py-12 sm:py-16">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4">
          Expert Selection
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
          Curated Rankings
        </h1>
        {isStreamer && activeTab === "rate" && (
          <span className="inline-block px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-full text-violet-300 text-sm font-semibold">
            🎬 Streamer Mode Active
          </span>
        )}

        {/* Tabs */}
        <div className="flex justify-center gap-2 mt-8 px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("rankings")}
              className={cn(
                "px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap",
                activeTab === "rankings"
                  ? "bg-violet-500 text-white shadow-xl"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              Rankings
            </button>
            <button
              onClick={() => setActiveTab("rate")}
              className={cn(
                "px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap",
                activeTab === "rate"
                  ? "bg-violet-500 text-white shadow-xl"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              Rate
            </button>
          </div>
        </div>

        {/* Category Filter (Rankings only) */}
        {activeTab === "rankings" && (
          <div className="flex justify-center gap-2 mt-4 px-4">
            <div className="flex gap-2">
              {(["INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    category === cat
                      ? "bg-violet-500/30 text-violet-300 border border-violet-500/50"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  )}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rankings Tab - PUBLIC */}
      {activeTab === "rankings" && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {loadingRankings ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              No curated rankings yet. Check back soon!
            </div>
          ) : (
            <>
              {/* THE CHOSEN THREE */}
              {top3.length > 0 && (
                <section className="mb-20">
                  <h2 className="text-center text-2xl font-display font-bold text-violet-400 mb-2 tracking-wider">
                    THE CHOSEN THREE
                  </h2>
                  <p className="text-center text-white/50 mb-12 text-sm">
                    The undisputed elite
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Reorder: 2nd, 1st, 3rd */}
                    {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, idx) => {
                      const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                      return (
                        <FifaDisplayCard 
                          key={player.id} 
                          player={player} 
                          rank={actualRank}
                          isCenter={idx === 1}
                          onPlayerClick={fetchPlayerNotes}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

              {/* ELITE WARRIORS */}
              {elite.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-xl font-display font-bold text-white mb-2">
                    Elite Warriors
                  </h2>
                  <p className="text-white/50 mb-6 text-sm">
                    Rank #4 - #15
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {elite.map((player) => (
                      <ElitePlayerCard key={player.id} player={player} onPlayerClick={fetchPlayerNotes} />
                    ))}
                  </div>
                </section>
              )}

              {/* ALL PLAYERS */}
              {rest.length > 0 && (
                <section>
                  <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                    All Players
                  </h2>
                  
                  <div className="bg-black/20 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rest.map((player, index) => (
                        <CompactPlayerCard 
                          key={player.id} 
                          player={player} 
                          rank={index + 16}
                          onPlayerClick={fetchPlayerNotes}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Rate Tab */}
      {activeTab === "rate" && isAuthenticated && usernameSet && (
        <div className="w-full px-4 pb-4">
          {/* Streamer Controls */}
          {isStreamer && !activeSession && (
            <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Select Division A Player to Rate</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a Division A player..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchPlayers(e.target.value)
                  }}
                  className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                    Searching...
                  </div>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map(player => (
                    <button
                      key={player.id}
                      onClick={() => createSession(player.id)}
                      disabled={creatingSession}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left"
                    >
                      <Image
                        src={player.avatar || getDefaultAvatar(player.category)}
                        alt={player.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{player.name}</div>
                        <div className="text-white/40 text-sm">
                          {player.category} • {player.clan || "FA"}
                        </div>
                      </div>
                      {player.nationality && <Flag code={player.nationality} size="sm" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Rating Session - Bigger Layout with Notes */}
          {activeSession && (
            <div className="flex items-start justify-center gap-12 py-6">
              {/* Left Side - Raters 1-5 with notes */}
              <div className="space-y-3 pt-4">
                {RATER_NAMES.slice(0, 5).map(raterName => {
                  const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                  const isMe = raterName === username
                  const isRaterConfirmed = raterData?.confirmed ?? false
                  return (
                    <div key={raterName} className="flex flex-col items-end gap-1">
                      {/* Rater row */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold w-24 text-right",
                          isMe ? "text-violet-400" : "text-white/60"
                        )}>
                          {raterName} {isMe && "★"}
                        </span>
                        <div className={cn(
                          "w-16 h-10 rounded-lg border-2 flex items-center justify-center transition-colors",
                          isRaterConfirmed 
                            ? "border-green-500 bg-green-500/20" 
                            : raterData?.score 
                              ? "border-red-500 bg-red-500/20" 
                              : "border-white/20 bg-black/40"
                        )}>
                          {isMe && !myConfirmed ? (
                            <input
                              type="number"
                              min={50}
                              max={99}
                              placeholder="--"
                              value={myRating}
                              onChange={(e) => {
                                const val = e.target.value
                                setMyRating(val)
                                submitRating(val)
                              }}
                              disabled={submittingRating}
                              className="w-full h-full bg-transparent text-white text-center text-xl font-bold focus:outline-none placeholder-white/30"
                            />
                          ) : (
                            <span className="text-xl font-bold text-white">
                              {isMe ? myRating || "—" : (raterData?.score ?? "—")}
                            </span>
                          )}
                        </div>
                        {isMe ? (
                          !myConfirmed ? (
                            <button
                              onClick={confirmMyRating}
                              disabled={!myRating || submittingRating}
                              className="w-8 h-8 text-sm font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={editMyRating}
                              disabled={submittingRating}
                              className="w-8 h-8 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                              ✎
                            </button>
                          )
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                      {/* Note box below each rater */}
                      <div className="w-full max-w-[220px]">
                        {isMe ? (
                          <textarea
                            placeholder="Your note..."
                            value={myNote}
                            onChange={(e) => setMyNote(e.target.value.slice(0, 280))}
                            onBlur={() => submitNote(myNote)}
                            disabled={myConfirmed}
                            className={cn(
                              "w-full px-2 py-1.5 rounded text-white text-xs placeholder-white/30 focus:outline-none resize-none h-12",
                              myConfirmed ? "bg-green-500/10 border border-green-500/40" : "bg-black/30 border border-violet-500/20 focus:border-violet-500"
                            )}
                          />
                        ) : (
                          <div className={cn(
                            "w-full px-2 py-1.5 rounded text-xs h-12 overflow-hidden",
                            raterData?.note ? "bg-black/20 text-white/50 italic" : "bg-black/10 text-white/20"
                          )}>
                            {raterData?.note ? `"${raterData.note}"` : "No note"}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Center - Big Player Card + Controls */}
              <div className="flex flex-col items-center">
                {/* Big FIFA Card */}
                <div className="relative w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-violet-500/50">
                  <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #1e1b4b 0%, #4c1d95 30%, #7c3aed 60%, #312e81 100%)" }} />
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
                  <div className="absolute inset-4 border border-dashed border-white/15 rounded-2xl pointer-events-none" />
                  
                  <div className="relative h-full flex flex-col p-6">
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl font-black text-white drop-shadow-lg">{calculateAverage() ?? "?"}</span>
                        <span className="text-sm font-bold text-violet-300 uppercase mt-1">{categoryShort[activeSession.category]}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60 font-medium">{activeSession.ratings.filter(r => r.score !== null).length}/{RATER_NAMES.length} votes</div>
                      </div>
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl">
                        <Image src={getDefaultAvatar(activeSession.category)} alt={activeSession.playerName} width={144} height={144} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    {/* Player Info */}
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">{cleanPlayerName(activeSession.playerName)}</h2>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {activeSession.nationality && <Flag code={activeSession.nationality} size="md" />}
                        <span className="text-white/70 text-base font-medium">{activeSession.clan || "FA"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streamer Buttons */}
                {isStreamer && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={confirmSession} disabled={confirming || calculateAverage() === null} className="px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-white text-base font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-lg">
                      {confirming ? "..." : "✓ Confirm Final Rating"}
                    </button>
                    <button onClick={endSession} className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white text-base font-bold rounded-xl transition-all shadow-lg">
                      ✕ Cancel Session
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side - Raters 6-10 with notes */}
              <div className="space-y-3 pt-4">
                {RATER_NAMES.slice(5, 10).map(raterName => {
                  const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                  const isMe = raterName === username
                  const isRaterConfirmed = raterData?.confirmed ?? false
                  return (
                    <div key={raterName} className="flex flex-col items-start gap-1">
                      {/* Rater row */}
                      <div className="flex items-center gap-2">
                        {isMe ? (
                          !myConfirmed ? (
                            <button
                              onClick={confirmMyRating}
                              disabled={!myRating || submittingRating}
                              className="w-8 h-8 text-sm font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={editMyRating}
                              disabled={submittingRating}
                              className="w-8 h-8 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                              ✎
                            </button>
                          )
                        ) : (
                          <div className="w-8" />
                        )}
                        <div className={cn(
                          "w-16 h-10 rounded-lg border-2 flex items-center justify-center transition-colors",
                          isRaterConfirmed 
                            ? "border-green-500 bg-green-500/20" 
                            : raterData?.score 
                              ? "border-red-500 bg-red-500/20" 
                              : "border-white/20 bg-black/40"
                        )}>
                          {isMe && !myConfirmed ? (
                            <input
                              type="number"
                              min={50}
                              max={99}
                              placeholder="--"
                              value={myRating}
                              onChange={(e) => {
                                const val = e.target.value
                                setMyRating(val)
                                submitRating(val)
                              }}
                              disabled={submittingRating}
                              className="w-full h-full bg-transparent text-white text-center text-xl font-bold focus:outline-none placeholder-white/30"
                            />
                          ) : (
                            <span className="text-xl font-bold text-white">
                              {isMe ? myRating || "—" : (raterData?.score ?? "—")}
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-semibold w-24",
                          isMe ? "text-violet-400" : "text-white/60"
                        )}>
                          {isMe && "★ "}{raterName}
                        </span>
                      </div>
                      {/* Note box below each rater */}
                      <div className="w-full max-w-[220px] ml-10">
                        {isMe ? (
                          <textarea
                            placeholder="Your note..."
                            value={myNote}
                            onChange={(e) => setMyNote(e.target.value.slice(0, 280))}
                            onBlur={() => submitNote(myNote)}
                            disabled={myConfirmed}
                            className={cn(
                              "w-full px-2 py-1.5 rounded text-white text-xs placeholder-white/30 focus:outline-none resize-none h-12",
                              myConfirmed ? "bg-green-500/10 border border-green-500/40" : "bg-black/30 border border-violet-500/20 focus:border-violet-500"
                            )}
                          />
                        ) : (
                          <div className={cn(
                            "w-full px-2 py-1.5 rounded text-xs h-12 overflow-hidden",
                            raterData?.note ? "bg-black/20 text-white/50 italic" : "bg-black/10 text-white/20"
                          )}>
                            {raterData?.note ? `"${raterData.note}"` : "No note"}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Active Session - Rater View */}
          {!activeSession && !isStreamer && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Session</h2>
              <p className="text-white/50">
                The streamer hasn&apos;t started a rating session yet. Please wait...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
