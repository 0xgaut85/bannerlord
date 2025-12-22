"use client"

import Image from "next/image"
import { Flag } from "@/components/ui"

interface FifaDisplayCardProps {
  player: {
    id: string
    name: string
    category: string
    nationality?: string | null
    clan?: string | null
    avatar?: string | null
    clanLogo?: string | null
  }
  rating: number
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

// AAA+ Premium card styles
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    bg: "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)",
    border: "border-cyan-300/60",
    accent: "from-cyan-300 via-white to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
  }
  if (rating >= 90) return {
    bg: "linear-gradient(145deg, #1a0f00 0%, #3d2200 20%, #5c3a00 40%, #4a2c00 60%, #2d1800 80%, #1a0f00 100%)",
    border: "border-amber-400/60",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-50",
    subtext: "text-amber-200",
    noiseOpacity: 0.30,
  }
  if (rating >= 85) return {
    bg: "linear-gradient(145deg, #5c4a00 0%, #8b7500 25%, #b8960a 50%, #8b7500 75%, #5c4a00 100%)",
    border: "border-yellow-400/50",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-white",
    subtext: "text-yellow-100",
    noiseOpacity: 0.25,
  }
  if (rating >= 80) return {
    bg: "linear-gradient(145deg, #2a2a2a 0%, #4a4a4a 25%, #6a6a6a 50%, #4a4a4a 75%, #2a2a2a 100%)",
    border: "border-slate-300/50",
    accent: "from-white via-slate-200 to-white",
    text: "text-white",
    subtext: "text-slate-200",
    noiseOpacity: 0.22,
  }
  if (rating >= 75) return {
    bg: "linear-gradient(145deg, #1f1f1f 0%, #3a3a3a 25%, #505050 50%, #3a3a3a 75%, #1f1f1f 100%)",
    border: "border-slate-400/40",
    accent: "from-slate-300 via-white to-slate-300",
    text: "text-slate-100",
    subtext: "text-slate-300",
    noiseOpacity: 0.28,
  }
  if (rating >= 70) return {
    bg: "linear-gradient(145deg, #1a0800 0%, #4a1c00 25%, #6d3500 50%, #4a1c00 75%, #1a0800 100%)",
    border: "border-orange-500/50",
    accent: "from-orange-300 via-orange-200 to-orange-300",
    text: "text-orange-50",
    subtext: "text-orange-200",
    noiseOpacity: 0.30,
  }
  if (rating >= 65) return {
    bg: "linear-gradient(145deg, #120500 0%, #2d1000 25%, #451a00 50%, #2d1000 75%, #120500 100%)",
    border: "border-orange-600/40",
    accent: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-100",
    subtext: "text-orange-300",
    noiseOpacity: 0.32,
  }
  return {
    bg: "linear-gradient(145deg, #0f0a06 0%, #1f150d 25%, #2a1f15 50%, #1f150d 75%, #0f0a06 100%)",
    border: "border-[#6b5344]/50",
    accent: "from-[#a08060] via-[#c0a080] to-[#a08060]",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
    noiseOpacity: 0.45,
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

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

const sizeClasses = {
  sm: "w-32 aspect-[2/3]",
  md: "w-44 aspect-[2/3]",
  lg: "w-56 aspect-[2/3]",
}

export function FifaDisplayCard({ player, rating, size = "md", onClick }: FifaDisplayCardProps) {
  const style = getCardStyle(rating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(rating)
  
  return (
    <div 
      className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden shadow-xl border-2 ${style.border} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: style.bg }} />
      
      {/* Noise Texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
        <filter id={`noise-${player.id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise-${player.id})`} />
      </svg>
      
      {/* Inner Border */}
      <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none z-10" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col p-3 z-20">
        {/* Top: Rating & Category */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-center">
            <span className={`text-2xl font-black ${style.text} leading-none drop-shadow-lg`}>
              {Math.round(rating)}
            </span>
            <span className={`text-[10px] font-bold ${style.subtext} tracking-wider uppercase`}>
              {categoryShort[player.category]}
            </span>
          </div>
          <div className="text-right flex-1 pl-2">
            <h3 className={`text-xs font-bold ${style.text} uppercase tracking-tight truncate`}>
              {player.name}
            </h3>
          </div>
        </div>
        
        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/20">
            <Image
              src={avatarSrc}
              alt={player.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Bottom: Flag & Clan */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1">
            {player.clanLogo && (
              <div className="w-5 h-5 bg-black overflow-hidden">
                <Image src={player.clanLogo} alt="" width={20} height={20} className="object-cover" />
              </div>
            )}
            <Flag code={player.nationality} size="sm" />
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[8px] ${style.subtext} uppercase`}>Tier</span>
            <span className={`text-sm font-bold ${style.text}`}>{playerTier}</span>
          </div>
        </div>
        
        {/* Clan name */}
        {player.clan && (
          <div className="mt-1 text-center">
            <span className={`text-[10px] font-medium ${style.subtext} bg-black/30 px-2 py-0.5 rounded`}>
              {player.clan}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

