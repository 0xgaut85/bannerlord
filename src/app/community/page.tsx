"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PlayerWithRating } from "@/types"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

const categoryConfig = {
  INFANTRY: { label: "Infantry" },
  CAVALRY: { label: "Cavalry" },
  ARCHER: { label: "Archers" },
}

// Get default avatar based on category
function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

// Calculate tier from rating for FIFA card display
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

// AAA+ Premium card styles with heavy textures
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    // ICON - Obsidian Diamond with aurora undertones
    bg: "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)",
    border: "border-cyan-300/60",
    accent: "from-cyan-300 via-white to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, transparent 40%, rgba(6,182,212,0.05) 100%)",
  }
  if (rating >= 90) return {
    // LEGEND - Deep molten gold with ember core
    bg: "linear-gradient(145deg, #1a0f00 0%, #3d2200 20%, #5c3a00 40%, #4a2c00 60%, #2d1800 80%, #1a0f00 100%)",
    border: "border-amber-400/60",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-50",
    subtext: "text-amber-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(255,193,7,0.15) 0%, transparent 50%, rgba(255,152,0,0.1) 100%)",
  }
  if (rating >= 85) return {
    // GOLD - Burnished gold with depth
    bg: "linear-gradient(145deg, #5c4a00 0%, #8b7500 25%, #b8960a 50%, #8b7500 75%, #5c4a00 100%)",
    border: "border-yellow-400/50",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-white",
    subtext: "text-yellow-100",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,215,0,0.1) 100%)",
  }
  if (rating >= 80) return {
    // SILVER - Polished steel with industrial edge
    bg: "linear-gradient(145deg, #2a2a2a 0%, #4a4a4a 25%, #6a6a6a 50%, #4a4a4a 75%, #2a2a2a 100%)",
    border: "border-slate-300/50",
    accent: "from-white via-slate-200 to-white",
    text: "text-white",
    subtext: "text-slate-200",
    noiseOpacity: 0.22,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
  }
  if (rating >= 75) return {
    // SILVER (Lower) - Weathered steel
    bg: "linear-gradient(145deg, #1f1f1f 0%, #3a3a3a 25%, #505050 50%, #3a3a3a 75%, #1f1f1f 100%)",
    border: "border-slate-400/40",
    accent: "from-slate-300 via-white to-slate-300",
    text: "text-slate-100",
    subtext: "text-slate-300",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
  }
  if (rating >= 70) return {
    // BRONZE - Rich copper patina
    bg: "linear-gradient(145deg, #1a0800 0%, #4a1c00 25%, #6d3500 50%, #4a1c00 75%, #1a0800 100%)",
    border: "border-orange-500/50",
    accent: "from-orange-300 via-orange-200 to-orange-300",
    text: "text-orange-50",
    subtext: "text-orange-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(234,88,12,0.1) 0%, transparent 50%, rgba(194,65,12,0.08) 100%)",
  }
  if (rating >= 65) return {
    // BRONZE (Lower) - Aged copper
    bg: "linear-gradient(145deg, #120500 0%, #2d1000 25%, #451a00 50%, #2d1000 75%, #120500 100%)",
    border: "border-orange-600/40",
    accent: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-100",
    subtext: "text-orange-300",
    noiseOpacity: 0.32,
    overlayGradient: "linear-gradient(180deg, rgba(194,65,12,0.08) 0%, transparent 50%)",
  }
  // WOOD/COMMON - Dark oak with grain
  return {
    bg: "linear-gradient(145deg, #0f0a06 0%, #1f150d 25%, #2a1f15 50%, #1f150d 75%, #0f0a06 100%)",
    border: "border-[#6b5344]/50",
    accent: "from-[#a08060] via-[#c0a080] to-[#a08060]",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
    noiseOpacity: 0.45,
    overlayGradient: "linear-gradient(180deg, rgba(160,128,96,0.05) 0%, transparent 50%)",
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

interface Voter {
  id: string
  name: string
  discordName: string | null
  division: string | null
  totalRatings: number
  infantryCount: number
  cavalryCount: number
  archerCount: number
  isEligible: boolean
}

interface VoterDetails {
  id: string
  name: string
  discordName: string | null
  division: string | null
  ratings: {
    id: string
    score: number
    player: {
      id: string
      name: string
      category: string
      nationality: string | null
      clan: string | null
    }
  }[]
}

interface PlayerRatingsDetails {
  player: {
    id: string
    name: string
    category: string
    clan: string | null
    nationality: string | null
  }
  ratings: {
    id: string
    score: number
    raterName: string | null
    raterDiscordName: string | null
    raterDivision: string | null
  }[]
  averageRating: number | null
  totalRatings: number
}

export default function CommunityPage() {
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [players, setPlayers] = useState<PlayerWithRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showVoters, setShowVoters] = useState(false)
  const [voters, setVoters] = useState<Voter[]>([])
  const [selectedVoter, setSelectedVoter] = useState<VoterDetails | null>(null)
  const [loadingVoters, setLoadingVoters] = useState(false)
  const [votersDisplayCount, setVotersDisplayCount] = useState(12)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRatingsDetails | null>(null)
  const [loadingPlayerRatings, setLoadingPlayerRatings] = useState(false)
  
  // Timer state
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null)
  const [periodName, setPeriodName] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  
  // Fetch timer settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.currentPeriodEnd) {
            setPeriodEnd(new Date(data.currentPeriodEnd))
            setPeriodName(data.currentPeriodName || "")
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }
    fetchSettings()
  }, [])
  
  // Update countdown timer
  useEffect(() => {
    if (!periodEnd) return
    
    const updateTimer = () => {
      const now = new Date()
      const diff = periodEnd.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft(null)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeLeft({ days, hours, minutes, seconds })
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [periodEnd])
  
  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/community?category=${category}`, { cache: 'no-store' })
        if (res.ok) {
          setPlayers(await res.json())
        }
      } catch (error) {
        console.error("Error fetching rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRankings()
  }, [category])
  
  const fetchVoters = async () => {
    setLoadingVoters(true)
    try {
      const res = await fetch("/api/voters")
      if (res.ok) {
        setVoters(await res.json())
      }
    } catch (error) {
      console.error("Error fetching voters:", error)
    } finally {
      setLoadingVoters(false)
    }
  }
  
  const fetchVoterDetails = async (voterId: string) => {
    try {
      const res = await fetch(`/api/voters?userId=${voterId}`)
      if (res.ok) {
        setSelectedVoter(await res.json())
      }
    } catch (error) {
      console.error("Error fetching voter details:", error)
    }
  }

  const fetchPlayerRatings = async (playerId: string) => {
    setLoadingPlayerRatings(true)
    try {
      const res = await fetch(`/api/players/${playerId}/ratings`)
      if (res.ok) {
        setSelectedPlayer(await res.json())
      }
    } catch (error) {
      console.error("Error fetching player ratings:", error)
    } finally {
      setLoadingPlayerRatings(false)
    }
  }
  
  const handleShowVoters = () => {
    setShowVoters(true)
    setVotersDisplayCount(12) // Reset pagination
    if (voters.length === 0) {
      fetchVoters()
    }
  }
  
  const top3 = players.slice(0, 3)
  const elite = players.slice(3, 15)
  const promising = players.slice(15, 30)
  const rest = players.slice(30)
  
  const config = categoryConfig[category]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="text-center py-12 sm:py-16">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
          Community Rankings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
          Current Rankings
        </h1>
        
        {/* Countdown Timer */}
        {timeLeft && periodName && (
          <div className="mb-8">
            <p className="text-white/50 text-sm mb-3">
              {periodName} period closes in:
            </p>
            <div className="flex justify-center gap-3">
              <div className="bg-black/40 rounded-lg px-4 py-2 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400">{timeLeft.days}</div>
                <div className="text-xs text-white/50 uppercase">Days</div>
              </div>
              <div className="bg-black/40 rounded-lg px-4 py-2 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs text-white/50 uppercase">Hours</div>
              </div>
              <div className="bg-black/40 rounded-lg px-4 py-2 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-white/50 uppercase">Min</div>
              </div>
              <div className="bg-black/40 rounded-lg px-4 py-2 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-white/50 uppercase">Sec</div>
              </div>
            </div>
      </div>
        )}
      
      {/* Category Tabs */}
        <div className="flex justify-center gap-2 mt-8">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setShowVoters(false) }}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold",
                category === cat && !showVoters
                  ? "bg-amber-500 text-black shadow-xl"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
          <button
            onClick={handleShowVoters}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold",
              showVoters
                ? "bg-amber-500 text-black shadow-xl"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            Community Voters
          </button>
        </div>
      </div>
      
      {/* Voter Details Modal */}
      {selectedVoter && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-display text-white">
                    {selectedVoter.discordName || selectedVoter.name}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    Division {selectedVoter.division || "N/A"} · {selectedVoter.ratings.length} ratings
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVoter(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  X
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Group by category */}
              {(["INFANTRY", "CAVALRY", "ARCHER"] as const).map((cat) => {
                const catRatings = selectedVoter.ratings.filter(r => r.player.category === cat)
                if (catRatings.length === 0) return null
                
                return (
                  <div key={cat} className="mb-6">
                    <h3 className="text-amber-400 font-semibold mb-3 text-sm uppercase tracking-wider">
                      {cat} ({catRatings.length})
                    </h3>
                    <div className="space-y-2">
                      {catRatings.map((rating) => (
                        <div 
                          key={rating.id}
                          className="flex items-center justify-between bg-black/20 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Flag code={rating.player.nationality} size="sm" />
                            <div>
                              <span className="text-white font-medium">{rating.player.name}</span>
                              {rating.player.clan && (
                                <span className="text-white/40 text-sm ml-2">{rating.player.clan}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-amber-400 font-bold text-lg">{rating.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Player Ratings Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <Flag code={selectedPlayer.player.nationality} size="md" />
                    <div>
                      <h2 className="text-2xl font-display text-white">
                        {selectedPlayer.player.name}
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        {selectedPlayer.player.category} · {selectedPlayer.player.clan || "FA"}
        </p>
      </div>
    </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-3xl font-bold text-amber-400">
                    {selectedPlayer.averageRating || "-"}
                  </div>
                  <div className="text-white/50 text-xs">
                    {selectedPlayer.totalRatings} rating{selectedPlayer.totalRatings !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  X
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingPlayerRatings ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : selectedPlayer.ratings.length === 0 ? (
                <div className="text-center text-white/40 py-8">
                  No ratings yet from real users
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPlayer.ratings.map((rating) => (
                    <div 
                      key={rating.id}
                      className="flex items-center justify-between bg-black/20 rounded-lg p-3"
                    >
                      <div>
                        <span className="text-white font-medium">
                          {rating.raterDiscordName || rating.raterName || "Anonymous"}
                        </span>
                        {rating.raterDiscordName && rating.raterName && rating.raterDiscordName !== rating.raterName && (
                          <span className="text-white/40 text-sm ml-2">({rating.raterName})</span>
                        )}
                        <span className="text-white/30 text-sm ml-2">
                          Div {rating.raterDivision || "?"}
                        </span>
                      </div>
                      <span className="text-amber-400 font-bold text-lg">{rating.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showVoters ? (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Community Voters
          </h2>
          <p className="text-white/50 mb-8 text-sm">
            All users who have submitted ratings. Eligible voters (10 INF, 5 CAV, 5 ARC) are marked with a badge.
          </p>
          
          {loadingVoters ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : voters.length === 0 ? (
            <div className="text-center text-white/40 py-12">No voters yet</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {voters.slice(0, votersDisplayCount).map((voter) => (
                  <button
                    key={voter.id}
                    onClick={() => fetchVoterDetails(voter.id)}
                    className={cn(
                      "border rounded-xl p-4 text-left transition-all",
                      voter.isEligible 
                        ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 hover:border-green-500/50" 
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold truncate">
                          {voter.discordName || voter.name}
                        </h3>
                        {voter.discordName && voter.name !== voter.discordName && (
                          <p className="text-white/40 text-xs truncate">{voter.name}</p>
                        )}
                      </div>
                      {voter.isEligible && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium shrink-0">
                          Eligible
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
                      <span className="text-white/50">
                        Div {voter.division || "N/A"}
                      </span>
                      <span className="text-amber-400">
                        {voter.totalRatings} total
                      </span>
                      <span className="text-white/30">
                        ({voter.infantryCount}I/{voter.cavalryCount}C/{voter.archerCount}A)
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {voters.length > votersDisplayCount && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVotersDisplayCount(prev => prev + 12)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                  >
                    Show More ({voters.length - votersDisplayCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* THE CHOSEN THREE */}
          {top3.length > 0 && (
            <section className="mb-20">
              <h2 className="text-center text-2xl font-display font-bold text-amber-400 mb-2 tracking-wider">
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
                      onPlayerClick={fetchPlayerRatings}
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
                  <ElitePlayerCard key={player.id} player={player} onPlayerClick={fetchPlayerRatings} />
                ))}
              </div>
            </section>
          )}
          
          {/* RISING STARS */}
          {promising.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl font-display font-bold text-white/80 mb-2">
                Rising Stars
              </h2>
              <p className="text-white/40 mb-6 text-sm">
                Rank #16 - #30
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {promising.map((player) => (
                  <CompactPlayerCard key={player.id} player={player} onPlayerClick={fetchPlayerRatings} />
                ))}
              </div>
            </section>
          )}
          
          {/* REMAINING PLAYERS IN THIS CATEGORY */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                All {config.label}
              </h2>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {rest.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => fetchPlayerRatings(player.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="text-white/40 w-8">#{player.rank}</span>
                      <Flag code={player.nationality} size="sm" />
                      <span className="text-white/80 truncate flex-1">{player.name}</span>
                      <span className="text-white/60 font-mono">{player.averageRating.toFixed(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {players.length === 0 && !isLoading && (
            <div className="text-center py-20 text-white/40">
              <p className="text-xl">No players in this category yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// FIFA-style display card for Top 3 - AAA+ Premium Design
function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter,
  onPlayerClick
}: { 
  player: PlayerWithRating
  rank: number
  isCenter: boolean
  onPlayerClick?: (id: string) => void
}) {
  const style = getCardStyle(player.averageRating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.averageRating)
  const clanLogo = (player as any).clanLogo || null
  
  const rankLabels = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.id)}
      className={cn(
        "flex justify-center",
        isCenter ? "md:scale-110 z-10" : ""
      )}
    >
      {/* FIFA Card - AAA+ Premium Design */}
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
          <filter id={`noiseFilter-${player.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noiseFilter-${player.id})`} />
        </svg>
        
        {/* Secondary grain layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-soft-light" style={{ opacity: style.noiseOpacity * 0.5 }}>
          <filter id={`grainFilter-${player.id}`}>
            <feTurbulence type="turbulence" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grainFilter-${player.id})`} />
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
                {player.averageRating.toFixed(0)}
              </span>
              <span className={`text-[10px] font-bold ${style.subtext} tracking-widest mt-1 uppercase`}>
                {categoryShort[player.category]}
              </span>
              <div className={`h-0.5 w-6 bg-gradient-to-r ${style.accent} mt-1.5 rounded-full`} />
            </div>
            
            <div className="flex-1 text-right mt-1 pl-2">
              <div className={`text-xs font-bold ${style.subtext} mb-0.5 opacity-80 tracking-widest`}>
                {rankLabels[rank as 1 | 2 | 3]}
              </div>
              <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md truncate`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                {cleanPlayerName(player.name)}
              </h2>
            </div>
          </div>

          {/* Middle Section: Avatar (moved higher) and Bio */}
          <div className="flex-1 relative flex flex-col items-center justify-start mt-0">
            {/* Background Glow behind avatar */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-t ${style.accent} opacity-15 blur-2xl rounded-full`} />
            
            {/* Player Avatar - 20% bigger */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/30 z-10">
              <Image
                src={avatarSrc}
                alt={player.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bio (below avatar) - max 50 chars, 20% bigger and bold */}
            {player.bio && (
              <p className={`text-xs font-semibold ${style.subtext} text-center mt-1 px-2 italic opacity-90 line-clamp-2`}>
                &quot;{player.bio.slice(0, 50)}{player.bio.length > 50 ? '...' : ''}&quot;
              </p>
            )}

            {/* Clan Logo (left) and Flag (right) - positioned lower */}
            <div className="absolute bottom-0 left-3 z-20">
              <div className="w-6 h-6 bg-black">
                {clanLogo && (
                  <Image
                    src={clanLogo}
                    alt="Clan"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            <div className="absolute right-3 bottom-0 z-20">
              <Flag code={player.nationality} size="md" />
            </div>
          </div>

          {/* Bottom Section: Tier & Clan */}
          <div className="mt-auto pt-3">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-2 rounded-full opacity-40`} />
            
            <div className="flex justify-between items-end">
              {/* Tier */}
              <div className="flex flex-col">
                <span className={`text-[8px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>
                  Tier
                </span>
                <span className={`text-sm font-black ${style.text} drop-shadow-sm`}>
                  {playerTier}
                </span>
              </div>

              {/* Clan Badge */}
              {player.clan && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-lg">
                  <span className={`text-[10px] font-bold ${style.text} tracking-wide`}>
                    {player.clan}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Elite player card (4-15) - Small FIFA Card
function ElitePlayerCard({ player, onPlayerClick }: { player: PlayerWithRating; onPlayerClick?: (id: string) => void }) {
  const style = getCardStyle(player.averageRating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const clanLogo = (player as any).clanLogo || null
  
  return (
    <button onClick={() => onPlayerClick?.(player.id)} className="flex justify-center w-full">
      {/* Small FIFA Card - 20% bigger */}
      <div className={`relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-3 ${style.border} hover:scale-105 transition-transform`}>
        {/* Background Base */}
        <div 
          className="absolute inset-0"
          style={{ background: style.bg }}
        />
        
        {/* Overlay Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: style.overlayGradient }}
        />
        
        {/* Noise Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`eliteNoise-${player.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#eliteNoise-${player.id})`} />
        </svg>

        {/* Inner Border (Dashed) */}
        <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none z-10" />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-2.5 z-30">
          {/* Top: Rating & Rank */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black ${style.text} leading-none`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {player.averageRating.toFixed(0)}
              </span>
              <span className={`text-[8px] font-bold ${style.subtext} tracking-wider uppercase`}>
                {categoryShort[player.category]}
              </span>
            </div>
            <span className={`text-xs font-bold ${style.subtext} opacity-70`}>#{player.rank}</span>
          </div>

          {/* Middle: Avatar and Bio - 20% bigger */}
          <div className="flex-1 relative flex flex-col items-center justify-start py-0.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg border border-white/10 z-10">
              <Image
                src={avatarSrc}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Bio (below avatar) - bigger text */}
            {player.bio && (
              <p className={`text-[9px] font-semibold ${style.subtext} text-center mt-0.5 px-1 italic opacity-90 line-clamp-2`}>
                &quot;{player.bio.slice(0, 50)}{player.bio.length > 50 ? '...' : ''}&quot;
              </p>
            )}
            {/* Clan Logo on left */}
            <div className="absolute left-0 bottom-0 z-20">
              <div className="w-5 h-5 bg-black">
                {clanLogo && (
                  <Image
                    src={clanLogo}
                    alt="Clan"
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            {/* Flag on right */}
            <div className="absolute right-0 bottom-0 shadow-lg z-20">
              <Flag code={player.nationality} size="sm" />
            </div>
          </div>

          {/* Bottom: Name & Clan */}
          <div className="mt-auto">
            <div className={`h-px w-full bg-gradient-to-r ${style.accent} mb-1.5 opacity-40`} />
            <h3 className={`text-xs font-black ${style.text} uppercase truncate text-center`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {cleanPlayerName(player.name)}
            </h3>
            {player.clan && (
              <p className={`text-[9px] ${style.subtext} text-center opacity-70 truncate`}>{player.clan}</p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact player card (16-30) - Rising Stars with Avatar
function CompactPlayerCard({ player, onPlayerClick }: { player: PlayerWithRating; onPlayerClick?: (id: string) => void }) {
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.id)}
      className="w-full bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 text-left transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-sm w-6">#{player.rank}</span>
        <Image 
          src={avatarSrc} 
          alt={player.name} 
          width={28} 
          height={28} 
          className="w-7 h-7 rounded-full object-cover border border-white/10" 
        />
        <Flag code={player.nationality} size="sm" />
        <span className="text-white/80 text-sm truncate flex-1">{player.name}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        {player.clan && <span className="text-white/30 text-xs truncate">{player.clan}</span>}
        <span className="text-white/60 text-sm font-mono ml-auto">{player.averageRating.toFixed(1)}</span>
      </div>
    </button>
  )
}
