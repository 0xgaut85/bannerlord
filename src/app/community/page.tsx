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
    // ICON - Dark Platinum/Diamond
    bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    border: "border-slate-400/50",
    accent: "from-cyan-400 via-white to-cyan-400",
    text: "text-white",
    subtext: "text-cyan-100",
    overlay: "mix-blend-overlay opacity-30",
    noiseOpacity: "0.15",
    // Intricate geometric pattern for high tier
    pattern: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%), 
              repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px),
              repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)`,
  }
  if (rating >= 90) return {
    // LEGEND - Deep Rich Gold
    bg: "bg-gradient-to-br from-yellow-900 via-amber-700 to-yellow-900",
    border: "border-amber-400/50",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-50",
    subtext: "text-amber-200",
    overlay: "mix-blend-overlay opacity-20",
    noiseOpacity: "0.12",
    pattern: `radial-gradient(circle at 50% 0%, rgba(255,215,0,0.2) 0%, transparent 70%),
              repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 12px)`,
  }
  if (rating >= 85) return {
    // GOLD - Metallic Gold
    bg: "bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600",
    border: "border-yellow-300/50",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-white",
    subtext: "text-yellow-50",
    overlay: "mix-blend-overlay opacity-10",
    noiseOpacity: "0.10",
    pattern: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)`,
  }
  if (rating >= 80) return {
    // SILVER - Clean Metallic
    bg: "bg-gradient-to-br from-slate-400 via-slate-300 to-slate-400",
    border: "border-slate-200/50",
    accent: "from-white via-slate-100 to-white",
    text: "text-slate-900",
    subtext: "text-slate-700",
    overlay: "mix-blend-overlay opacity-10",
    noiseOpacity: "0.08",
    pattern: `linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)`,
  }
  if (rating >= 75) return {
    // SILVER (Lower) - Slightly darker
    bg: "bg-gradient-to-br from-slate-500 via-slate-400 to-slate-500",
    border: "border-slate-300/50",
    accent: "from-slate-200 via-white to-slate-200",
    text: "text-slate-900",
    subtext: "text-slate-800",
    overlay: "mix-blend-overlay opacity-10",
    noiseOpacity: "0.10",
    pattern: `linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)`,
  }
  if (rating >= 70) return {
    // BRONZE - Deep reddish
    bg: "bg-gradient-to-br from-orange-800 via-orange-700 to-amber-900",
    border: "border-orange-400/40",
    accent: "from-orange-300 via-orange-200 to-orange-300",
    text: "text-orange-50",
    subtext: "text-orange-200",
    overlay: "mix-blend-overlay opacity-15",
    noiseOpacity: "0.12",
    pattern: `radial-gradient(circle at 100% 100%, rgba(0,0,0,0.2) 0%, transparent 50%)`,
  }
  if (rating >= 65) return {
    // BRONZE (Lower)
    bg: "bg-gradient-to-br from-orange-900 via-orange-800 to-amber-950",
    border: "border-orange-500/30",
    accent: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-100",
    subtext: "text-orange-300",
    overlay: "mix-blend-overlay opacity-20",
    noiseOpacity: "0.15",
    pattern: `radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
  }
  // WOOD/COMMON - Dark, textured
  return {
    bg: "bg-[#2a231d]",
    border: "border-[#5c4d3c]",
    accent: "from-[#8b7355] via-[#a68a6d] to-[#8b7355]",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
    overlay: "mix-blend-overlay opacity-40",
    noiseOpacity: "0.30", // Heavy grain for wood
    pattern: `repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px),
              linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)`,
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
      {/* FIFA Card - Premium Design */}
      <div className={`relative w-48 sm:w-56 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border}`}>
        {/* Background Base */}
        <div className={`absolute inset-0 ${style.bg}`} />
        
        {/* Texture Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: style.pattern }}
        />
        
        {/* Heavy Noise Texture (SVG) */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${style.noiseOpacity}'/%3E%3C/svg%3E")`,
            opacity: 1,
          }}
        />

        {/* Inner Border (Dashed) */}
        <div className="absolute inset-3 border border-dashed border-white/20 rounded-2xl pointer-events-none z-10" />
        
        {/* Shine Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-20" />

        {/* Content Container */}
        <div className="relative h-full flex flex-col p-4 z-30">
          
          {/* Top Section: Rating & Position Left, Name Right */}
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
              <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md truncate`}>
                {player.name}
              </h2>
            </div>
          </div>

          {/* Middle Section: Avatar & Flag */}
          <div className="flex-1 relative flex items-center justify-center my-1">
            {/* Background Glow behind avatar */}
            <div className={`absolute inset-0 bg-gradient-to-t ${style.accent} opacity-20 blur-xl rounded-full transform scale-75`} />
            
            {/* Player Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/20">
              <Image
                src={avatarSrc}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Country Flag - Larger now */}
            <div className="absolute -bottom-1 -right-1 transform rotate-3 shadow-xl hover:rotate-0 transition-transform duration-300">
              <div className="relative w-10 h-7 rounded overflow-hidden border-2 border-white/20">
                <Flag code={player.nationality} size="lg" className="w-full h-full object-cover scale-150" />
              </div>
            </div>
          </div>

          {/* Bottom Section: Division & Clan */}
          <div className="mt-auto pt-3">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-2 rounded-full opacity-50`} />
            
            <div className="flex justify-between items-end">
              {/* Division */}
              <div className="flex flex-col">
                <span className={`text-[8px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>
                  Division
                </span>
                <span className={`text-sm font-black ${style.text} drop-shadow-sm`}>
                  {player.division || "-"}
                </span>
              </div>

              {/* Clan Badge */}
              {player.clan && (
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-lg">
                  <span className={`text-[10px] font-bold ${style.text} tracking-wide`}>
                    {player.clan}
                  </span>
                </div>
              )}
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
