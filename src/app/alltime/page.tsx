"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

interface HistoryPoint {
  period: string
  rating: number
}

interface AllTimeRanking {
  playerId: string
  playerName: string
  category: string
  clan: string | null
  nationality: string | null
  avatar?: string | null
  averageRating: number
  periodCount: number
  periods: string[]
  history: HistoryPoint[]
  rank: number
  isLegend?: boolean
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

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

// Legend style - old school marble/cream with heavy grain
const LEGEND_STYLE = {
  bg: "linear-gradient(145deg, #e8dcc8 0%, #d4c4a8 15%, #f0e6d2 30%, #c8b898 50%, #e0d4c0 70%, #d8c8a8 85%, #f4ead6 100%)",
  border: "border-[#c0a878]",
  accent: "from-[#a08050] via-[#d0c0a0] to-[#a08050]",
  text: "text-[#3d3020]",
  subtext: "text-[#5d4d30]",
  noiseOpacity: 0.65, // Very heavy grain for old school look
  overlayGradient: "linear-gradient(180deg, rgba(255,245,230,0.4) 0%, transparent 30%, rgba(180,160,120,0.2) 70%, rgba(160,140,100,0.3) 100%)",
}

// AAA+ Premium card styles with heavy textures
function getCardStyle(rating: number, isLegend?: boolean) {
  if (isLegend) return { ...LEGEND_STYLE, boxBg: "bg-[#d4c4a8]/20", tierColor: "text-[#8b7355]" }
  
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
    // BRIGHT GOLD - Bright yellow gold
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
    // GOLD - Normal yellow gold
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
    bg: "linear-gradient(145deg, #2a2a2a 0%, #4a4a4a 25%, #6a6a6a 50%, #4a4a4a 75%, #2a2a2a 100%)",
    border: "border-slate-300/50",
    accent: "from-white via-slate-200 to-white",
    text: "text-white",
    subtext: "text-slate-200",
    noiseOpacity: 0.22,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
    boxBg: "bg-slate-400/20",
    tierColor: "text-slate-300",
  }
  if (rating >= 75) return {
    bg: "linear-gradient(145deg, #1f1f1f 0%, #3a3a3a 25%, #505050 50%, #3a3a3a 75%, #1f1f1f 100%)",
    border: "border-slate-400/40",
    accent: "from-slate-300 via-white to-slate-300",
    text: "text-slate-100",
    subtext: "text-slate-300",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
    boxBg: "bg-slate-500/20",
    tierColor: "text-slate-400",
  }
  if (rating >= 70) return {
    bg: "linear-gradient(145deg, #1a0800 0%, #4a1c00 25%, #6d3500 50%, #4a1c00 75%, #1a0800 100%)",
    border: "border-orange-500/50",
    accent: "from-orange-300 via-orange-200 to-orange-300",
    text: "text-orange-50",
    subtext: "text-orange-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(234,88,12,0.1) 0%, transparent 50%, rgba(194,65,12,0.08) 100%)",
    boxBg: "bg-orange-500/20",
    tierColor: "text-orange-400",
  }
  if (rating >= 65) return {
    bg: "linear-gradient(145deg, #120500 0%, #2d1000 25%, #451a00 50%, #2d1000 75%, #120500 100%)",
    border: "border-orange-600/40",
    accent: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-100",
    subtext: "text-orange-300",
    noiseOpacity: 0.32,
    overlayGradient: "linear-gradient(180deg, rgba(194,65,12,0.08) 0%, transparent 50%)",
    boxBg: "bg-orange-600/20",
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

export default function AllTimePage() {
  const [rankings, setRankings] = useState<AllTimeRanking[]>([])
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRatingsDetails | null>(null)
  const [loadingPlayerRatings, setLoadingPlayerRatings] = useState(false)

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

  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true)
      try {
        const url = `/api/rankings/alltime?category=${category}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setRankings(data)
          } else {
            setRankings(data.rankings || [])
          }
        }
      } catch (error) {
        console.error("Error fetching all-time rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRankings()
  }, [category])

  // Split rankings into sections
  const top3 = rankings.slice(0, 3)
  const elite = rankings.slice(3, 15)
  const promising = rankings.slice(15, 30)
  const rest = rankings.slice(30)
  const config = categoryConfig[category]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Cumulative Rankings
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            All Time Rankings
          </h1>
          <p className="text-white/50 mb-8">
            Average performance across all ranking periods
          </p>

          {/* Category Filter */}
          <div className="flex justify-center gap-2">
            {(["INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-semibold transition-all",
                  category === cat
                    ? "bg-amber-500 text-black shadow-xl"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                )}
              >
                {categoryConfig[cat].label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  ✕
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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No all-time rankings yet</p>
          <p className="text-white/30 text-sm mt-2">
            All-time rankings include legends and historical data
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-20 pt-12">
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
                      key={player.playerId} 
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
                  <ElitePlayerCard key={player.playerId} player={player} onPlayerClick={fetchPlayerRatings} />
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
                  <CompactPlayerCard key={player.playerId} player={player} onPlayerClick={fetchPlayerRatings} />
                ))}
              </div>
            </section>
          )}
          
          {/* REMAINING PLAYERS */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                All {config.label}
              </h2>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {rest.map((player) => {
                    const style = getCardStyle(player.averageRating, player.isLegend)
                    const tier = getTierFromRating(player.averageRating)
                    return (
                      <button
                        key={player.playerId}
                        onClick={() => fetchPlayerRatings(player.playerId)}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:brightness-125 transition-all text-left cursor-pointer border border-white/10",
                          style.boxBg
                        )}
                      >
                        <span className="text-white/40 w-7 text-xs">#{player.rank}</span>
                        <Flag code={player.nationality} size="sm" />
                        <span className={cn(
                          "truncate flex-1",
                          player.isLegend ? "text-white font-medium" : "text-white/80"
                        )}>
                          {cleanPlayerName(player.playerName)}
                          {player.isLegend && <span className="text-white/40 text-xs ml-1">LEG</span>}
                        </span>
                        <span className={cn("font-bold text-xs", style.tierColor)}>{tier}</span>
                        <span className="text-white/60 font-mono text-xs">{player.averageRating.toFixed(1)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

// FIFA-style display card for Top 3
function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter,
  onPlayerClick
}: { 
  player: AllTimeRanking
  rank: number
  isCenter: boolean
  onPlayerClick?: (id: string) => void
}) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.averageRating)
  
  const rankLabels = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.playerId)}
      className={cn(
        "flex justify-center",
        isCenter ? "md:scale-110 z-10" : ""
      )}
    >
      <div className={`relative w-48 sm:w-56 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border} hover:scale-105 transition-transform cursor-pointer`}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: style.bg }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: style.overlayGradient }} />
        
        {/* Noise texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`noise-${player.playerId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noise-${player.playerId})`} />
        </svg>
        
        {/* Inner Border */}
        <div className="absolute inset-4 border border-dashed border-white/15 rounded-2xl pointer-events-none z-10" />
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />

        {/* Content */}
        <div className="relative h-full flex flex-col p-4 z-30">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center -ml-1">
              <span className={`text-4xl font-black ${style.text} leading-none drop-shadow-lg`}>
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
              <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight truncate`}>
                {cleanPlayerName(player.playerName)}
              </h2>
              {player.isLegend && (
                <p className={`text-xs ${style.subtext} uppercase tracking-widest mt-0.5`}>Prime</p>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="flex-1 relative flex flex-col items-center justify-start mt-0">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-t ${style.accent} opacity-15 blur-2xl rounded-full`} />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/30 z-10">
              <Image src={avatarSrc} alt={player.playerName} width={96} height={96} className="w-full h-full object-cover" />
            </div>
            
            <div className="absolute right-3 bottom-0 z-20">
              <Flag code={player.nationality} size="md" />
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-auto pt-3">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-2 rounded-full opacity-40`} />
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className={`text-[8px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>Tier</span>
                <span className={`text-sm font-black ${style.text}`}>{playerTier}</span>
              </div>
              {player.clan && (
                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                  <span className={`text-xs font-bold ${style.text}`}>{player.clan}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Elite player card (ranks 4-15)
function ElitePlayerCard({ player, onPlayerClick }: { player: AllTimeRanking; onPlayerClick?: (id: string) => void }) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.averageRating)

  return (
    <button onClick={() => onPlayerClick?.(player.playerId)} className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-2 ${style.border} hover:scale-105 transition-transform cursor-pointer w-full`}>
      <div className="absolute inset-0" style={{ background: style.bg }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: style.overlayGradient }} />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
        <filter id={`elite-noise-${player.playerId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#elite-noise-${player.playerId})`} />
      </svg>
      
