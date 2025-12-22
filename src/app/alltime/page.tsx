"use client"

import { useState, useEffect } from "react"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

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
  averageRating: number
  periodCount: number
  periods: string[]
  history: HistoryPoint[]
  rank: number
}

type Category = "INFANTRY" | "CAVALRY" | "ARCHER" | "ALL"

// Generate consistent colors for players
const playerColors = [
  "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1"
]

function MiniChart({ history, color = "#f59e0b" }: { history: HistoryPoint[], color?: string }) {
  if (history.length < 2) {
    return (
      <div className="h-16 flex items-center justify-center text-white/30 text-xs">
        Need 2+ periods
      </div>
    )
  }
  
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function FullChart({ 
  players, 
  periods 
}: { 
  players: AllTimeRanking[]
  periods: string[]
}) {
  // Transform data for the chart - each period is a data point with all players
  const chartData = periods.map(period => {
    const dataPoint: any = { period }
    players.forEach(player => {
      const historyPoint = player.history.find(h => h.period === period)
      if (historyPoint) {
        dataPoint[player.playerName] = historyPoint.rating
      }
    })
    return dataPoint
  })
  
  if (periods.length < 1) {
    return (
      <div className="h-64 flex items-center justify-center text-white/30">
        No historical data yet
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="period" 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            domain={[50, 100]}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '12px'
            }}
            labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
            itemStyle={{ padding: '2px 0' }}
          />
          {players.map((player, idx) => (
            <Line
              key={player.playerId}
              type="monotone"
              dataKey={player.playerName}
              stroke={playerColors[idx % playerColors.length]}
              strokeWidth={2}
              dot={{ r: 4, fill: playerColors[idx % playerColors.length] }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AllTimePage() {
  const [rankings, setRankings] = useState<AllTimeRanking[]>([])
  const [periods, setPeriods] = useState<string[]>([])
  const [category, setCategory] = useState<Category>("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

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
          // Handle both old format (array) and new format (object with rankings and periods)
          if (Array.isArray(data)) {
            setRankings(data)
            setPeriods([])
          } else {
            setRankings(data.rankings || [])
            setPeriods(data.periods || [])
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

  // Top 15 = Chosen Three (3) + Elite Warriors (12)
  const topPlayers = rankings.slice(0, 15)
  const otherPlayers = rankings.slice(15)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Cumulative Rankings
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            All Time Rankings
          </h1>
          <p className="text-white/50">
            Average of all monthly rankings with performance trends
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
          <>
            {/* Top Players Chart - Always Visible */}
            {topPlayers.length > 0 && periods.length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Top Players Performance
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {topPlayers.slice(0, 10).map((player, idx) => (
                    <div key={player.playerId} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: playerColors[idx % playerColors.length] }}
                      />
                      <span className="text-white/70">{player.playerName}</span>
                    </div>
                  ))}
                </div>
                <FullChart players={topPlayers.slice(0, 10)} periods={periods} />
              </div>
            )}

            {/* Top 15 Players with individual charts */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                The Chosen Three & Elite Warriors
              </h2>
              <div className="space-y-3">
                {topPlayers.map((player, idx) => (
                  <div
                    key={player.playerId}
                    className={cn(
                      "p-5 rounded-2xl border transition-all",
                      player.rank <= 3 
                        ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30"
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
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
                      </div>
                      <div className="w-32">
                        <MiniChart 
                          history={player.history} 
                          color={playerColors[idx % playerColors.length]} 
                        />
                      </div>
                      <div className="text-right ml-4">
                        <div className={cn(
                          "font-bold text-2xl",
                          player.rank <= 3 ? "text-amber-400" : "text-white"
                        )}>
                          {player.averageRating.toFixed(1)}
                        </div>
                        <div className="text-white/40 text-xs">
                          {player.periodCount} period{player.periodCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Players - Chart on click */}
            {otherPlayers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  All Players
                </h2>
                <div className="space-y-2">
                  {otherPlayers.map((player, idx) => (
                    <div
                      key={player.playerId}
                      className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedPlayer(
                          expandedPlayer === player.playerId ? null : player.playerId
                        )}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                      >
                        <span className="w-10 text-center font-bold text-white/40">
                          #{player.rank}
                        </span>
                        <Flag code={player.nationality} size="md" />
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{player.playerName}</div>
                          <div className="text-white/40 text-sm">
                            {player.category} · {player.clan || "FA"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">
                            {player.averageRating.toFixed(1)}
                          </div>
                          <div className="text-white/40 text-xs">
                            {player.periodCount} period{player.periodCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-transform",
                          expandedPlayer === player.playerId ? "rotate-180" : ""
                        )}>
                          <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedPlayer === player.playerId && (
                        <div className="px-4 pb-4 border-t border-white/10">
                          <div className="pt-4">
                            <p className="text-white/50 text-sm mb-2">Rating History</p>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={player.history} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis 
                                    dataKey="period" 
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                  />
                                  <YAxis 
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      background: '#1e293b', 
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="rating" 
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ fill: '#f59e0b', r: 4 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {player.history.map((h, i) => (
                                <div key={i} className="bg-black/30 px-2 py-1 rounded text-xs text-white/60">
                                  {h.period}: <span className="text-amber-400">{h.rating}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
