"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

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
  topClans: { name: string; shortName: string; logo: string | null; count: number; avgRating: number }[]
  topNationalities: { code: string; count: number; avgRating: number }[]
  ratingDistribution: { range: string; count: number }[]
}

// Colors for the pie chart
const PIE_COLORS = [
  "#6b7280", // 50-59 gray
  "#a16207", // 60-69 brown
  "#ea580c", // 70-79 orange
  "#a3a3a3", // 80-84 silver
  "#eab308", // 85-89 gold
  "#f59e0b", // 90-94 bright gold
  "#06b6d4", // 95-99 cyan (icon)
]

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

        {/* Rating Distribution - Pie Chart */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Rating Distribution</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ratingDistribution.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="range"
                  >
                    {stats.ratingDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="rgba(0,0,0,0.3)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [`${value} players`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {stats.ratingDistribution.map((bucket, idx) => (
                <div key={bucket.range} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-white/70 text-sm">{bucket.range}</span>
                  <span className="text-white font-semibold ml-auto">{bucket.count}</span>
                </div>
              ))}
            </div>
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
                  {/* Clan Logo */}
                  <div className="w-8 h-8 bg-black rounded overflow-hidden flex-shrink-0">
                    {clan.logo ? (
                      <Image 
                        src={clan.logo} 
                        alt={clan.name} 
                        width={32} 
                        height={32} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium truncate block">{clan.name}</span>
                    <span className="text-white/40 text-xs">{clan.count} players</span>
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
                  {/* Country Flag */}
                  <Flag code={nation.code} size="md" />
                  <div className="flex-1">
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

