"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, getTierFromRating } from "@/lib/utils"

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  _count: { rankings: number }
}

interface HistoricalRanking {
  id: string
  playerId: string
  playerName: string
  category: string
  clan: string | null
  nationality: string | null
  averageRating: number
  totalRatings: number
  rank: number
}

interface PeriodDetails {
  id: string
  name: string
  startDate: string
  endDate: string
  rankings: HistoricalRanking[]
}

interface PlayerRating {
  id: string
  score: number
  raterName: string
  raterDiscordName: string | null
  raterDivision: string | null
}

interface SelectedPlayer {
  id: string
  name: string
  category: string
  clan: string | null
  nationality: string | null
  ratings: PlayerRating[]
  averageRating: number | null
  totalRatings: number
}

type Category = "INFANTRY" | "CAVALRY" | "ARCHER" | "ALL"

// Card style based on rating tier
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    bg: "bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900",
    border: "border-purple-500/50",
    text: "text-purple-300",
    tierColor: "text-purple-400",
  }
  if (rating >= 90) return {
    bg: "bg-gradient-to-r from-yellow-900/40 via-yellow-700/30 to-yellow-900/40",
    border: "border-yellow-400/60",
    text: "text-yellow-300",
    tierColor: "text-yellow-400",
  }
  if (rating >= 85) return {
    bg: "bg-gradient-to-r from-yellow-900/30 via-amber-800/20 to-yellow-900/30",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
    tierColor: "text-yellow-500",
  }
  if (rating >= 80) return {
    bg: "bg-gradient-to-r from-slate-700/40 via-slate-500/30 to-slate-700/40",
    border: "border-slate-300/50",
    text: "text-slate-200",
    tierColor: "text-slate-200",
  }
  if (rating >= 75) return {
    bg: "bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40",
    border: "border-slate-500/40",
    text: "text-slate-400",
    tierColor: "text-slate-400",
  }
  if (rating >= 70) return {
    bg: "bg-gradient-to-r from-orange-900/30 via-amber-800/20 to-orange-900/30",
    border: "border-orange-500/40",
    text: "text-orange-400",
    tierColor: "text-orange-400",
  }
  return {
    bg: "bg-gradient-to-r from-orange-950/30 via-amber-900/20 to-orange-950/30",
    border: "border-orange-700/40",
    text: "text-orange-500",
    tierColor: "text-orange-600",
  }
}

