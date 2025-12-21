"use client"

import { useState, useEffect } from "react"
import { PlayerWithRating } from "@/types"
import { Button } from "@/components/ui"
import { getFlagEmoji, cn } from "@/lib/utils"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

const categoryConfig = {
  INFANTRY: { icon: "⚔️", label: "Infantry", gradient: "from-amber-900 via-amber-800 to-amber-700" },
  CAVALRY: { icon: "🐎", label: "Cavalry", gradient: "from-slate-800 via-slate-700 to-slate-600" },
  ARCHER: { icon: "🏹", label: "Archers", gradient: "from-emerald-900 via-emerald-800 to-emerald-700" },
}

export default function CommunityPage() {
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [players, setPlayers] = useState<PlayerWithRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/community?category=${category}`)
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
  
  const top3 = players.slice(0, 3)
  const elite = players.slice(3, 15)
  const promising = players.slice(15, 30)
  const rest = players.slice(30)
  
  const config = categoryConfig[category]
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradient}`}>
      {/* Header */}
      <div className="text-center py-12 sm:py-16">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/60 mb-4">
          Community Rankings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
          Global Rankings
        </h1>
        
        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mt-8">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all",
                category === cat
                  ? "bg-white text-gray-900 shadow-xl"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {categoryConfig[cat].icon} {categoryConfig[cat].label}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* THE CHOSEN THREE */}
          {top3.length > 0 && (
            <section className="mb-16">
              <h2 className="text-center text-2xl font-display font-bold text-amber-400 mb-2 tracking-wider">
                ✦ THE CHOSEN THREE ✦
              </h2>
              <p className="text-center text-white/50 mb-10 text-sm">
                The undisputed elite
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reorder: 2nd, 1st, 3rd */}
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, idx) => {
                  const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                  return (
                    <TopPlayerCard 
                      key={player.id} 
                      player={player} 
                      rank={actualRank}
                      isCenter={idx === 1}
                      category={category}
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
                🔥 Elite Warriors
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                Rank #4 - #15 • The feared names in battle
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {elite.map((player) => (
                  <ElitePlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          )}
          
          {/* RISING STARS */}
          {promising.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl font-display font-bold text-white/80 mb-2">
                ⭐ Rising Stars
              </h2>
              <p className="text-white/40 mb-6 text-sm">
                Rank #16 - #30 • Players on the rise
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {promising.map((player) => (
                  <CompactPlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          )}
          
          {/* THE REST */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                All Players
              </h2>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {rest.map((player) => (
                    <div 
                      key={player.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm"
                    >
                      <span className="text-white/40 w-8">#{player.rank}</span>
                      <span className="text-lg">{player.nationality ? getFlagEmoji(player.nationality) : "🇪🇺"}</span>
                      <span className="text-white/80 truncate flex-1">{player.name}</span>
                      <span className="text-white/60 font-mono">{player.averageRating.toFixed(1)}</span>
                    </div>
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

// Top 3 FIFA-style card
function TopPlayerCard({ 
  player, 
  rank, 
  isCenter,
  category 
}: { 
  player: PlayerWithRating
  rank: number
  isCenter: boolean
  category: Category
}) {
  const flag = player.nationality ? getFlagEmoji(player.nationality) : "🇪🇺"
  
  const rankStyles = {
    1: { border: "border-amber-400", glow: "shadow-amber-500/50", medal: "🥇", bg: "from-amber-600 to-yellow-500" },
    2: { border: "border-gray-300", glow: "shadow-gray-400/30", medal: "🥈", bg: "from-gray-500 to-gray-400" },
    3: { border: "border-orange-600", glow: "shadow-orange-500/30", medal: "🥉", bg: "from-orange-700 to-orange-500" },
  }
  
  const style = rankStyles[rank as 1 | 2 | 3]
  
  return (
    <div className={cn(
      "relative transition-all duration-300",
      isCenter ? "md:-mt-8 md:scale-110 z-10" : "md:mt-4"
    )}>
      <div className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-6",
        style.border,
        `shadow-2xl ${style.glow}`
      )}>
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${style.bg} opacity-90`} />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
        
        {/* Content */}
        <div className="relative text-center">
          {/* Medal */}
          <div className="text-5xl mb-2">{style.medal}</div>
          
          {/* Rating */}
          <div className="bg-black/30 backdrop-blur-sm inline-block rounded-lg px-4 py-1 mb-4">
            <span className="text-3xl font-black text-white">{player.averageRating.toFixed(1)}</span>
          </div>
          
          {/* Flag */}
          <div className="text-5xl mb-3">{flag}</div>
          
          {/* Name */}
          <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">
            {player.name}
          </h3>
          
          {/* Clan */}
          {player.clan && (
            <p className="text-white/70 text-sm font-medium">{player.clan}</p>
          )}
          
          {/* Bio */}
          {player.bio && (
            <p className="mt-3 text-white/60 text-xs italic line-clamp-2">
              &ldquo;{player.bio}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Elite player card (4-15)
function ElitePlayerCard({ player }: { player: PlayerWithRating }) {
  const flag = player.nationality ? getFlagEmoji(player.nationality) : "🇪🇺"
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all">
      <div className="flex items-center gap-3">
        <div className="text-white/40 font-bold text-lg w-8">#{player.rank}</div>
        <div className="text-3xl">{flag}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{player.name}</h3>
          {player.clan && <p className="text-white/50 text-xs">{player.clan}</p>}
        </div>
        <div className="text-xl font-bold text-white">{player.averageRating.toFixed(1)}</div>
      </div>
      {player.bio && (
        <p className="mt-2 text-white/40 text-xs italic line-clamp-1">
          &ldquo;{player.bio}&rdquo;
        </p>
      )}
    </div>
  )
}

// Compact player card (16-30)
function CompactPlayerCard({ player }: { player: PlayerWithRating }) {
  const flag = player.nationality ? getFlagEmoji(player.nationality) : "🇪🇺"
  
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-sm w-6">#{player.rank}</span>
        <span className="text-xl">{flag}</span>
        <span className="text-white/80 text-sm truncate flex-1">{player.name}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        {player.clan && <span className="text-white/30 text-xs truncate">{player.clan}</span>}
        <span className="text-white/60 text-sm font-mono ml-auto">{player.averageRating.toFixed(1)}</span>
      </div>
    </div>
  )
}
