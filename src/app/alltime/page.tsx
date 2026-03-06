"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag, Tilt3DCard, CutCornerButton, AnimatedCard, StaggerItem, RowRevealItem, FadeUp, FadeIn, ShimmerDivider, HolographicOverlay } from "@/components/ui"
import { motion, AnimatePresence } from "framer-motion"
import { cn, cleanPlayerName } from "@/lib/utils"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

interface HistoryPoint {
  period: string
  periodId: string
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
    id?: string
    score: number
    raterName: string | null
    raterDiscordName: string | null
    raterDivision: string | null
  }[]
  averageRating: number | null
  totalRatings: number
}

interface HistoricalRatingResponse {
  ratings: {
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
  if (isLegend) return {
    ...LEGEND_STYLE,
    boxBg: "bg-gradient-to-br from-[#f0e6d2] via-[#e0d4c0] to-[#d4c4a8] border-[#c0a878]",
    tierColor: "text-[#6b5344]",
    legendBox: true,
    isHolo: true,
    holoVariant: "legend" as const,
  }
  
  if (rating >= 95) return {
    bg: "linear-gradient(145deg, #1a0505 0%, #2a0a0a 25%, #1f0808 50%, #2a0a0a 75%, #1a0505 100%)",
    border: "",
    accent: "from-red-200 via-white to-red-200",
    text: "text-white",
    subtext: "text-red-200",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,100,100,0.08) 0%, transparent 40%, rgba(139,0,0,0.06) 100%)",
    boxBg: "bg-red-500/20",
    tierColor: "text-red-300",
    isHolo: true,
  }
  if (rating >= 90) return {
    bg: "linear-gradient(145deg, #e6c800 0%, #f2d500 25%, #ffdf00 50%, #f2d500 75%, #e6c800 100%)",
    border: "",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-yellow-950",
    subtext: "text-yellow-900",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(255,223,0,0.2) 100%)",
    boxBg: "bg-[#ffdf00]/25",
    tierColor: "text-[#ffdf00]",
    isHolo: true,
    holoVariant: "gold" as const,
  }
  if (rating >= 85) return {
    bg: "linear-gradient(145deg, #b8962e 0%, #c6a332 25%, #d4af37 50%, #c6a332 75%, #b8962e 100%)",
    border: "border-[#d4af37]/60",
    accent: "from-[#d4af37] via-yellow-100 to-[#d4af37]",
    text: "text-yellow-950",
    subtext: "text-yellow-900",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(212,175,55,0.15) 0%, transparent 50%, rgba(184,150,46,0.1) 100%)",
    boxBg: "bg-[#d4af37]/20",
    tierColor: "text-[#d4af37]",
  }
  if (rating >= 80) return {
    // BRIGHT SILVER - Very shiny polished silver with bright highlights
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
    // LIGHT GRAY - Softer light gray
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
    // BRIGHT BRONZE - Vivid copper shine
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
    // DARK BRONZE - Deep aged copper
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

function EvolutionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-4 py-2.5 shadow-xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-bold">{payload[0].value.toFixed(1)}</p>
    </div>
  )
}

