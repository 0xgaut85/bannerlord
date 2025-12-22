"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface StatsData {
  totalPlayers: number
  totalRatings: number
  totalVoters: number
  byCategory: {
    INFANTRY: { count: number; avgRating: number }
    CAVALRY: { count: number; avgRating: number }
    ARCHER: { count: number; avgRating: number }
  }
  byDivision: Record<string, { count: number; avgRating: number }>
  topClans: { name: string; count: number; avgRating: number }[]
  topNationalities: { code: string; count: number; avgRating: number }[]
  ratingDistribution: { range: string; count: number }[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white/50">Failed to load statistics</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Analytics
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Community Statistics
          </h1>
          <p className="text-white/50">
            Insights and data from the ranking system
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-6 border border-amber-500/30">
            <p className="text-amber-400 text-sm uppercase tracking-wider mb-2">Total Players</p>
            <p className="text-4xl font-bold text-white">{stats.totalPlayers}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
            <p className="text-blue-400 text-sm uppercase tracking-wider mb-2">Total Ratings</p>
            <p className="text-4xl font-bold text-white">{stats.totalRatings}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/30">
            <p className="text-green-400 text-sm uppercase tracking-wider mb-2">Active Voters</p>
            <p className="text-4xl font-bold text-white">{stats.totalVoters}</p>
          </div>
        </div>

        {/* Class Statistics */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Class Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.byCategory).map(([category, data]) => (
              <div key={category} className="bg-black/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">{category}</span>
                  <span className="text-amber-400 font-bold">{data.count} players</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-white/50 text-sm">Avg Rating</span>
                  <span className="text-2xl font-bold text-white">{data.avgRating.toFixed(1)}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      category === "INFANTRY" ? "bg-red-500" :
                      category === "CAVALRY" ? "bg-blue-500" : "bg-green-500"
                    )}
                    style={{ width: `${(data.avgRating / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Rating Distribution</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.ratingDistribution.map((bucket) => {
              const maxCount = Math.max(...stats.ratingDistribution.map(b => b.count))
              const height = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0
              return (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all"
                    style={{ height: `${height}%`, minHeight: bucket.count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-white/50 whitespace-nowrap">{bucket.range}</span>
                  <span className="text-xs text-white/70">{bucket.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Clans */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Top Clans by Rating</h2>
            <div className="space-y-3">
              {stats.topClans.slice(0, 10).map((clan, idx) => (
                <div key={clan.name} className="flex items-center gap-4 bg-black/20 rounded-lg p-3">
                  <span className={cn(
                    "w-6 text-center font-bold",
                    idx === 0 ? "text-amber-400" :
                    idx === 1 ? "text-slate-300" :
                    idx === 2 ? "text-amber-600" : "text-white/40"
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-white font-medium">{clan.name}</span>
                    <span className="text-white/40 text-sm ml-2">({clan.count} players)</span>
                  </div>
                  <span className="text-amber-400 font-bold">{clan.avgRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Nations */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Top Nations by Rating</h2>
            <div className="space-y-3">
              {stats.topNationalities.slice(0, 10).map((nation, idx) => (
                <div key={nation.code} className="flex items-center gap-4 bg-black/20 rounded-lg p-3">
                  <span className={cn(
                    "w-6 text-center font-bold",
                    idx === 0 ? "text-amber-400" :
                    idx === 1 ? "text-slate-300" :
                    idx === 2 ? "text-amber-600" : "text-white/40"
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-white font-medium uppercase">{nation.code || "Unknown"}</span>
                    <span className="text-white/40 text-sm">({nation.count} players)</span>
                  </div>
                  <span className="text-amber-400 font-bold">{nation.avgRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Division Stats */}
        {Object.keys(stats.byDivision).length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-6">Division Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.byDivision).sort((a, b) => a[0].localeCompare(b[0])).map(([div, data]) => (
                <div key={div} className="bg-black/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">Div {div}</div>
                  <div className="text-white text-lg font-semibold">{data.count}</div>
                  <div className="text-white/50 text-sm">players</div>
                  <div className="text-white/70 text-sm mt-2">Avg: {data.avgRating.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

