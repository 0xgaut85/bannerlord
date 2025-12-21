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

// Premium card styles
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
      
      {/* FIFA Card - Premium Design */}
      <div className={`relative w-64 sm:w-72 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-4 ${style.border}`}>
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
        <div className="relative h-full flex flex-col p-5 z-30">
          
          {/* Top Section: Rating & Position Left, Name Right */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center -ml-1">
              <span className={`text-5xl font-black ${style.text} leading-none drop-shadow-lg`}>
                {currentRating}
              </span>
              <span className={`text-sm font-bold ${style.subtext} tracking-widest mt-1 uppercase`}>
                {categoryShort[player.category]}
              </span>
              <div className={`h-0.5 w-8 bg-gradient-to-r ${style.accent} mt-2 rounded-full`} />
            </div>
            
            <div className="flex-1 text-right mt-1 pl-4">
              <h2 className={`text-xl sm:text-2xl font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md truncate`}>
                {player.name}
              </h2>
            </div>
          </div>

          {/* Middle Section: Avatar & Flag */}
          <div className="flex-1 relative flex items-center justify-center my-2">
            {/* Background Glow behind avatar */}
            <div className={`absolute inset-0 bg-gradient-to-t ${style.accent} opacity-20 blur-xl rounded-full transform scale-75`} />
            
            {/* Player Avatar */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/20">
              <Image
                src={avatarSrc}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Country Flag - Larger now */}
            <div className="absolute -bottom-2 -right-2 transform rotate-3 shadow-xl hover:rotate-0 transition-transform duration-300">
              <div className="relative w-14 h-10 rounded overflow-hidden border-2 border-white/20">
                <Flag code={player.nationality} size="xl" className="w-full h-full object-cover scale-150" />
              </div>
            </div>
          </div>

          {/* Bottom Section: Division & Clan */}
          <div className="mt-auto pt-4">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-3 rounded-full opacity-50`} />
            
            <div className="flex justify-between items-end">
              {/* Division */}
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>
                  Division
                </span>
                <span className={`text-lg font-black ${style.text} drop-shadow-sm`}>
                  {player.division || "-"}
                </span>
              </div>

              {/* Clan Badge */}
              {player.clan && (
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <span className={`text-sm font-bold ${style.text} tracking-wide`}>
                    {player.clan}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating Slider */}
      <div className="w-full max-w-xs bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-2">
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