      <div className="absolute inset-2 border border-dashed border-white/10 rounded-xl pointer-events-none z-10" />

      <div className="relative h-full flex flex-col p-3 z-20">
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-2xl font-black ${style.text} leading-none`}>{player.averageRating.toFixed(0)}</span>
            <div className={`text-[8px] font-bold ${style.subtext} uppercase tracking-wider mt-0.5`}>{categoryShort[player.category]}</div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold ${style.subtext} opacity-70`}>#{player.rank}</span>
            <div className={`text-sm font-black ${style.text}`}>{playerTier}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-2">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10 shadow-lg">
            <Image src={avatarSrc} alt={player.playerName} width={56} height={56} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center">
          <h3 className={`text-sm font-bold ${style.text} truncate`}>{cleanPlayerName(player.playerName)}</h3>
          {player.isLegend && <p className={`text-[10px] ${style.subtext} uppercase`}>Prime</p>}
          <div className="flex items-center justify-center gap-1 mt-1">
            <Flag code={player.nationality} size="sm" />
            {player.clan && <span className={`text-[10px] ${style.subtext} truncate max-w-[60px]`}>{player.clan}</span>}
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact player card (ranks 16-30)
function CompactPlayerCard({ player, onPlayerClick }: { player: AllTimeRanking; onPlayerClick?: (id: string) => void }) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const playerTier = getTierFromRating(player.averageRating)
  
  return (
    <button onClick={() => onPlayerClick?.(player.playerId)} className={cn(
      "flex items-center gap-3 p-3 rounded-xl hover:brightness-125 transition-all border border-white/10 w-full text-left cursor-pointer",
      style.boxBg
    )}>
      <span className="text-white/40 w-8 text-sm font-bold">#{player.rank}</span>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-black/30">
        <Image 
          src={player.avatar || getDefaultAvatar(player.category)} 
          alt={player.playerName}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-semibold truncate",
            player.isLegend ? "text-white" : "text-white/80"
          )}>
            {cleanPlayerName(player.playerName)}
          </h3>
          {player.isLegend && <span className="text-white/40 text-xs">LEG</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Flag code={player.nationality} size="sm" />
          <span>{player.clan || "FA"}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn("font-bold text-sm", style.tierColor)}>{playerTier}</span>
        <span className="text-white/60 text-sm font-mono">{player.averageRating.toFixed(1)}</span>
      </div>
    </button>
  )
}
