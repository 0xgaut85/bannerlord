"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

type Tab = "rankings" | "rate"
type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

// The 10 predefined raters
const RATER_NAMES = [
  "Rater 1", "Rater 2", "Rater 3", "Rater 4", "Rater 5",
  "Rater 6", "Rater 7", "Rater 8", "Rater 9", "Rater 10"
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
    // MYTHIC - Deep cosmic purple with aurora
    bg: "linear-gradient(145deg, #1a0a2e 0%, #2d1b4e 20%, #4a1f7a 40%, #6b21a8 60%, #4a1f7a 80%, #2d1b4e 100%)",
    border: "border-purple-300/70",
    accent: "from-purple-200 via-pink-100 to-purple-200",
    text: "text-white",
    subtext: "text-purple-200",
    noiseOpacity: 0.45,
    overlayGradient: "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, transparent 40%, rgba(139,92,246,0.1) 100%)",
    boxBg: "bg-purple-500/25",
    tierColor: "text-purple-300",
    glowColor: "shadow-purple-500/50",
  }
  if (rating >= 90) return {
    // LEGENDARY - Rich violet with shimmer
    bg: "linear-gradient(145deg, #1e1045 0%, #312e81 25%, #4338ca 50%, #312e81 75%, #1e1045 100%)",
    border: "border-violet-400/60",
    accent: "from-violet-200 via-white to-violet-200",
    text: "text-white",
    subtext: "text-violet-200",
    noiseOpacity: 0.40,
    overlayGradient: "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)",
    boxBg: "bg-violet-500/25",
    tierColor: "text-violet-300",
    glowColor: "shadow-violet-500/40",
  }
  if (rating >= 85) return {
    // EPIC - Indigo depths
    bg: "linear-gradient(145deg, #0c1445 0%, #1e3a8a 25%, #3730a3 50%, #1e3a8a 75%, #0c1445 100%)",
    border: "border-indigo-400/50",
    accent: "from-indigo-200 via-blue-100 to-indigo-200",
    text: "text-white",
    subtext: "text-indigo-200",
    noiseOpacity: 0.38,
    overlayGradient: "linear-gradient(180deg, rgba(99,102,241,0.1) 0%, transparent 50%, rgba(79,70,229,0.1) 100%)",
    boxBg: "bg-indigo-500/20",
    tierColor: "text-indigo-300",
    glowColor: "shadow-indigo-500/30",
  }
  if (rating >= 80) return {
    // RARE - Royal blue
    bg: "linear-gradient(145deg, #0a1628 0%, #1e40af 25%, #2563eb 50%, #1e40af 75%, #0a1628 100%)",
    border: "border-blue-400/50",
    accent: "from-blue-200 via-sky-100 to-blue-200",
    text: "text-white",
    subtext: "text-blue-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(59,130,246,0.15) 0%, transparent 50%, rgba(37,99,235,0.1) 100%)",
    boxBg: "bg-blue-500/20",
    tierColor: "text-blue-300",
    glowColor: "shadow-blue-500/30",
  }
  if (rating >= 75) return {
    // UNCOMMON - Sky blue
    bg: "linear-gradient(145deg, #0c2d48 0%, #0369a1 25%, #0ea5e9 50%, #0369a1 75%, #0c2d48 100%)",
    border: "border-sky-400/50",
    accent: "from-sky-200 via-cyan-100 to-sky-200",
    text: "text-white",
    subtext: "text-sky-200",
    noiseOpacity: 0.32,
    overlayGradient: "linear-gradient(180deg, rgba(14,165,233,0.15) 0%, transparent 50%, rgba(3,105,161,0.1) 100%)",
    boxBg: "bg-sky-500/20",
    tierColor: "text-sky-300",
    glowColor: "shadow-sky-500/25",
  }
  if (rating >= 70) return {
    // COMMON+ - Cyan teal
    bg: "linear-gradient(145deg, #042f2e 0%, #0d9488 25%, #14b8a6 50%, #0d9488 75%, #042f2e 100%)",
    border: "border-teal-400/50",
    accent: "from-teal-200 via-emerald-100 to-teal-200",
    text: "text-white",
    subtext: "text-teal-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(20,184,166,0.12) 0%, transparent 50%, rgba(13,148,136,0.08) 100%)",
    boxBg: "bg-teal-500/20",
    tierColor: "text-teal-300",
    glowColor: "shadow-teal-500/20",
  }
  // COMMON - Light cyan
  return {
    bg: "linear-gradient(145deg, #083344 0%, #155e75 25%, #22d3ee 50%, #155e75 75%, #083344 100%)",
    border: "border-cyan-400/40",
    accent: "from-cyan-200 via-white to-cyan-200",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(34,211,238,0.1) 0%, transparent 50%)",
    boxBg: "bg-cyan-500/15",
    tierColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/15",
  }
}

