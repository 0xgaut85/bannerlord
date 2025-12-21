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

// Get default avatar based on category
function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

// Rating-based card styles with texture patterns
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    frame: "bg-gradient-to-b from-slate-200 via-white to-slate-300",
    inner: "bg-gradient-to-br from-white via-slate-50 to-slate-200",
    accent: "from-slate-400 to-slate-200",
    text: "text-slate-900",
    subtext: "text-slate-600",
    label: "ICON",
    labelBg: "bg-slate-800",
    grainOpacity: "0.15",
  }
  if (rating >= 90) return {
    frame: "bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400",
    inner: "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200",
    accent: "from-amber-500 to-yellow-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "LEGEND",
    labelBg: "bg-amber-800",
    grainOpacity: "0.12",
  }
  if (rating >= 85) return {
    frame: "bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600",
    inner: "bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300",
    accent: "from-amber-600 to-amber-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "GOLD",
    labelBg: "bg-amber-700",
    grainOpacity: "0.18",
  }
  if (rating >= 80) return {
    frame: "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400",
    inner: "bg-gradient-to-br from-gray-100 via-white to-gray-200",
    accent: "from-gray-500 to-gray-300",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
    grainOpacity: "0.12",
  }
  if (rating >= 75) return {
    frame: "bg-gradient-to-b from-gray-400 via-gray-300 to-gray-500",
    inner: "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300",
    accent: "from-gray-500 to-gray-400",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
    grainOpacity: "0.15",
  }
  if (rating >= 70) return {
    frame: "bg-gradient-to-b from-orange-400 via-orange-300 to-orange-500",
    inner: "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200",
    accent: "from-orange-600 to-orange-400",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-700",
    grainOpacity: "0.15",
  }
  if (rating >= 65) return {
    frame: "bg-gradient-to-b from-orange-600 via-orange-500 to-orange-700",
    inner: "bg-gradient-to-br from-orange-200 via-orange-100 to-orange-300",
    accent: "from-orange-700 to-orange-500",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-800",
    grainOpacity: "0.2",
  }
  return {
    frame: "bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800",
    inner: "bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400",
    accent: "from-amber-800 to-amber-600",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "COMMON",
    labelBg: "bg-amber-900",
    grainOpacity: "0.25",
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Reorder: 2nd, 1st, 3rd */}
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((player, idx) => {
                  const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                  return (
                    <FifaDisplayCard 
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

// FIFA-style display card for Top 3 (same design as rate page)
function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter 
}: { 
  player: PlayerWithRating
  rank: number
  isCenter: boolean
}) {
  const style = getCardStyle(player.averageRating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  
  const rankLabels = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <div className={cn(
      "flex justify-center transition-all duration-300",
      isCenter ? "md:scale-110 z-10" : ""
    )}>
      {/* FIFA Card - Taller Premium Design */}
      <div className={`relative w-48 sm:w-56 aspect-[2/3.5] rounded-2xl overflow-hidden shadow-2xl ${style.frame}`}>
        {/* Outer frame border effect */}
        <div className="absolute inset-[3px] rounded-xl overflow-hidden">
          {/* Inner card background */}
          <div className={`absolute inset-0 ${style.inner}`} />
          
          {/* Pattern texture */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 25%, rgba(0,0,0,0.05) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
          
          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              opacity: style.grainOpacity,
            }}
          />
          
          {/* Decorative lines */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          
          {/* Rank badge - top right */}
          <div className="absolute top-3 right-3">
            <div className={`${style.labelBg} px-2 py-0.5 rounded text-white text-xs font-bold tracking-wider`}>
              {rankLabels[rank as 1 | 2 | 3]}
            </div>
          </div>
          
          {/* Card type badge - below rank */}
          <div className="absolute top-10 right-3">
            <div className={`${style.labelBg} px-2 py-0.5 rounded text-white text-[10px] font-bold tracking-wider`}>
              {style.label}
            </div>
          </div>
          
          {/* Name at top left */}
          <div className="absolute top-3 left-3 right-16">
            <h2 className={`text-sm sm:text-base font-black ${style.text} uppercase tracking-wide truncate`}>
              {player.name}
            </h2>
          </div>
          
          {/* Rating and Class - below name, left side */}
          <div className="absolute top-9 left-3 flex items-end gap-2">
            <span className={`text-3xl sm:text-4xl font-black ${style.text} leading-none`}>
              {player.averageRating.toFixed(0)}
            </span>
            <span className={`text-xs font-bold ${style.subtext} mb-1`}>
              {categoryShort[player.category]}
            </span>
          </div>
          
          {/* Main content area - clan/flag on left, avatar on right */}
          <div className="absolute top-20 bottom-3 left-3 right-3 flex">
            {/* Left side - Clan logo and Flag */}
            <div className="flex flex-col items-start gap-2 w-12">
              {/* Clan logo */}
              <div className="w-10 h-10 rounded-lg bg-black/80 flex items-center justify-center overflow-hidden shadow-lg">
                {player.clan ? (
                  <span className="text-white text-[10px] font-bold text-center px-1 leading-tight">
                    {player.clan}
                  </span>
                ) : (
                  <div className="w-full h-full bg-black" />
                )}
              </div>
              
              {/* Country flag */}
              <div className="w-10 h-7 rounded overflow-hidden shadow-lg bg-white/20 flex items-center justify-center">
                <Flag code={player.nationality} size="md" />
              </div>
              
              {/* Division badge */}
              {player.division && (
                <div className={`px-1.5 py-0.5 rounded ${style.labelBg}`}>
                  <span className="text-white text-[8px] font-bold">
                    DIV {player.division}
                  </span>
                </div>
              )}
            </div>
            
            {/* Right side - Player avatar */}
            <div className="flex-1 flex items-start justify-end">
              <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/30 bg-black/10">
                <Image
                  src={avatarSrc}
                  alt={player.name}
                  width={112}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Elite player card (4-15)
function ElitePlayerCard({ player }: { player: PlayerWithRating }) {
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all">
      <div className="flex items-center gap-3">
        <div className="text-white/40 font-bold text-lg w-8">#{player.rank}</div>
        <Image src={avatarSrc} alt={player.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
        <Flag code={player.nationality} size="md" />
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
