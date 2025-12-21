"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PlayerWithRating } from "@/types"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

const categoryConfig = {
  INFANTRY: { label: "Infantry" },
  CAVALRY: { label: "Cavalry" },
  ARCHER: { label: "Archers" },
}

// Rating-based card colors
function getRatingStyle(rating: number) {
  if (rating >= 95) return { bg: "from-gray-100 via-white to-gray-200", border: "border-white", text: "text-gray-900", shine: true, grainOpacity: "0.15" }
  if (rating >= 90) return { bg: "from-amber-400 via-yellow-300 to-amber-400", border: "border-amber-300", text: "text-gray-900", shine: true, grainOpacity: "0.12" }
  if (rating >= 85) return { bg: "from-amber-600 via-amber-500 to-amber-600", border: "border-amber-400", text: "text-white", shine: false, grainOpacity: "0.18" }
  if (rating >= 80) return { bg: "from-gray-200 via-gray-100 to-gray-300", border: "border-gray-200", text: "text-gray-900", shine: true, grainOpacity: "0.12" }
  if (rating >= 75) return { bg: "from-gray-400 via-gray-300 to-gray-400", border: "border-gray-300", text: "text-gray-900", shine: false, grainOpacity: "0.15" }
  if (rating >= 70) return { bg: "from-orange-500 via-orange-400 to-orange-500", border: "border-orange-400", text: "text-white", shine: true, grainOpacity: "0.15" }
  if (rating >= 65) return { bg: "from-orange-700 via-orange-600 to-orange-700", border: "border-orange-500", text: "text-white", shine: false, grainOpacity: "0.2" }
  if (rating >= 60) return { bg: "from-amber-700 via-amber-600 to-amber-700", border: "border-amber-600", text: "text-white", shine: true, grainOpacity: "0.25" }
  return { bg: "from-amber-900 via-amber-800 to-amber-900", border: "border-amber-700", text: "text-white", shine: false, grainOpacity: "0.3" }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="text-center py-12 sm:py-16">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
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
                  ? "bg-amber-500 text-black shadow-xl"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* THE CHOSEN THREE */}
          {top3.length > 0 && (
            <section className="mb-20">
              <h2 className="text-center text-2xl font-display font-bold text-amber-400 mb-2 tracking-wider">
                THE CHOSEN THREE
              </h2>
              <p className="text-center text-white/50 mb-12 text-sm">
                The undisputed elite
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {/* Reorder: 2nd, 1st, 3rd */}
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, idx) => {
                  const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                  return (
                    <TopPlayerCard 
                      key={player.id} 
                      player={player} 
                      rank={actualRank}
                      isCenter={idx === 1}
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
                Rising Stars
              </h2>
              <p className="text-white/40 mb-6 text-sm">
                Rank #16 - #30
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {promising.map((player) => (
                  <CompactPlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          )}
          
          {/* REMAINING PLAYERS IN THIS CATEGORY */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                All {config.label}
              </h2>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {rest.map((player) => (
                    <div 
                      key={player.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm"
                    >
                      <span className="text-white/40 w-8">#{player.rank}</span>
                      <Flag code={player.nationality} size="sm" />
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

// Top 3 FIFA-style card with rating-based colors and grain texture
function TopPlayerCard({ 
  player, 
  rank, 
  isCenter 
}: { 
  player: PlayerWithRating
  rank: number
  isCenter: boolean
}) {
  const ratingStyle = getRatingStyle(player.averageRating)
  
  const rankLabels = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <div className={cn(
      "relative transition-all duration-300",
      isCenter ? "md:scale-110 z-10" : ""
    )}>
      <div className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-6",
        ratingStyle.border,
        "shadow-2xl"
      )}>
        {/* Background gradient based on rating */}
        <div className={`absolute inset-0 bg-gradient-to-b ${ratingStyle.bg}`} />
        
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: ratingStyle.grainOpacity,
            mixBlendMode: "overlay",
          }}
        />
        
        {/* Shine effect for bright cards */}
        {ratingStyle.shine && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative text-center">
          {/* Rank */}
          <div className={`text-4xl font-black mb-2 ${ratingStyle.text}`}>
            {rankLabels[rank as 1 | 2 | 3]}
          </div>
          
          {/* Rating */}
          <div className={`${ratingStyle.text === "text-gray-900" ? "bg-black/20" : "bg-black/30"} backdrop-blur-sm inline-block rounded-lg px-4 py-1 mb-4`}>
            <span className={`text-3xl font-black ${ratingStyle.text}`}>{player.averageRating.toFixed(1)}</span>
          </div>
          
          {/* Avatar or Flag */}
          <div className="flex justify-center mb-3">
            {player.avatar ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg ring-2 ring-white/30">
                <Image src={player.avatar} alt={player.name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
            ) : (
              <Flag code={player.nationality} size="xl" className="rounded shadow-md" />
            )}
          </div>
          
          {/* Name */}
          <h3 className={`text-xl font-black ${ratingStyle.text} uppercase tracking-wide mb-1`}>
            {player.name}
          </h3>
          
          {/* Clan */}
          {player.clan && (
            <p className={`${ratingStyle.text === "text-gray-900" ? "text-gray-600" : "text-white/70"} text-sm font-medium`}>{player.clan}</p>
          )}
          
          {/* Bio */}
          {player.bio && (
            <p className={`mt-3 ${ratingStyle.text === "text-gray-900" ? "text-gray-500" : "text-white/60"} text-xs italic line-clamp-2`}>
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
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all">
      <div className="flex items-center gap-3">
        <div className="text-white/40 font-bold text-lg w-8">#{player.rank}</div>
        {player.avatar ? (
          <Image src={player.avatar} alt={player.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <Flag code={player.nationality} size="lg" className="rounded" />
        )}
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
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-sm w-6">#{player.rank}</span>
        <Flag code={player.nationality} size="md" className="rounded" />
        <span className="text-white/80 text-sm truncate flex-1">{player.name}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        {player.clan && <span className="text-white/30 text-xs truncate">{player.clan}</span>}
        <span className="text-white/60 text-sm font-mono ml-auto">{player.averageRating.toFixed(1)}</span>
      </div>
    </div>
  )
}
