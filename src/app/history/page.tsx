"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Flag, CutCornerButton } from "@/components/ui"
import { cn, getTierFromRating } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

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
  id?: string
  score: number
  raterName: string
  raterDiscordName: string | null
  raterDivision: string | null
}

interface SelectedPlayer {
  player: {
    id: string
    name: string
    category: string
    clan: string | null
    nationality: string | null
  }
  ratings: PlayerRating[]
  averageRating: number | null
  totalRatings: number
}

interface SearchPlayer {
  id: string
  name: string
  category: string
  clan: string | null
  nationality: string | null
  avatar: string | null
  isLegend: boolean
}

interface EvolutionPoint {
  period: string
  rating: number
  rank: number
  date: string
}

interface EvolutionData {
  player: {
    id: string
    name: string
    category: string
    clan: string | null
    nationality: string | null
    avatar: string | null
    isLegend: boolean
  }
  history: EvolutionPoint[]
  currentRating: number | null
  totalCurrentRatings: number
}

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"
type ViewMode = "periods" | "players"

// AAA+ Premium card styles (matching community page)
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    bg: "bg-red-500/20",
    border: "border-red-300/60",
    text: "text-white",
    tierColor: "text-red-300",
    isHolo: true,
  }
  if (rating >= 90) return {
    bg: "bg-[#ffdf00]/40",
    border: "",
    text: "text-yellow-950",
    tierColor: "text-[#ffdf00]",
    isHolo: true,
    holoVariant: "gold" as const,
  }
  if (rating >= 85) return {
    bg: "bg-[#d4af37]/35",
    border: "border-[#d4af37]/60",
    text: "text-yellow-950",
    tierColor: "text-[#d4af37]",
  }
  if (rating >= 80) return {
    bg: "bg-white/30",
    border: "border-white/80",
    text: "text-slate-800",
    tierColor: "text-slate-200",
  }
  if (rating >= 75) return {
    bg: "bg-neutral-500/20",
    border: "border-neutral-400/50",
    text: "text-white",
    tierColor: "text-neutral-300",
  }
  if (rating >= 70) return {
    bg: "bg-orange-400/25",
    border: "border-orange-400/60",
    text: "text-orange-50",
    tierColor: "text-orange-300",
  }
  if (rating >= 65) return {
    bg: "bg-orange-700/20",
    border: "border-orange-700/40",
    text: "text-orange-100",
    tierColor: "text-orange-500",
  }
  return {
    bg: "bg-[#6b5344]/20",
    border: "border-[#6b5344]/50",
    text: "text-[#e8dcc5]",
    tierColor: "text-[#a08060]",
  }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-white text-sm font-semibold">{label}</p>
      <p className="text-white/80 text-sm mt-1">
        Rating: <span className="text-white font-bold">{payload[0].value.toFixed(1)}</span>
      </p>
    </div>
  )
}

