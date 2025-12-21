"use client"

import { Player } from "@prisma/client"
import { Button, Slider, Flag } from "@/components/ui"
import Image from "next/image"

interface FifaCardProps {
  player: Player & { avatar?: string | null; division?: string | null }
  currentRating: number
  onRatingChange: (rating: number) => void
  onSkip: () => void
  onValidate: () => void
  onPrevious?: () => void
  hasPrevious: boolean
  currentIndex: number
  totalPlayers: number
  isSaving?: boolean
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
    pattern: "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 1px, transparent 1px)",
  }
  if (rating >= 90) return {
    frame: "bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400",
    inner: "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200",
    accent: "from-amber-500 to-yellow-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "LEGEND",
    labelBg: "bg-amber-800",
    pattern: "radial-gradient(circle at 30% 30%, rgba(180,130,0,0.08) 1px, transparent 1px)",
  }
  if (rating >= 85) return {
    frame: "bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600",
    inner: "bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300",
    accent: "from-amber-600 to-amber-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "GOLD",
    labelBg: "bg-amber-700",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,130,0,0.1) 1px, transparent 1px)",
  }
  if (rating >= 80) return {
    frame: "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400",
    inner: "bg-gradient-to-br from-gray-100 via-white to-gray-200",
    accent: "from-gray-500 to-gray-300",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
    pattern: "radial-gradient(circle at 20% 20%, rgba(100,100,100,0.06) 1px, transparent 1px)",
  }
  if (rating >= 75) return {
    frame: "bg-gradient-to-b from-gray-400 via-gray-300 to-gray-500",
    inner: "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300",
    accent: "from-gray-500 to-gray-400",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
    pattern: "radial-gradient(circle at 20% 20%, rgba(100,100,100,0.08) 1px, transparent 1px)",
  }
  if (rating >= 70) return {
    frame: "bg-gradient-to-b from-orange-400 via-orange-300 to-orange-500",
    inner: "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200",
    accent: "from-orange-600 to-orange-400",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-700",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,100,50,0.08) 1px, transparent 1px)",
  }
  if (rating >= 65) return {
    frame: "bg-gradient-to-b from-orange-600 via-orange-500 to-orange-700",
    inner: "bg-gradient-to-br from-orange-200 via-orange-100 to-orange-300",
    accent: "from-orange-700 to-orange-500",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-800",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,100,50,0.1) 1px, transparent 1px)",
  }
  return {
    frame: "bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800",
    inner: "bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400",
    accent: "from-amber-800 to-amber-600",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "COMMON",
    labelBg: "bg-amber-900",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,130,50,0.1) 1px, transparent 1px)",
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
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

export function FifaCard({
  player,
  currentRating,
  onRatingChange,
  onSkip,
  onValidate,
  onPrevious,
  hasPrevious,
  currentIndex,
  totalPlayers,
  isSaving = false,
}: FifaCardProps) {
  const style = getCardStyle(currentRating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-white/60 text-sm font-medium tracking-wider">
          {currentIndex + 1} / {totalPlayers}
        </span>
      </div>
      
      {/* FIFA Card - Taller Premium Design */}
      <div className={`relative w-56 sm:w-64 aspect-[2/3.5] rounded-2xl overflow-hidden shadow-2xl ${style.frame}`}>
        {/* Outer frame border effect */}
        <div className="absolute inset-[3px] rounded-xl overflow-hidden">
          {/* Inner card background */}
          <div className={`absolute inset-0 ${style.inner}`} />
          
          {/* Pattern texture */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: style.pattern,
              backgroundSize: "8px 8px",
            }}
          />
          
          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Decorative lines */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          
          {/* Card type badge - top right */}
          <div className="absolute top-3 right-3">
            <div className={`${style.labelBg} px-2 py-0.5 rounded text-white text-[10px] font-bold tracking-wider`}>
              {style.label}
            </div>
          </div>
          
          {/* Name at top center */}
          <div className="absolute top-3 left-3 right-16">
            <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-wide truncate`}>
              {player.name}
            </h2>
          </div>
          
          {/* Rating and Class - below name, left side */}
          <div className="absolute top-10 left-3 flex items-end gap-2">
            <span className={`text-4xl sm:text-5xl font-black ${style.text} leading-none`}>
              {currentRating}
            </span>
            <span className={`text-sm font-bold ${style.subtext} mb-1`}>
              {categoryShort[player.category]}
            </span>
          </div>
          
          {/* Main content area - flag on left, avatar on right */}
          <div className="absolute top-24 bottom-12 left-3 right-3 flex">
            {/* Left side - Large Flag */}
            <div className="flex flex-col items-start gap-2 w-16">
              {/* Large Country flag */}
              <div className="w-16 h-12 rounded-lg shadow-xl">
                <Flag code={player.nationality} size="xl" />
              </div>
            </div>
            
            {/* Right side - Player avatar */}
            <div className="flex-1 flex items-start justify-end">
              <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/30 bg-black/10">
                <Image
                  src={avatarSrc}
                  alt={player.name}
                  width={128}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Bottom info - Division left, Clan right */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* Division badge */}
            {player.division && (
              <div className={`px-2 py-0.5 rounded ${style.labelBg}`}>
                <span className="text-white text-[10px] font-bold">
                  DIV {player.division}
                </span>
              </div>
            )}
            
            {/* Clan name */}
            {player.clan && (
              <div className={`px-2 py-0.5 rounded-lg bg-black/40`}>
                <span className="text-white text-xs font-bold">
                  {player.clan}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rating Slider */}
      <div className="w-full max-w-xs bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <Slider
          value={currentRating}
          onChange={onRatingChange}
          min={50}
          max={99}
          label="Your Rating"
          dark
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex-1 !bg-white/10 !text-white hover:!bg-white/20 disabled:opacity-30 !py-2"
        >
          Back
        </Button>
        
        <Button
          variant="primary"
          onClick={onValidate}
          disabled={isSaving}
          className="flex-1 !bg-green-500 !text-white hover:!bg-green-400 font-semibold !py-2 disabled:opacity-50"
        >
          {isSaving ? "..." : "Validate"}
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex-1 !bg-white/10 !text-white hover:!bg-white/20 !py-2"
        >
          Skip
        </Button>
      </div>
    </div>
  )
}