function getTierFromRating(rating: number): string {
  if (rating >= 95) return "S"
  if (rating >= 90) return "A+"
  if (rating >= 85) return "A"
  if (rating >= 80) return "B+"
  if (rating >= 75) return "B"
  if (rating >= 70) return "B-"
  if (rating >= 65) return "C+"
  if (rating >= 60) return "C"
  if (rating >= 55) return "C-"
  return "D"
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
                  {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
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

          {/* Active Rating Session - Clean Compact Layout */}
          {activeSession && (
            <div className="flex items-start justify-center gap-8 py-4">
              {/* Left Side - Raters 1-5 */}
              <div className="space-y-1.5 pt-8">
                {RATER_NAMES.slice(0, 5).map(raterName => {
                  const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                  const isMe = raterName === username
                  const isRaterConfirmed = raterData?.confirmed ?? false
                  return (
                    <div key={raterName} className="flex items-center gap-1.5 justify-end">
                      <span className={cn(
                        "text-[11px] font-medium truncate max-w-[70px]",
                        isMe ? "text-violet-400" : "text-white/40"
                      )}>
                        {raterName.replace("Rater ", "R")}
                      </span>
                      <div className={cn(
                        "w-12 h-7 rounded border flex items-center justify-center transition-colors",
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
                            className="w-full h-full bg-transparent text-white text-center text-sm font-bold focus:outline-none placeholder-white/30"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {isMe ? myRating || "—" : (raterData?.score ?? "—")}
                          </span>
                        )}
                      </div>
                      {isMe && (
                        !myConfirmed ? (
                          <button
                            onClick={confirmMyRating}
                            disabled={!myRating || submittingRating}
                            className="w-6 h-6 text-[10px] font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={editMyRating}
                            disabled={submittingRating}
                            className="w-6 h-6 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-white rounded transition-colors flex items-center justify-center"
                          >
                            ✎
                          </button>
                        )
                      )}
                      {!isMe && <div className="w-6" />}
                    </div>
                  )
                })}
                {/* Notes from left raters (for streamer) */}
                {isStreamer && (
                  <div className="mt-2 space-y-1 max-w-[180px]">
                    {RATER_NAMES.slice(0, 5).map(raterName => {
                      const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                      if (!raterData?.note) return null
                      return (
                        <div key={raterName} className="text-[9px] text-white/50 italic bg-black/20 rounded px-1.5 py-0.5 line-clamp-1">
                          <span className="text-white/30">{raterName.replace("Rater ", "R")}:</span> {raterData.note}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Center - Player Card + Controls */}
              <div className="flex flex-col items-center">
                {/* Compact FIFA Card */}
                <div className="relative w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-violet-500/50">
                  <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #1e1b4b 0%, #4c1d95 30%, #7c3aed 60%, #312e81 100%)" }} />
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
                  <div className="absolute inset-3 border border-dashed border-white/15 rounded-xl pointer-events-none" />
                  
                  <div className="relative h-full flex flex-col p-4">
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white drop-shadow-lg">{calculateAverage() ?? "?"}</span>
                        <span className="text-[9px] font-bold text-violet-300 uppercase">{categoryShort[activeSession.category]}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/50">{activeSession.ratings.filter(r => r.score !== null).length}/{RATER_NAMES.length}</div>
                      </div>
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                        <Image src={getDefaultAvatar(activeSession.category)} alt={activeSession.playerName} width={96} height={96} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    {/* Player Info */}
                    <div className="text-center">
                      <h2 className="text-lg font-black text-white tracking-tight drop-shadow-lg truncate">{cleanPlayerName(activeSession.playerName)}</h2>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        {activeSession.nationality && <Flag code={activeSession.nationality} size="sm" />}
                        <span className="text-white/70 text-xs font-medium">{activeSession.clan || "FA"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streamer Buttons */}
                {isStreamer && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={confirmSession} disabled={confirming || calculateAverage() === null} className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-white text-sm font-bold rounded-lg transition-all disabled:cursor-not-allowed">
                      {confirming ? "..." : "✓ Confirm"}
                    </button>
                    <button onClick={endSession} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-lg transition-all">
                      ✕ Cancel
                    </button>
                  </div>
                )}

                {/* Rater Note Input - directly below card */}
                {!isStreamer && (
                  <div className="mt-3 w-full">
                    <textarea
                      placeholder={myConfirmed ? "Confirmed ✓" : `Note (optional)...`}
                      value={myNote}
                      onChange={(e) => setMyNote(e.target.value.slice(0, 280))}
                      onBlur={() => submitNote(myNote)}
                      disabled={myConfirmed}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-white text-xs placeholder-white/30 focus:outline-none resize-none h-14",
                        myConfirmed ? "bg-green-500/10 border border-green-500/50 cursor-not-allowed" : "bg-black/40 border border-violet-500/30 focus:border-violet-500"
                      )}
                    />
                    <div className="text-right text-[9px] text-white/30 mt-0.5">{myNote.length}/280</div>
                  </div>
                )}
              </div>

              {/* Right Side - Raters 6-10 */}
              <div className="space-y-1.5 pt-8">
                {RATER_NAMES.slice(5, 10).map(raterName => {
                  const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                  const isMe = raterName === username
                  const isRaterConfirmed = raterData?.confirmed ?? false
                  return (
                    <div key={raterName} className="flex items-center gap-1.5">
                      {isMe && (
                        !myConfirmed ? (
                          <button
                            onClick={confirmMyRating}
                            disabled={!myRating || submittingRating}
                            className="w-6 h-6 text-[10px] font-bold bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={editMyRating}
                            disabled={submittingRating}
                            className="w-6 h-6 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-white rounded transition-colors flex items-center justify-center"
                          >
                            ✎
                          </button>
                        )
                      )}
                      {!isMe && <div className="w-6" />}
                      <div className={cn(
                        "w-12 h-7 rounded border flex items-center justify-center transition-colors",
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
                            className="w-full h-full bg-transparent text-white text-center text-sm font-bold focus:outline-none placeholder-white/30"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {isMe ? myRating || "—" : (raterData?.score ?? "—")}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[11px] font-medium truncate max-w-[70px]",
                        isMe ? "text-violet-400" : "text-white/40"
                      )}>
                        {raterName.replace("Rater ", "R")}
                      </span>
                    </div>
                  )
                })}
                {/* Notes from right raters (for streamer) */}
                {isStreamer && (
                  <div className="mt-2 space-y-1 max-w-[180px]">
                    {RATER_NAMES.slice(5, 10).map(raterName => {
                      const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                      if (!raterData?.note) return null
                      return (
                        <div key={raterName} className="text-[9px] text-white/50 italic bg-black/20 rounded px-1.5 py-0.5 line-clamp-1">
                          <span className="text-white/30">{raterName.replace("Rater ", "R")}:</span> {raterData.note}
                        </div>
                      )
                    })}
                  </div>
                )}
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
