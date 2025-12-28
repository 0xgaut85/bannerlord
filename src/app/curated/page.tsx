"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

type Tab = "rankings" | "rate"
type Category = "ALL" | "INFANTRY" | "CAVALRY" | "ARCHER"

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

// Card styling based on rating - same as community but with purple accent
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    bg: "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)",
    border: "border-cyan-300/60",
    accent: "from-cyan-300 via-white to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, transparent 40%, rgba(6,182,212,0.05) 100%)",
    boxBg: "bg-cyan-500/20",
    tierColor: "text-cyan-400",
  }
  if (rating >= 90) return {
    bg: "linear-gradient(145deg, #8b7800 0%, #c9b000 25%, #e6d000 50%, #c9b000 75%, #8b7800 100%)",
    border: "border-yellow-300/60",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-yellow-950",
    subtext: "text-yellow-900",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,215,0,0.15) 100%)",
    boxBg: "bg-yellow-500/25",
    tierColor: "text-yellow-400",
  }
  if (rating >= 85) return {
    bg: "linear-gradient(145deg, #5c4a00 0%, #8b7500 25%, #a89000 50%, #8b7500 75%, #5c4a00 100%)",
    border: "border-yellow-500/50",
    accent: "from-yellow-300 via-yellow-100 to-yellow-300",
    text: "text-white",
    subtext: "text-yellow-100",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(200,170,0,0.1) 100%)",
    boxBg: "bg-yellow-600/20",
    tierColor: "text-yellow-500",
  }
  if (rating >= 80) return {
    bg: "linear-gradient(145deg, #c0c0c0 0%, #e0e0e0 25%, #f8f8f8 50%, #e0e0e0 75%, #c0c0c0 100%)",
    border: "border-white/80",
    accent: "from-white via-slate-50 to-white",
    text: "text-slate-800",
    subtext: "text-slate-600",
    noiseOpacity: 0.15,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)",
    boxBg: "bg-white/30",
    tierColor: "text-slate-200",
  }
  if (rating >= 75) return {
    bg: "linear-gradient(145deg, #6a6a6a 0%, #8a8a8a 25%, #a8a8a8 50%, #8a8a8a 75%, #6a6a6a 100%)",
    border: "border-slate-400/50",
    accent: "from-slate-300 via-slate-200 to-slate-300",
    text: "text-white",
    subtext: "text-slate-300",
    noiseOpacity: 0.22,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
    boxBg: "bg-slate-400/20",
    tierColor: "text-slate-300",
  }
  if (rating >= 70) return {
    bg: "linear-gradient(145deg, #4a2000 0%, #7a3800 25%, #a55000 50%, #7a3800 75%, #4a2000 100%)",
    border: "border-orange-400/60",
    accent: "from-orange-200 via-orange-100 to-orange-200",
    text: "text-orange-50",
    subtext: "text-orange-100",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,180,100,0.15) 0%, transparent 50%, rgba(234,88,12,0.1) 100%)",
    boxBg: "bg-orange-400/25",
    tierColor: "text-orange-300",
  }
  if (rating >= 65) return {
    bg: "linear-gradient(145deg, #0a0300 0%, #1a0800 25%, #2a1200 50%, #1a0800 75%, #0a0300 100%)",
    border: "border-orange-700/40",
    accent: "from-orange-500 via-orange-400 to-orange-500",
    text: "text-orange-100",
    subtext: "text-orange-400",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(194,65,12,0.05) 0%, transparent 50%)",
    boxBg: "bg-orange-700/20",
    tierColor: "text-orange-500",
  }
  return {
    bg: "linear-gradient(145deg, #0f0a06 0%, #1f150d 25%, #2a1f15 50%, #1f150d 75%, #0f0a06 100%)",
    border: "border-[#6b5344]/50",
    accent: "from-[#a08060] via-[#c0a080] to-[#a08060]",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
    noiseOpacity: 0.45,
    overlayGradient: "linear-gradient(180deg, rgba(160,128,96,0.05) 0%, transparent 50%)",
    boxBg: "bg-[#6b5344]/20",
    tierColor: "text-[#a08060]",
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
  const [category, setCategory] = useState<Category>("ALL")

  // Rankings state
  const [rankings, setRankings] = useState<CuratedRanking[]>([])
  const [loadingRankings, setLoadingRankings] = useState(false)

  // Rating session state
  const [activeSession, setActiveSession] = useState<CuratedSession | null>(null)
  const [myRating, setMyRating] = useState<string>("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [confirming, setConfirming] = useState(false)

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

  // Handle code submission
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

  // Fetch rankings
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

  // Search players (for streamer)
  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
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

  // Submit rating
  const submitRating = async (score: string, note?: string) => {
    if (!usernameSet || !activeSession) return
    setSubmittingRating(true)
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: score === "" ? null : parseInt(score),
          note: note !== undefined ? note : myNote,
          raterCode: accessCode
        })
      })
      setMyRating(score)
    } catch (error) {
      console.error("Failed to submit rating:", error)
    } finally {
      setSubmittingRating(false)
    }
  }

  // Submit note separately
  const submitNote = async (note: string) => {
    if (!usernameSet || !activeSession) return
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: myRating === "" ? null : parseInt(myRating),
          note: note,
          raterCode: accessCode
        })
      })
      setMyNote(note)
    } catch (error) {
      console.error("Failed to submit note:", error)
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

  // Code entry screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 max-w-md w-full">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-4 text-center">
            Exclusive Access
          </p>
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Curated Rankings
          </h1>
          <p className="text-white/50 text-center mb-8">
            Enter your access code to continue
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
    )
  }

  // Username entry for raters
  if (!usernameSet && activeTab === "rate") {
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

  // Separate rankings by tier
  const top3 = rankings.slice(0, 3)
  const elite = rankings.slice(3, 15)
  const rest = rankings.slice(15)

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
        {isStreamer && (
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
              {(["ALL", "INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map(cat => (
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

      {/* Rankings Tab */}
      {activeTab === "rankings" && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {loadingRankings ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              No curated rankings yet. Start rating players!
            </div>
          ) : (
            <>
              {/* Top 3 - Large Cards */}
              {top3.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-semibold text-violet-400 mb-6 tracking-wide uppercase">
                    🏆 Top Players
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {top3.map((player, index) => {
                      const style = getCardStyle(player.rating)
                      const tier = getTierFromRating(player.rating)
                      return (
                        <div
                          key={player.id}
                          onClick={() => fetchPlayerNotes(player.playerId)}
                          className={cn(
                            "relative rounded-2xl border-2 p-6 transition-all hover:scale-[1.02] cursor-pointer",
                            style.border
                          )}
                          style={{ background: style.bg }}
                        >
                          {/* Rank Badge */}
                          <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-xl">
                            {index + 1}
                          </div>

                          <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20 mb-4">
                              <Image
                                src={player.avatar || getDefaultAvatar(player.category)}
                                alt={player.playerName}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Name */}
                            <div className={cn("font-bold text-xl mb-1", style.text)}>
                              {cleanPlayerName(player.playerName)}
                            </div>

                            {/* Info */}
                            <div className="flex items-center gap-2 mb-3">
                              {player.nationality && (
                                <Flag code={player.nationality} size="sm" />
                              )}
                              <span className={cn("text-sm", style.subtext)}>
                                {categoryShort[player.category]} • {player.clan || "FA"}
                              </span>
                            </div>

                            {/* Rating & Tier */}
                            <div className={cn("text-4xl font-bold", style.text)}>
                              {Math.round(player.rating)}
                            </div>
                            <div className={cn("text-sm font-semibold", style.tierColor)}>
                              {tier}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Elite - Medium Cards */}
              {elite.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-semibold text-violet-400 mb-6 tracking-wide uppercase">
                    ⭐ Elite Warriors
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elite.map((player, index) => {
                      const style = getCardStyle(player.rating)
                      const tier = getTierFromRating(player.rating)
                      return (
                        <div
                          key={player.id}
                          onClick={() => fetchPlayerNotes(player.playerId)}
                          className={cn(
                            "relative rounded-xl border-2 p-4 transition-all hover:scale-[1.02] cursor-pointer",
                            style.border
                          )}
                          style={{ background: style.bg }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className="text-xl font-bold text-white/60 w-8">
                              #{index + 4}
                            </div>

                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/20">
                              <Image
                                src={player.avatar || getDefaultAvatar(player.category)}
                                alt={player.playerName}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className={cn("font-bold truncate", style.text)}>
                                {cleanPlayerName(player.playerName)}
                              </div>
                              <div className="flex items-center gap-2">
                                {player.nationality && (
                                  <Flag code={player.nationality} size="sm" />
                                )}
                                <span className={cn("text-sm", style.subtext)}>
                                  {categoryShort[player.category]} • {player.clan || "FA"}
                                </span>
                              </div>
                            </div>

                            {/* Rating & Tier */}
                            <div className="text-right">
                              <div className={cn("text-2xl font-bold", style.text)}>
                                {Math.round(player.rating)}
                              </div>
                              <div className={cn("text-xs font-semibold", style.tierColor)}>
                                {tier}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Rest - Compact List */}
              {rest.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-violet-400 mb-6 tracking-wide uppercase">
                    All Players
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {rest.map((player, index) => {
                      const style = getCardStyle(player.rating)
                      const tier = getTierFromRating(player.rating)
                      return (
                        <div
                          key={player.id}
                          onClick={() => fetchPlayerNotes(player.playerId)}
                          className={cn(
                            "rounded-lg border p-3 transition-all hover:scale-[1.02] cursor-pointer",
                            style.border
                          )}
                          style={{ background: style.bg }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-sm w-6">#{index + 16}</span>
                            {player.nationality && (
                              <Flag code={player.nationality} size="sm" />
                            )}
                            <span className={cn("font-medium truncate flex-1", style.text)}>
                              {cleanPlayerName(player.playerName)}
                            </span>
                            <span className={cn("text-xs", style.subtext)}>
                              {tier}
                            </span>
                            <span className={cn("font-bold", style.text)}>
                              {Math.round(player.rating)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rate Tab */}
      {activeTab === "rate" && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* Streamer Controls */}
          {isStreamer && !activeSession && (
            <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Select Player to Rate</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a player..."
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

          {/* Active Rating Session */}
          {activeSession && (
            <div className="space-y-8">
              {/* Player Card in Center */}
              <div className="flex justify-center">
                <div
                  className={cn(
                    "relative w-72 rounded-2xl border-2 p-6",
                    activeSession.finalRating 
                      ? getCardStyle(activeSession.finalRating).border
                      : "border-violet-500/50"
                  )}
                  style={{
                    background: activeSession.finalRating
                      ? getCardStyle(activeSession.finalRating).bg
                      : "linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)"
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-white/20 mb-4">
                      <Image
                        src={getDefaultAvatar(activeSession.category)}
                        alt={activeSession.playerName}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {cleanPlayerName(activeSession.playerName)}
                    </h2>
                    <div className="flex items-center gap-2 text-white/70">
                      {activeSession.nationality && (
                        <Flag code={activeSession.nationality} size="md" />
                      )}
                      <span>{activeSession.category}</span>
                      <span>•</span>
                      <span>{activeSession.clan || "FA"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rater Boxes - 5 on each side */}
              <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Left Side - Raters 1-5 */}
                <div className="space-y-4">
                  {RATER_NAMES.slice(0, 5).map(raterName => {
                    const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                    const isMe = raterName === username
                    return (
                      <div key={raterName} className="space-y-1">
                        <label className={cn(
                          "text-sm font-medium",
                          isMe ? "text-violet-400" : "text-white/50"
                        )}>
                          {raterName} {isMe && "(You)"}
                        </label>
                        <div className={cn(
                          "relative rounded-xl border-2 overflow-hidden",
                          isMe ? "border-violet-500" : "border-white/20",
                          raterData?.score ? "bg-white/10" : "bg-black/40"
                        )}>
                          {isMe ? (
                            <input
                              type="number"
                              min={50}
                              max={99}
                              placeholder="50-99"
                              value={myRating}
                              onChange={(e) => {
                                const val = e.target.value
                                setMyRating(val)
                                submitRating(val)
                              }}
                              disabled={submittingRating}
                              className="w-full px-4 py-3 bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder-white/20"
                            />
                          ) : (
                            <div className="px-4 py-3 text-center text-2xl font-bold text-white">
                              {raterData?.score ?? "—"}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Right Side - Raters 6-10 */}
                <div className="space-y-4">
                  {RATER_NAMES.slice(5, 10).map(raterName => {
                    const raterData = activeSession.ratings.find(r => r.raterName === raterName)
                    const isMe = raterName === username
                    return (
                      <div key={raterName} className="space-y-1">
                        <label className={cn(
                          "text-sm font-medium",
                          isMe ? "text-violet-400" : "text-white/50"
                        )}>
                          {raterName} {isMe && "(You)"}
                        </label>
                        <div className={cn(
                          "relative rounded-xl border-2 overflow-hidden",
                          isMe ? "border-violet-500" : "border-white/20",
                          raterData?.score ? "bg-white/10" : "bg-black/40"
                        )}>
                          {isMe ? (
                            <input
                              type="number"
                              min={50}
                              max={99}
                              placeholder="50-99"
                              value={myRating}
                              onChange={(e) => {
                                const val = e.target.value
                                setMyRating(val)
                                submitRating(val)
                              }}
                              disabled={submittingRating}
                              className="w-full px-4 py-3 bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder-white/20"
                            />
                          ) : (
                            <div className="px-4 py-3 text-center text-2xl font-bold text-white">
                              {raterData?.score ?? "—"}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Note Input */}
              <div className="max-w-2xl mx-auto">
                <label className="text-sm font-medium text-violet-400 mb-2 block">
                  Add a note about {cleanPlayerName(activeSession.playerName)} (optional, max 280 chars)
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Share your thoughts on this player..."
                    value={myNote}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 280)
                      setMyNote(val)
                    }}
                    onBlur={() => submitNote(myNote)}
                    className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 resize-none h-24"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-white/40">
                    {myNote.length}/280
                  </div>
                </div>
              </div>

              {/* Average Rating Display */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-center bg-black/40 border border-violet-500/30 rounded-2xl px-12 py-6">
                  <div className="text-white/50 text-sm mb-1">Current Average</div>
                  <div className="text-6xl font-bold text-violet-400">
                    {calculateAverage() ?? "—"}
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    {activeSession.ratings.filter(r => r.score !== null).length} / {RATER_NAMES.length} votes
                  </div>
                </div>

                {/* Streamer Confirm Button */}
                {isStreamer && (
                  <div className="flex gap-4">
                    <button
                      onClick={confirmSession}
                      disabled={confirming || calculateAverage() === null}
                      className="px-8 py-4 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-white text-xl font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-xl"
                    >
                      {confirming ? "Confirming..." : "✓ Confirm Rating"}
                    </button>
                    <button
                      onClick={endSession}
                      className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white text-xl font-bold rounded-xl transition-all shadow-xl"
                    >
                      ✕ Cancel
                    </button>
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