export default function HistoryPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetails | null>(null)
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPeriod, setLoadingPeriod] = useState(false)
  
  // Player modal state
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null)
  const [loadingPlayerRatings, setLoadingPlayerRatings] = useState(false)
  
  // Clan logos
  const [clanLogos, setClanLogos] = useState<Record<string, string | null>>({})

  // View mode: periods vs player evolution
  const [viewMode, setViewMode] = useState<ViewMode>("periods")

  // Player evolution state
  const [playerSearch, setPlayerSearch] = useState("")
  const debouncedSearch = useDebounce(playerSearch, 300)
  const [playerSearchResults, setPlayerSearchResults] = useState<SearchPlayer[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedEvolutionPlayer, setSelectedEvolutionPlayer] = useState<EvolutionData | null>(null)
  const [loadingEvolution, setLoadingEvolution] = useState(false)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Player search
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setPlayerSearchResults([])
      setSearchOpen(false)
      return
    }
    async function search() {
      setLoadingSearch(true)
      try {
        const res = await fetch(`/api/players/search-history?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setPlayerSearchResults(data)
          setSearchOpen(true)
        }
      } catch (error) {
        console.error("Error searching players:", error)
      } finally {
        setLoadingSearch(false)
      }
    }
    search()
  }, [debouncedSearch])
  
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
  
  const fetchPlayerRatings = async (playerId: string, playerName: string, playerCategory: string, playerClan: string | null, playerNationality: string | null) => {
    setLoadingPlayerRatings(true)
    try {
      if (selectedPeriod) {
        const res = await fetch(`/api/history/${selectedPeriod.id}/players/${playerId}/ratings`)
        if (res.ok) {
          const data = await res.json()
          setSelectedPlayer({
            player: { id: playerId, name: playerName, category: playerCategory, clan: playerClan, nationality: playerNationality },
            ratings: data.ratings || [],
            averageRating: data.averageRating,
            totalRatings: data.totalRatings,
          })
        } else {
          const errorText = await res.text().catch(() => "unknown")
          console.error(`Historical ratings API error ${res.status}:`, errorText)
        }
      } else {
        const res = await fetch(`/api/players/${playerId}/ratings`)
        if (res.ok) {
          const data = await res.json()
          setSelectedPlayer(data)
        } else {
          const errorText = await res.text().catch(() => "unknown")
          console.error(`Player ratings API error ${res.status}:`, errorText)
        }
      }
    } catch (error) {
      console.error("Error fetching player ratings:", error)
    } finally {
      setLoadingPlayerRatings(false)
    }
  }

  const fetchPlayerEvolution = useCallback(async (player: SearchPlayer) => {
    setLoadingEvolution(true)
    setSearchOpen(false)
    setPlayerSearch(player.name)
    try {
      const res = await fetch(`/api/players/${player.id}/history`)
      if (res.ok) {
        const data: EvolutionData = await res.json()
        setSelectedEvolutionPlayer(data)
      }
    } catch (error) {
      console.error("Error fetching player evolution:", error)
    } finally {
      setLoadingEvolution(false)
    }
  }, [])

  const filteredRankings = selectedPeriod?.rankings.filter(r => 
    r.category === category
  ) || []

  const chartData = selectedEvolutionPlayer?.history.map(h => ({
    period: h.period,
    rating: h.rating,
    rank: h.rank,
  })) || []

  const yMin = chartData.length > 0 ? Math.max(50, Math.floor(Math.min(...chartData.map(d => d.rating)) - 5)) : 50
  const yMax = chartData.length > 0 ? Math.min(99, Math.ceil(Math.max(...chartData.map(d => d.rating)) + 5)) : 99

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#555] mb-4">
            Historical Data
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Ranking History
          </h1>
          <p className="text-[#888]">
            View past monthly ranking snapshots and player evolution
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-10">
          <CutCornerButton
            onClick={() => setViewMode("periods")}
            active={viewMode === "periods"}
          >
            Period Rankings
          </CutCornerButton>
          <CutCornerButton
            onClick={() => setViewMode("players")}
            active={viewMode === "players"}
          >
            Player Evolution
          </CutCornerButton>
        </div>

        {viewMode === "periods" ? (
          /* ─── PERIOD RANKINGS VIEW ─── */
          isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#555] text-lg">No historical rankings yet</p>
              <p className="text-[#555] text-sm mt-2">Rankings will be saved at the end of each period</p>
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
                        ? "bg-white text-black"
                        : "bg-white/[0.02] border-white/[0.04] text-[#888] hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="font-semibold">{period.name}</div>
                    <div className={cn("text-sm mt-1", selectedPeriod?.id === period.id ? "text-black/60" : "text-[#888]")}>
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
                        {(["INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                              category === cat
                                ? "bg-white text-black"
                                : "bg-transparent text-[#555] hover:text-white"
                            )}
                          >
                            {cat.charAt(0) + cat.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {loadingPeriod ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredRankings.map((ranking, index) => {
                          const displayRank = index + 1
                          const style = getCardStyle(ranking.averageRating)
                          const tier = getTierFromRating(ranking.averageRating)
                          const clanLogo = ranking.clan ? clanLogos[ranking.clan] : null
                          
                          return (
                            <button
                              key={ranking.id}
                              onClick={() => fetchPlayerRatings(ranking.playerId, ranking.playerName, ranking.category, ranking.clan, ranking.nationality)}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]",
                                style.bg,
                                (style as any).isHolo ? ((style as any).holoVariant === "gold" ? "gold-card" : "holo-card") : style.border
                              )}
                            >
                              <span className={cn(
                                "w-10 text-center font-bold",
                                displayRank === 1 ? "text-white" :
                                displayRank === 2 ? "text-slate-300" :
                                displayRank === 3 ? "text-slate-400" :
                                "text-[#555]"
                              )}>
                                #{displayRank}
                              </span>
                              <Flag code={ranking.nationality} size="md" />
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
                                <div className="text-[#555] text-sm">
                                  {ranking.category} · {ranking.clan || "FA"}
                                </div>
                              </div>
                              <div className={cn("text-xs font-bold px-2 py-0.5 rounded", style.tierColor)}>
                                {tier}
                              </div>
                              <div className="text-right">
                                <div className={cn("font-bold text-lg", style.text)}>
                                  {ranking.averageRating.toFixed(1)}
                                </div>
                                <div className="text-[#555] text-xs">
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
                  <div className="text-center py-12 text-[#555]">
                    Select a period to view rankings
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* ─── PLAYER EVOLUTION VIEW ─── */
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div ref={searchRef} className="relative mb-10">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => { setPlayerSearch(e.target.value); if (e.target.value.length >= 2) setSearchOpen(true) }}
                  placeholder="Search a player to view their rating evolution..."
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-base"
                />
                {loadingSearch && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchOpen && playerSearchResults.length > 0 && (
                <div className="absolute z-30 w-full mt-2 bg-[#0a0a0a] border border-white/[0.06] rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                  {playerSearchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => fetchPlayerEvolution(p)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      {p.avatar ? (
                        <Image src={p.avatar} alt="" width={28} height={28} className="rounded-full object-cover w-7 h-7" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-[#555] font-bold">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <Flag code={p.nationality} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium truncate block">{p.name}</span>
                        <span className="text-[#555] text-xs">{p.category} · {p.clan || "FA"}</span>
                      </div>
                      {p.isLegend && (
                        <span className="text-yellow-400 text-xs font-bold">LEGEND</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {searchOpen && debouncedSearch.length >= 2 && playerSearchResults.length === 0 && !loadingSearch && (
                <div className="absolute z-30 w-full mt-2 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-6 text-center">
                  <p className="text-[#555]">No players found</p>
                </div>
              )}
            </div>

            {/* Evolution Content */}
            {loadingEvolution ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : selectedEvolutionPlayer ? (
              <div className="space-y-8 animate-fadeIn">
                {/* Player Info Header */}
                <div className="flex items-center gap-5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                  {selectedEvolutionPlayer.player.avatar ? (
                    <Image
                      src={selectedEvolutionPlayer.player.avatar}
                      alt={selectedEvolutionPlayer.player.name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover w-14 h-14"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl text-[#555] font-bold">
                      {selectedEvolutionPlayer.player.name.charAt(0)}
                    </div>
                  )}
                  <Flag code={selectedEvolutionPlayer.player.nationality} size="lg" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                      {selectedEvolutionPlayer.player.name}
                      {selectedEvolutionPlayer.player.isLegend && (
                        <span className="text-yellow-400 text-xs font-bold px-2 py-0.5 border border-yellow-400/30 rounded">LEGEND</span>
                      )}
                    </h2>
                    <p className="text-[#888] text-sm mt-1">
                      {selectedEvolutionPlayer.player.category} · {selectedEvolutionPlayer.player.clan || "Free Agent"}
                    </p>
                  </div>
                  {selectedEvolutionPlayer.currentRating !== null && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {selectedEvolutionPlayer.currentRating.toFixed(1)}
                      </div>
                      <div className="text-[#555] text-xs mt-1">Current Rating</div>
                    </div>
                  )}
                </div>

                {/* Chart */}
                {chartData.length > 1 ? (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-[#888] mb-6 tracking-wide uppercase">Rating Evolution</h3>
                    <ResponsiveContainer width="100%" height={340}>
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tick={{ fill: "#555", fontSize: 12 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[yMin, yMax]}
                          tick={{ fill: "#555", fontSize: 12 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="#fff"
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: "#fff", stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 8, fill: "#fff", stroke: "rgba(255,255,255,0.3)", strokeWidth: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : chartData.length === 1 ? (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 text-center">
                    <p className="text-[#888]">Only one data point available. More periods are needed to show evolution.</p>
                    <div className="mt-4 text-white text-3xl font-bold">{chartData[0].rating.toFixed(1)}</div>
                    <p className="text-[#555] text-sm mt-1">{chartData[0].period}</p>
                  </div>
                ) : (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 text-center">
                    <p className="text-[#555]">No historical data for this player yet.</p>
                  </div>
                )}

                {/* Data Table */}
                {chartData.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.04]">
                      <h3 className="text-sm font-semibold text-[#888] tracking-wide uppercase">Period Details</h3>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-[#555] uppercase tracking-wider">Period</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-[#555] uppercase tracking-wider">Rating</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-[#555] uppercase tracking-wider">Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, i) => (
                          <tr key={i} className="border-b border-white/[0.02] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3 text-white text-sm font-medium">{row.period}</td>
                            <td className="px-6 py-3 text-right text-white text-sm font-bold">{row.rating.toFixed(1)}</td>
                            <td className="px-6 py-3 text-right text-[#888] text-sm">
                              {row.period === "Current" ? "—" : `#${row.rank}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-[#333] mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                </div>
                <p className="text-[#555] text-lg">Search for a player to view their rating evolution over time</p>
              </div>
            )}
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
            className="bg-[#0a0a0a] rounded-2xl border border-white/[0.04] max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {loadingPlayerRatings ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : selectedPlayer && (
              <>
                <div className="p-6 border-b border-white/[0.04]">
                  <div className="flex items-center gap-4">
                    <Flag code={selectedPlayer.player.nationality} size="lg" />
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">
                        {selectedPlayer.player.name}
                      </h3>
                      <p className="text-[#888] text-sm">
                        {selectedPlayer.player.category} · {selectedPlayer.player.clan || "Free Agent"}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-white">
                        {selectedPlayer.averageRating?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-[#555] text-xs">
                        {selectedPlayer.totalRatings} ratings
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  <h4 className="text-sm font-medium text-[#888] mb-4">Individual Ratings</h4>
                  {selectedPlayer.ratings.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[#888]">No individual ratings recorded for this period.</p>
                      {selectedPlayer.averageRating !== null && (
                        <p className="text-[#555] text-sm mt-2">
                          Aggregated rating: {selectedPlayer.averageRating.toFixed(1)} from {selectedPlayer.totalRatings} votes
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPlayer.ratings.map((rating, idx) => (
                        <div 
                          key={rating.id || idx}
                          className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg"
                        >
                          <div>
                            <span className="text-white font-medium">
                              {rating.raterDiscordName || rating.raterName || "Anonymous"}
                            </span>
                            {rating.raterDivision && (
                              <span className="ml-2 text-xs text-[#888]">
                                Div {rating.raterDivision}
                              </span>
                            )}
                          </div>
                          <span className="text-white font-bold text-lg">
                            {rating.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-white/[0.04]">
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-lg text-white font-medium transition-colors"
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