export default function AllTimePage() {
  const [rankings, setRankings] = useState<AllTimeRanking[]>([])
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [isLoading, setIsLoading] = useState(true)
  const [clanLogos, setClanLogos] = useState<Record<string, string | null>>({})

  // Legend modal state
  const [legendModal, setLegendModal] = useState<{ open: boolean; loading: boolean; data: PlayerRatingsDetails | null }>({ open: false, loading: false, data: null })

  // Non-legend modal state (period selector + graph)
  const [selectedNonLegend, setSelectedNonLegend] = useState<AllTimeRanking | null>(null)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [periodRatings, setPeriodRatings] = useState<HistoricalRatingResponse | null>(null)
  const [loadingPeriodRatings, setLoadingPeriodRatings] = useState(false)

  const handlePlayerClick = async (playerId: string, isLegend: boolean = false) => {
    if (isLegend) {
      setSelectedNonLegend(null)
      setLegendModal({ open: true, loading: true, data: null })
      try {
        const res = await fetch(`/api/players/${playerId}/ratings`)
        if (res.ok) {
          const data = await res.json()
          setLegendModal({ open: true, loading: false, data })
        } else {
          console.error(`Legend ratings API error ${res.status}`)
          setLegendModal({ open: true, loading: false, data: null })
        }
      } catch (error) {
        console.error("Error fetching player ratings:", error)
        setLegendModal({ open: true, loading: false, data: null })
      }
    } else {
      setLegendModal({ open: false, loading: false, data: null })
      const player = rankings.find(r => r.playerId === playerId)
      if (player) {
        setSelectedNonLegend(player)
        setSelectedPeriodId(null)
        setPeriodRatings(null)
      }
    }
  }

  const fetchPeriodRatings = async (periodId: string, playerId: string) => {
    setSelectedPeriodId(periodId)
    setLoadingPeriodRatings(true)
    setPeriodRatings(null)
    try {
      const res = await fetch(`/api/history/${periodId}/players/${playerId}/ratings`)
      if (res.ok) {
        setPeriodRatings(await res.json())
      }
    } catch (error) {
      console.error("Error fetching period ratings:", error)
    } finally {
      setLoadingPeriodRatings(false)
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
          const rankingsData = Array.isArray(data) ? data : (data.rankings || [])
          setRankings(rankingsData)
          
          // Fetch clan logos for all unique clans
          const clans = [...new Set(rankingsData.map((r: AllTimeRanking) => r.clan).filter(Boolean))] as string[]
          if (clans.length > 0) {
            const clanRes = await fetch(`/api/clans?shortNames=${clans.join(",")}`)
            if (clanRes.ok) {
              const clanData = await clanRes.json()
              const logos: Record<string, string | null> = {}
              clanData.forEach((c: { shortName: string; logo: string | null }) => {
                logos[c.shortName] = c.logo
              })
              setClanLogos(logos)
            }
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
    <div className="min-h-screen bg-[#050505] animate-fade-up">
      {/* Header */}
      <div className="bg-white/[0.02] border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#555] mb-4">
            Cumulative Rankings
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            All Time Rankings
          </h1>
          <p className="text-[#888] mb-8">
            Average performance across all ranking periods
          </p>

          {/* Category Filter */}
          <div className="flex justify-center gap-2">
            {(["INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map((cat) => (
              <CutCornerButton
                key={cat}
                onClick={() => setCategory(cat)}
                active={category === cat}
              >
                {categoryConfig[cat].label}
              </CutCornerButton>
            ))}
          </div>
        </div>
      </div>

      {/* ─── LEGEND RATINGS MODAL ─── */}
      {legendModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setLegendModal({ open: false, loading: false, data: null })}>
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {legendModal.loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : legendModal.data ? (
              <>
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Flag code={legendModal.data.player.nationality} size="md" />
                      <div>
                        <h2 className="text-2xl font-display text-white">{legendModal.data.player.name}</h2>
                        <p className="text-[#888] text-sm mt-1">{legendModal.data.player.category} · {legendModal.data.player.clan || "?"} <span className="text-yellow-400 text-xs ml-2">LEGEND</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{legendModal.data.averageRating?.toFixed(1) || "-"}</div>
                        <div className="text-[#555] text-xs">{legendModal.data.totalRatings} rating{legendModal.data.totalRatings !== 1 ? "s" : ""}</div>
                      </div>
                      <button onClick={() => setLegendModal({ open: false, loading: false, data: null })} className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center text-white text-lg">✕</button>
                    </div>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {legendModal.data.ratings.length === 0 ? (
                    <div className="text-center text-[#555] py-8">No ratings yet</div>
                  ) : (
                    <div className="space-y-2">
                      {legendModal.data.ratings.map((rating, idx) => (
                        <div key={rating.id || idx} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                          <div>
                            <span className="text-white font-medium">{rating.raterDiscordName || rating.raterName || "Anonymous"}</span>
                            {rating.raterDivision && <span className="text-[#555] text-sm ml-2">Div {rating.raterDivision}</span>}
                          </div>
                          <span className="text-white font-bold text-lg">{rating.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[#888]">Could not load ratings</p>
                <button onClick={() => setLegendModal({ open: false, loading: false, data: null })} className="mt-4 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-white text-sm">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── NON-LEGEND PERIOD SELECTOR MODAL ─── */}
      {selectedNonLegend && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedNonLegend(null)}>
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/[0.04]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Flag code={selectedNonLegend.nationality} size="md" />
                  <div>
                    <h2 className="text-2xl font-display text-white">{cleanPlayerName(selectedNonLegend.playerName)}</h2>
                    <p className="text-[#888] text-sm mt-1">{selectedNonLegend.category} · {selectedNonLegend.clan || "FA"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{selectedNonLegend.averageRating.toFixed(1)}</div>
                    <div className="text-[#555] text-xs">All-time avg · {selectedNonLegend.history.length} period{selectedNonLegend.history.length !== 1 ? "s" : ""}</div>
                  </div>
                  <button onClick={() => setSelectedNonLegend(null)} className="w-10 h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.05] flex items-center justify-center text-white">✕</button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-5rem)]">
              {/* Two-column layout: periods left, graph right */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Period Selector */}
                <div className="md:w-2/5 space-y-2">
                  <h3 className="text-xs font-semibold text-[#888] tracking-[0.2em] uppercase mb-3">Select Period</h3>
                  {selectedNonLegend.history.map((h) => {
                    const isActive = selectedPeriodId === h.periodId
                    return (
                      <button
                        key={h.periodId}
                        onClick={() => fetchPeriodRatings(h.periodId, selectedNonLegend.playerId)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                          isActive
                            ? "bg-white text-black border-white"
                            : "bg-white/[0.02] border-white/[0.06] text-white hover:bg-white/[0.04] hover:border-white/[0.1]"
                        )}
                      >
                        <span className="font-semibold text-sm">{h.period}</span>
                        <span className={cn("font-bold text-lg", isActive ? "text-black" : "text-white")}>{h.rating.toFixed(1)}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Evolution Graph */}
                <div className="md:w-3/5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#888] tracking-[0.2em] uppercase mb-4">Rating Evolution</h3>
                  {selectedNonLegend.history.length >= 2 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={selectedNonLegend.history} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tick={{ fill: "#555", fontSize: 11 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[
                            (dataMin: number) => Math.floor(dataMin * 2 - 1) / 2,
                            (dataMax: number) => Math.ceil(dataMax * 2 + 1) / 2,
                          ]}
                          tick={{ fill: "#555", fontSize: 11 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                          tickLine={false}
                          tickCount={8}
                        />
                        <Tooltip content={<EvolutionTooltip />} />
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
                  ) : (
                    <div className="flex items-center justify-center h-[220px]">
                      <div className="text-center">
                        <div className="text-white text-4xl font-bold">{selectedNonLegend.history[0]?.rating.toFixed(1) || "-"}</div>
                        <p className="text-[#555] text-sm mt-2">{selectedNonLegend.history[0]?.period || "No data"}</p>
                        <p className="text-[#444] text-xs mt-1">More periods needed for graph</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Period Individual Ratings */}
              {selectedPeriodId && (
                <div className="border-t border-white/[0.04] pt-5">
                  <h3 className="text-xs font-semibold text-[#888] tracking-[0.2em] uppercase mb-4">
                    Individual Ratings — {selectedNonLegend.history.find(h => h.periodId === selectedPeriodId)?.period}
                  </h3>
                  {loadingPeriodRatings ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : periodRatings && periodRatings.ratings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto">
                      {periodRatings.ratings.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                          <div>
                            <span className="text-white font-medium text-sm">{r.raterDiscordName || r.raterName || "Anonymous"}</span>
                            {r.raterDivision && <span className="text-[#555] text-xs ml-2">Div {r.raterDivision}</span>}
                          </div>
                          <span className="text-white font-bold">{r.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : periodRatings ? (
                    <div className="text-center text-[#555] py-4">No individual ratings recorded for this period</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#555] text-lg">No all-time rankings yet</p>
          <p className="text-[#555] text-sm mt-2">
            All-time rankings include legends and historical data
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto px-6 pb-20 pt-12"
        >
          {/* THE CHOSEN THREE */}
          {top3.length > 0 && (
            <section className="mb-20">
              <FadeUp>
                <h2 className="text-center text-2xl font-display font-bold text-white mb-2 tracking-wider">
                  THE CHOSEN THREE
                </h2>
                <p className="text-center text-[#888] mb-12 text-sm">
                  The undisputed elite
                </p>
              </FadeUp>
              
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-10 md:gap-14">
                {/* Reorder: 2nd, 1st, 3rd -- center animates first */}
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, idx) => {
                  const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                  const animDelay = idx === 1 ? 0 : idx === 0 ? 0.6 : 1.2
                  return (
                    <AnimatedCard key={player.playerId} delay={animDelay} initialScale={1.6}>
                      <FifaDisplayCard 
                        player={player} 
                        rank={actualRank}
                        isCenter={idx === 1}
                        onPlayerClick={handlePlayerClick}
                        clanLogo={player.clan ? clanLogos[player.clan] : null}
                      />
                    </AnimatedCard>
                  )
                })}
              </div>
            </section>
          )}

          <ShimmerDivider className="mb-16" />
          
          {/* ELITE WARRIORS */}
          {elite.length > 0 && (
            <section className="mb-16">
              <FadeUp>
                <h2 className="text-xl font-display font-bold text-white mb-2">
                  Elite Warriors
                </h2>
                <p className="text-[#888] mb-6 text-sm">
                  Rank #4 - #15
                </p>
              </FadeUp>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {elite.map((player, i) => (
                  <StaggerItem key={player.playerId} index={i} staggerDelay={0.15}>
                    <ElitePlayerCard 
                      player={player} 
                      onPlayerClick={handlePlayerClick}
                      clanLogo={player.clan ? clanLogos[player.clan] : null}
                    />
                  </StaggerItem>
                ))}
              </div>
            </section>
          )}

          <ShimmerDivider className="mb-16" />
          
          {/* RISING STARS */}
          {promising.length > 0 && (
            <section className="mb-16">
              <FadeUp>
                <h2 className="text-xl font-display font-bold text-white/80 mb-2">
                  Rising Stars
                </h2>
                <p className="text-[#555] mb-6 text-sm">
                  Rank #16 - #30
                </p>
              </FadeUp>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {promising.map((player, i) => (
                  <RowRevealItem key={player.playerId} index={i} columnsPerRow={4}>
                    <CompactPlayerCard 
                      player={player} 
                      onPlayerClick={handlePlayerClick} 
                      clanLogo={player.clan ? clanLogos[player.clan] : null}
                    />
                  </RowRevealItem>
                ))}
              </div>
            </section>
          )}
          
          {/* REMAINING PLAYERS */}
          {rest.length > 0 && (
            <FadeIn>
            <section>
              <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                All {config.label}
              </h2>
              
              <div className="bg-white/[0.02] rounded-xl p-4">
                <div className="flex flex-col gap-1.5">
                  {rest.map((player) => {
                    const style = getCardStyle(player.averageRating, player.isLegend)
                    const tier = getTierFromRating(player.averageRating)
                    return (
                      <button
                        key={player.playerId}
                        onClick={() => handlePlayerClick(player.playerId, player.isLegend || false)}
                        className={cn(
                          "relative w-full flex items-center gap-3 p-2.5 rounded-lg text-sm hover:brightness-125 transition-all text-left cursor-pointer overflow-hidden",
                          player.isLegend ? style.boxBg : cn("border border-white/10", style.boxBg),
                          player.isLegend && "legend-card-anim"
                        )}
                      >
                        {/* Grain overlay for legends */}
                        {player.isLegend && (
                          <div 
                            className="absolute inset-0 pointer-events-none opacity-50"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                              mixBlendMode: 'overlay',
                            }}
                          />
                        )}
                        <span className={cn("text-xs w-7 z-10", player.isLegend ? "text-[#6b5344] font-bold" : "text-white/40")}>#{player.rank}</span>
                        <div className="z-10"><Flag code={player.nationality} size="sm" /></div>
                        <span className={cn(
                          "truncate flex-1 z-10",
                          player.isLegend ? "text-[#3d3020] font-semibold" : "text-white/80"
                        )}>
                          {cleanPlayerName(player.playerName)}
                          {player.isLegend && <span className="text-[#8b7355] text-xs ml-1">(L)</span>}
                        </span>
                        <span className={cn("font-bold text-xs z-10", style.tierColor)}>{tier}</span>
                        <span className={cn("font-mono text-xs z-10", player.isLegend ? "text-[#5d4d30]" : "text-white/60")}>{player.averageRating.toFixed(1)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
            </FadeIn>
          )}
        </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// FIFA-style display card for Top 3
function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter,
  onPlayerClick,
  clanLogo
}: { 
  player: AllTimeRanking
  rank: number
  isCenter: boolean
  onPlayerClick?: (id: string, isLegend: boolean) => void
  clanLogo?: string | null
}) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.averageRating)
  
  const rankLabels = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.playerId, player.isLegend || false)}
      className={cn(
        "flex justify-center",
        isCenter ? "md:scale-110 z-10" : ""
      )}
    >
      <Tilt3DCard maxTilt={14} scale={1.05}>
      <div className={cn(`relative w-48 sm:w-56 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 cursor-pointer`, (style as any).isHolo ? ((style as any).holoVariant === "legend" ? "legend-card" : (style as any).holoVariant === "gold" ? "gold-card" : "holo-card") : style.border)}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: style.bg }} />
        {(style as any).isHolo && <HolographicOverlay variant={(style as any).holoVariant || "ruby"} />}
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
            
            {/* Clan Logo (left) */}
            <div className="absolute left-3 bottom-0 z-20">
              <div className="w-6 h-6 bg-black rounded overflow-hidden">
                {clanLogo && (
                  <Image src={clanLogo} alt={player.clan || ""} width={24} height={24} className="w-full h-full object-cover" />
                )}
              </div>
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
              {(player.clan || player.isLegend) && !clanLogo && (
                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                  <span className={`text-xs font-bold ${style.text}`}>{player.clan || (player.isLegend ? "?" : "")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </Tilt3DCard>
    </button>
  )
}

// Elite player card (ranks 4-15) - Small FIFA Card matching community page
function ElitePlayerCard({ player, onPlayerClick, clanLogo }: { player: AllTimeRanking; onPlayerClick?: (id: string, isLegend: boolean) => void; clanLogo?: string | null }) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.averageRating)

  return (
    <button onClick={() => onPlayerClick?.(player.playerId, player.isLegend || false)} className="flex justify-center w-full">
      {/* Small FIFA Card */}
      <div className={cn(`relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-3 hover:scale-105 transition-transform`, (style as any).isHolo ? ((style as any).holoVariant === "legend" ? "legend-card" : (style as any).holoVariant === "gold" ? "gold-card" : "holo-card") : style.border)}>
        {/* Background Base */}
        <div className="absolute inset-0" style={{ background: style.bg }} />
        {(style as any).isHolo && <HolographicOverlay variant={(style as any).holoVariant || "ruby"} />}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: style.overlayGradient }} />
        
        {/* Noise Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`eliteNoise-${player.playerId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#eliteNoise-${player.playerId})`} />
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
          {/* Top: Rating & Rank & Tier */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black ${style.text} leading-none`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {player.averageRating.toFixed(0)}
              </span>
              <span className={`text-[8px] font-bold ${style.subtext} tracking-wider uppercase`}>
                {categoryShort[player.category]}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${style.subtext} opacity-70`}>#{player.rank}</span>
              <div className={`text-sm font-black ${style.text}`}>{playerTier}</div>
            </div>
          </div>

          {/* Middle: Avatar */}
          <div className="flex-1 relative flex flex-col items-center justify-start py-0.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg border border-white/10 z-10">
              <Image
                src={avatarSrc}
                alt={player.playerName}
                fill
                className="object-cover"
              />
            </div>
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
              {cleanPlayerName(player.playerName)}
            </h3>
            {player.isLegend && <p className={`text-[9px] ${style.subtext} text-center opacity-70`}>Prime</p>}
            <p className={`text-[9px] ${style.subtext} text-center opacity-70 truncate`}>
              {player.clan || (player.isLegend ? "?" : "")}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact player card (ranks 16-30) - Rising Stars with Avatar matching community page
function CompactPlayerCard({ player, onPlayerClick, clanLogo }: { player: AllTimeRanking; onPlayerClick?: (id: string, isLegend: boolean) => void; clanLogo?: string | null }) {
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const style = getCardStyle(player.averageRating, player.isLegend)
  const playerTier = getTierFromRating(player.averageRating)
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.playerId, player.isLegend || false)}
      className={cn(
        "relative w-full rounded-lg p-3 hover:brightness-125 text-left transition-all overflow-hidden",
        player.isLegend ? style.boxBg : cn("border border-white/10", style.boxBg),
        player.isLegend && "legend-card-anim"
      )}
    >
      {/* Grain overlay for legends */}
      {player.isLegend && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div className="flex items-center gap-2 z-10 relative">
        <span className={cn("text-sm w-6", player.isLegend ? "text-[#6b5344] font-bold" : "text-white/40")}>#{player.rank}</span>
        <Image 
          src={avatarSrc} 
          alt={player.playerName} 
          width={28} 
          height={28} 
          className="w-7 h-7 rounded-full object-cover border border-white/10" 
        />
        {clanLogo && (
          <Image 
            src={clanLogo} 
            alt={player.clan || ""} 
            width={20} 
            height={20} 
            className="w-5 h-5 rounded object-cover" 
          />
        )}
        <Flag code={player.nationality} size="sm" />
        <span className={cn("text-sm truncate flex-1", player.isLegend ? "text-[#3d3020] font-semibold" : "text-white/80")}>
          {player.playerName}
          {player.isLegend && <span className="text-[#8b7355] text-xs ml-1">(L)</span>}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 z-10 relative">
        {(player.clan || player.isLegend) && !clanLogo && <span className={cn("text-xs truncate", player.isLegend ? "text-[#5d4d30]" : "text-white/30")}>{player.clan || (player.isLegend ? "?" : "")}</span>}
        <div className="flex items-center gap-2 ml-auto">
          <span className={cn("font-bold text-sm", style.tierColor)}>{playerTier}</span>
          <span className={cn("text-sm font-mono", player.isLegend ? "text-[#5d4d30]" : "text-white/60")}>{player.averageRating.toFixed(1)}</span>
        </div>
      </div>
    </button>
  )
}
