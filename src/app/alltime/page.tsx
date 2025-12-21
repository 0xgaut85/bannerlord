"use client"

import { useState, useEffect } from "react"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"

interface AllTimeRanking {
  playerId: string
  playerName: string
  category: string
  clan: string | null
  nationality: string | null
  averageRating: number
  periodCount: number
  periods: string[]
  rank: number
}

type Category = "INFANTRY" | "CAVALRY" | "ARCHER" | "ALL"

export default function AllTimePage() {
  const [rankings, setRankings] = useState<AllTimeRanking[]>([])
  const [category, setCategory] = useState<Category>("ALL")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true)
      try {
        const url = category === "ALL" 
          ? "/api/rankings/alltime"
          : `/api/rankings/alltime?category=${category}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setRankings(data)
        }
      } catch (error) {
        console.error("Error fetching all-time rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRankings()
  }, [category])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Cumulative Rankings
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            All Time Rankings
          </h1>
          <p className="text-white/50">
            Average of all monthly rankings
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {(["ALL", "INFANTRY", "CAVALRY", "ARCHER"] as Category[]).map((cat) => (
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
              {cat === "ALL" ? "All Classes" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No all-time rankings yet</p>
            <p className="text-white/30 text-sm mt-2">
              All-time rankings are calculated from historical monthly data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((player) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl border transition-all",
                  player.rank <= 3 
                    ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <span className={cn(
                  "w-12 text-center font-bold text-xl",
                  player.rank === 1 ? "text-amber-400" :
                  player.rank === 2 ? "text-slate-300" :
                  player.rank === 3 ? "text-amber-600" :
                  "text-white/40"
                )}>
                  #{player.rank}
                </span>
                <Flag code={player.nationality} size="lg" />
                <div className="flex-1">
                  <div className="text-white font-semibold text-lg">{player.playerName}</div>
                  <div className="text-white/40 text-sm">
                    {player.category} · {player.clan || "FA"}
                  </div>
                  <div className="text-white/30 text-xs mt-1">
                    Ranked in {player.periodCount} period{player.periodCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-bold text-2xl",
                    player.rank <= 3 ? "text-amber-400" : "text-white"
                  )}>
                    {player.averageRating.toFixed(1)}
                  </div>
                  <div className="text-white/40 text-xs">
                    All-time avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

