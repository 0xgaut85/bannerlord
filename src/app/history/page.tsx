"use client"

import { useState, useEffect } from "react"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"

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

type Category = "INFANTRY" | "CAVALRY" | "ARCHER" | "ALL"

export default function HistoryPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetails | null>(null)
  const [category, setCategory] = useState<Category>("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPeriod, setLoadingPeriod] = useState(false)

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
                      {filteredRankings.map((ranking) => (
                        <div
                          key={ranking.id}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
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
                          <div className="flex-1">
                            <div className="text-white font-medium">{ranking.playerName}</div>
                            <div className="text-white/40 text-sm">
                              {ranking.category} · {ranking.clan || "FA"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold text-lg">
                              {ranking.averageRating.toFixed(1)}
                            </div>
                            <div className="text-white/40 text-xs">
                              {ranking.totalRatings} ratings
                            </div>
                          </div>
                        </div>
                      ))}
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
    </div>
  )
}