export default function HistoryPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetails | null>(null)
  const [category, setCategory] = useState<Category>("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPeriod, setLoadingPeriod] = useState(false)
  
  // Player modal state
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null)
  const [loadingPlayerRatings, setLoadingPlayerRatings] = useState(false)
  
  // Clan logos
  const [clanLogos, setClanLogos] = useState<Record<string, string | null>>({})

  useEffect(() => {
    async function fetchPeriods() {
      try {
        const res = await fetch("/api/rankings/history")
        if (res.ok) {
          const data = await res.json()
          setPeriods(data)
        }
      } catch (error) {
        console.error("Error fetching periods:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPeriods()
  }, [])
  
  // Fetch clan logos when period is loaded
  useEffect(() => {
    async function fetchClanLogos() {
      if (!selectedPeriod) return
      
      const clans = [...new Set(selectedPeriod.rankings.map(r => r.clan).filter(Boolean))] as string[]
      if (clans.length === 0) return
      
      try {
        const res = await fetch(`/api/clans?shortNames=${clans.join(",")}`)
        if (res.ok) {
          const data = await res.json()
          const logos: Record<string, string | null> = {}
          data.forEach((c: { shortName: string; logo: string | null }) => {
            logos[c.shortName] = c.logo
          })
          setClanLogos(logos)
        }
      } catch (error) {
        console.error("Error fetching clan logos:", error)
      }
    }
    fetchClanLogos()
  }, [selectedPeriod])

  const fetchPeriodDetails = async (periodId: string) => {
    setLoadingPeriod(true)
    try {
      const res = await fetch(`/api/rankings/history?periodId=${periodId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedPeriod(data)
      }
    } catch (error) {
      console.error("Error fetching period details:", error)
    } finally {
      setLoadingPeriod(false)
    }
  }
  
  const fetchPlayerRatings = async (playerId: string) => {
    setLoadingPlayerRatings(true)
    try {
      const res = await fetch(`/api/players/${playerId}/ratings`)
      if (res.ok) {
        const data = await res.json()
        setSelectedPlayer(data)
      }
    } catch (error) {
      console.error("Error fetching player ratings:", error)
    } finally {
      setLoadingPlayerRatings(false)
    }
  }

  const filteredRankings = selectedPeriod?.rankings.filter(r => 
    category === "ALL" || r.category === category
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Historical Data
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Ranking History
          </h1>
          <p className="text-white/50">
            View past monthly ranking snapshots
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No historical rankings yet</p>
            <p className="text-white/30 text-sm mt-2">Rankings will be saved at the end of each period</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Period List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white mb-4">Periods</h2>
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => fetchPeriodDetails(period.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedPeriod?.id === period.id
                      ? "bg-amber-500/20 border-amber-500/50 text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                >
                  <div className="font-semibold">{period.name}</div>
                  <div className="text-sm text-white/50 mt-1">
                    {period._count.rankings} players
                  </div>
                </button>
              ))}
            </div>

            {/* Rankings Display */}
            <div className="md:col-span-2">
              {selectedPeriod ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedPeriod.name}
                    </h2>
                    <div className="flex gap-2">
                      {(["ALL", "INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            category === cat
                              ? "bg-amber-500 text-black"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          )}
                        >
                          {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingPeriod ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredRankings.map((ranking) => {
                        const style = getCardStyle(ranking.averageRating)
                        const tier = getTierFromRating(ranking.averageRating)
                        const clanLogo = ranking.clan ? clanLogos[ranking.clan] : null
                        
                        return (
                          <button
                            key={ranking.id}
                            onClick={() => fetchPlayerRatings(ranking.playerId)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]",
                              style.bg,
                              style.border
                            )}
                          >
                            <span className={cn(
                              "w-10 text-center font-bold",
                              ranking.rank === 1 ? "text-amber-400" :
                              ranking.rank === 2 ? "text-slate-300" :
                              ranking.rank === 3 ? "text-amber-600" :
                              "text-white/40"
                            )}>
                              #{ranking.rank}
                            </span>
                            <Flag code={ranking.nationality} size="md" />
                            {/* Clan Logo */}
                            {clanLogo && (
                              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                <Image 
                                  src={clanLogo} 
                                  alt={ranking.clan || ""} 
                                  width={24} 
                                  height={24}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="text-white font-medium">{ranking.playerName}</div>
                              <div className="text-white/40 text-sm">
                                {ranking.category} · {ranking.clan || "FA"}
                              </div>
                            </div>
                            {/* Tier Badge */}
                            <div className={cn("text-xs font-bold px-2 py-0.5 rounded", style.tierColor)}>
                              {tier}
                            </div>
                            <div className="text-right">
                              <div className={cn("font-bold text-lg", style.text)}>
                                {ranking.averageRating.toFixed(1)}
                              </div>
                              <div className="text-white/40 text-xs">
                                {ranking.totalRatings} ratings
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-white/40">
                  Select a period to view rankings
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Player Ratings Modal */}
      {(selectedPlayer || loadingPlayerRatings) && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl border border-white/20 max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {loadingPlayerRatings ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : selectedPlayer && (
              <>
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <Flag code={selectedPlayer.nationality} size="lg" />
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">
                        {selectedPlayer.name}
                      </h3>
                      <p className="text-white/50 text-sm">
                        {selectedPlayer.category} · {selectedPlayer.clan || "Free Agent"}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-amber-400">
                        {selectedPlayer.averageRating?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-white/40 text-xs">
                        {selectedPlayer.totalRatings} ratings
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  <h4 className="text-sm font-medium text-white/60 mb-4">Individual Ratings</h4>
                  {selectedPlayer.ratings.length === 0 ? (
                    <p className="text-white/40 text-center py-4">No ratings yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPlayer.ratings.map((rating) => (
                        <div 
                          key={rating.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div>
                            <span className="text-white font-medium">
                              {rating.raterDiscordName || rating.raterName}
                            </span>
                            {rating.raterDivision && (
                              <span className="ml-2 text-xs text-amber-400/70">
                                Div {rating.raterDivision}
                              </span>
                            )}
                          </div>
                          <span className="text-amber-400 font-bold text-lg">
                            {rating.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
