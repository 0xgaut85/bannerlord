"use client"

import { Player } from "@prisma/client"
import { Button, Slider, Flag } from "@/components/ui"
import Image from "next/image"

interface FifaCardProps {
  player: Player & { avatar?: string | null }
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

// Rating-based card styles
function getCardStyle(rating: number) {
  if (rating >= 95) return {
    frame: "bg-gradient-to-b from-slate-200 via-white to-slate-300",
    inner: "bg-gradient-to-br from-white via-slate-50 to-slate-200",
    accent: "from-slate-400 to-slate-200",
    text: "text-slate-900",
    subtext: "text-slate-600",
    label: "ICON",
    labelBg: "bg-slate-800",
  }
  if (rating >= 90) return {
    frame: "bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400",
    inner: "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200",
    accent: "from-amber-500 to-yellow-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "LEGEND",
    labelBg: "bg-amber-800",
  }
  if (rating >= 85) return {
    frame: "bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600",
    inner: "bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300",
    accent: "from-amber-600 to-amber-400",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "GOLD",
    labelBg: "bg-amber-700",
  }
  if (rating >= 80) return {
    frame: "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400",
    inner: "bg-gradient-to-br from-gray-100 via-white to-gray-200",
    accent: "from-gray-500 to-gray-300",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
  }
  if (rating >= 75) return {
    frame: "bg-gradient-to-b from-gray-400 via-gray-300 to-gray-500",
    inner: "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300",
    accent: "from-gray-500 to-gray-400",
    text: "text-gray-900",
    subtext: "text-gray-600",
    label: "SILVER",
    labelBg: "bg-gray-600",
  }
  if (rating >= 70) return {
    frame: "bg-gradient-to-b from-orange-400 via-orange-300 to-orange-500",
    inner: "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200",
    accent: "from-orange-600 to-orange-400",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-700",
  }
  if (rating >= 65) return {
    frame: "bg-gradient-to-b from-orange-600 via-orange-500 to-orange-700",
    inner: "bg-gradient-to-br from-orange-200 via-orange-100 to-orange-300",
    accent: "from-orange-700 to-orange-500",
    text: "text-orange-900",
    subtext: "text-orange-700",
    label: "BRONZE",
    labelBg: "bg-orange-800",
  }
  return {
    frame: "bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800",
    inner: "bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400",
    accent: "from-amber-800 to-amber-600",
    text: "text-amber-900",
    subtext: "text-amber-700",
    label: "COMMON",
    labelBg: "bg-amber-900",
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
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
  
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-white/60 text-sm font-medium tracking-wider">
          {currentIndex + 1} / {totalPlayers}
        </span>
      </div>
      
      {/* FIFA Card - Premium Design */}
      <div className={`relative w-60 sm:w-72 aspect-[2.5/4] rounded-2xl overflow-hidden shadow-2xl ${style.frame}`}>
        {/* Outer frame border effect */}
        <div className="absolute inset-[3px] rounded-xl overflow-hidden">
          {/* Inner card background */}
          <div className={`absolute inset-0 ${style.inner}`} />
          
          {/* Decorative lines */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent}`} />
          
          {/* Noise texture */}
          <div 
            className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Top section - Rating and Category */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Rating */}
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-black ${style.text} leading-none`}>
                {currentRating}
              </span>
              <span className={`text-[10px] font-bold ${style.subtext} tracking-wider mt-0.5`}>
                {categoryShort[player.category]}
              </span>
            </div>
            
            {/* Card type badge */}
            <div className={`${style.labelBg} px-2 py-0.5 rounded text-white text-[10px] font-bold tracking-wider`}>
              {style.label}
            </div>
          </div>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            {/* Player avatar or flag */}
            <div className="relative mb-3">
              {player.avatar ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg ring-2 ring-white/30">
                  <Image
                    src={player.avatar}
                    alt={player.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg ring-2 ring-white/30 bg-black/10 flex items-center justify-center">
                  <Flag code={player.nationality} size="xl" className="scale-125" />
                </div>
              )}
              
              {/* Small flag badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                <Flag code={player.nationality} size="sm" />
              </div>
            </div>
            
            {/* Player name */}
            <h2 className={`text-lg sm:text-xl font-black ${style.text} text-center uppercase tracking-wide px-4`}>
              {player.name}
            </h2>
            
            {/* Clan badge */}
            {player.clan && (
              <div className={`mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${style.accent}`}>
                <span className="text-white text-xs font-bold tracking-wider">
                  {player.clan}
                </span>
              </div>
            )}
          </div>
          
          {/* Bottom stats bar */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className={`flex justify-center gap-4 text-[10px] font-bold ${style.subtext}`}>
              <div className="flex items-center gap-1">
                <span className="opacity-60">DIV</span>
                <span>{player.division || "-"}</span>
              </div>
              <div className="w-px h-3 bg-current opacity-30" />
              <div className="flex items-center gap-1">
                <span className="opacity-60">CAT</span>
                <span>{player.category}</span>
              </div>
            </div>
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
