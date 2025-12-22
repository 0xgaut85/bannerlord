"use client"

import { Player } from "@prisma/client"
import { Button, Slider, Flag } from "@/components/ui"
import Image from "next/image"
import { cleanPlayerName } from "@/lib/utils"

interface FifaCardProps {
  player: Player & { avatar?: string | null; division?: string | null; clanLogo?: string | null; bio?: string | null; isLegend?: boolean }
  currentRating: number
  onRatingChange: (rating: number) => void
  onSkip: () => void
  onValidate: () => void
  onPrevious?: () => void
  hasPrevious: boolean
  currentIndex: number
  totalPlayers: number
  isSaving?: boolean
  minRating?: number
  maxRating?: number
}

// Legend card style - old school marble/cream with heavy grain
const LEGEND_STYLE = {
  bg: "linear-gradient(145deg, #e8dcc8 0%, #d4c4a8 15%, #f0e6d2 30%, #c8b898 50%, #e0d4c0 70%, #d8c8a8 85%, #f4ead6 100%)",
  border: "border-[#c0a878]",
  accent: "from-[#a08050] via-[#d0c0a0] to-[#a08050]",
  text: "text-[#3d3020]",
  subtext: "text-[#5d4d30]",
  noiseOpacity: 0.65, // Very heavy grain for old school look
  overlayGradient: "linear-gradient(180deg, rgba(255,245,230,0.4) 0%, transparent 30%, rgba(180,160,120,0.2) 70%, rgba(160,140,100,0.3) 100%)",
  shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,240,200,0.3) 40%, rgba(255,245,220,0.5) 50%, rgba(255,240,200,0.3) 60%, transparent 80%)",
}

// AAA+ Premium card styles with heavy textures
function getCardStyle(rating: number, isLegend?: boolean) {
  // Legends always get the fixed white/marble style
  if (isLegend) return LEGEND_STYLE
  
  if (rating >= 95) return {
    // ICON - Obsidian Diamond with aurora undertones
    bg: "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)",
    border: "border-cyan-300/60",
    accent: "from-cyan-300 via-white to-cyan-300",
    text: "text-white",
    subtext: "text-cyan-200",
    noiseOpacity: 0.35,
    overlayGradient: "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, transparent 40%, rgba(6,182,212,0.05) 100%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)",
  }
  if (rating >= 90) return {
    // LEGEND - Deep molten gold with ember core
    bg: "linear-gradient(145deg, #1a0f00 0%, #3d2200 20%, #5c3a00 40%, #4a2c00 60%, #2d1800 80%, #1a0f00 100%)",
    border: "border-amber-400/60",
    accent: "from-amber-300 via-yellow-200 to-amber-300",
    text: "text-amber-50",
    subtext: "text-amber-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(255,193,7,0.15) 0%, transparent 50%, rgba(255,152,0,0.1) 100%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,215,0,0.1) 40%, rgba(255,215,0,0.2) 50%, rgba(255,215,0,0.1) 60%, transparent 80%)",
  }
  if (rating >= 85) return {
    // GOLD - Burnished gold with depth
    bg: "linear-gradient(145deg, #5c4a00 0%, #8b7500 25%, #b8960a 50%, #8b7500 75%, #5c4a00 100%)",
    border: "border-yellow-400/50",
    accent: "from-yellow-200 via-white to-yellow-200",
    text: "text-white",
    subtext: "text-yellow-100",
    noiseOpacity: 0.25,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,215,0,0.1) 100%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)",
  }
  if (rating >= 80) return {
    // SILVER - Polished steel with industrial edge
    bg: "linear-gradient(145deg, #2a2a2a 0%, #4a4a4a 25%, #6a6a6a 50%, #4a4a4a 75%, #2a2a2a 100%)",
    border: "border-slate-300/50",
    accent: "from-white via-slate-200 to-white",
    text: "text-white",
    subtext: "text-slate-200",
    noiseOpacity: 0.22,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 60%, transparent 80%)",
  }
  if (rating >= 75) return {
    // SILVER (Lower) - Weathered steel
    bg: "linear-gradient(145deg, #1f1f1f 0%, #3a3a3a 25%, #505050 50%, #3a3a3a 75%, #1f1f1f 100%)",
    border: "border-slate-400/40",
    accent: "from-slate-300 via-white to-slate-300",
    text: "text-slate-100",
    subtext: "text-slate-300",
    noiseOpacity: 0.28,
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, transparent 80%)",
  }
  if (rating >= 70) return {
    // BRONZE - Rich copper patina
    bg: "linear-gradient(145deg, #1a0800 0%, #4a1c00 25%, #6d3500 50%, #4a1c00 75%, #1a0800 100%)",
    border: "border-orange-500/50",
    accent: "from-orange-300 via-orange-200 to-orange-300",
    text: "text-orange-50",
    subtext: "text-orange-200",
    noiseOpacity: 0.30,
    overlayGradient: "linear-gradient(180deg, rgba(234,88,12,0.1) 0%, transparent 50%, rgba(194,65,12,0.08) 100%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(251,146,60,0.08) 40%, rgba(251,146,60,0.15) 50%, rgba(251,146,60,0.08) 60%, transparent 80%)",
  }
  if (rating >= 65) return {
    // BRONZE (Lower) - Aged copper
    bg: "linear-gradient(145deg, #120500 0%, #2d1000 25%, #451a00 50%, #2d1000 75%, #120500 100%)",
    border: "border-orange-600/40",
    accent: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-100",
    subtext: "text-orange-300",
    noiseOpacity: 0.32,
    overlayGradient: "linear-gradient(180deg, rgba(194,65,12,0.08) 0%, transparent 50%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(251,146,60,0.05) 40%, rgba(251,146,60,0.1) 50%, rgba(251,146,60,0.05) 60%, transparent 80%)",
  }
  // WOOD/COMMON - Dark oak with grain
  return {
    bg: "linear-gradient(145deg, #0f0a06 0%, #1f150d 25%, #2a1f15 50%, #1f150d 75%, #0f0a06 100%)",
    border: "border-[#6b5344]/50",
    accent: "from-[#a08060] via-[#c0a080] to-[#a08060]",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
    noiseOpacity: 0.45,
    overlayGradient: "linear-gradient(180deg, rgba(160,128,96,0.05) 0%, transparent 50%)",
    shimmer: "linear-gradient(110deg, transparent 20%, rgba(192,160,128,0.04) 40%, rgba(192,160,128,0.08) 50%, rgba(192,160,128,0.04) 60%, transparent 80%)",
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

// Calculate tier from rating for FIFA card display
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
  minRating = 50,
  maxRating = 99,
}: FifaCardProps) {
  const style = getCardStyle(currentRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  
  // Get tier from current rating
  const playerTier = getTierFromRating(currentRating)
  
  // Get clan logo if available
  const clanLogo = (player as any).clanLogo || null
  
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-white/60 text-sm font-medium tracking-wider">
          {currentIndex + 1} / {totalPlayers}
        </span>
      </div>
      
      {/* FIFA Card - AAA+ Premium Design */}
      <div className={`relative w-64 sm:w-72 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border}`}>
        {/* Background Base - Rich gradient */}
        <div 
          className="absolute inset-0"
          style={{ background: style.bg }}
        />
        
        {/* Overlay Gradient for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: style.overlayGradient }}
        />
        
        {/* Shimmer effect layer */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: style.shimmer }}
        />
        
        {/* Heavy Noise/Grain Texture (more intense) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        
        {/* Secondary grain layer for more texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-soft-light" style={{ opacity: style.noiseOpacity * 0.5 }}>
          <filter id="grainFilter">
            <feTurbulence type="turbulence" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainFilter)" />
        </svg>

        {/* Inner Border (Dashed) - more inset */}
        <div className="absolute inset-4 border border-dashed border-white/15 rounded-2xl pointer-events-none z-10" />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-15"
          style={{ 
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
          }}
        />

        {/* Content Container */}
        <div className="relative h-full flex flex-col p-5 z-30">
          
          {/* Top Section: Rating & Position Left, Name Right */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center -ml-1">
              <span className={`text-5xl font-black ${style.text} leading-none drop-shadow-lg`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {currentRating}
              </span>
              <span className={`text-sm font-bold ${style.subtext} tracking-widest mt-1 uppercase`}>
                {categoryShort[player.category]}
              </span>
              <div className={`h-0.5 w-8 bg-gradient-to-r ${style.accent} mt-2 rounded-full`} />
            </div>
            
            <div className="flex-1 text-right mt-1 pl-4">
              {(() => {
                const cleanName = cleanPlayerName(player.name)
                return cleanName.includes(' ') ? (
                  <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                    <span className="block">{cleanName.split(' ')[0]}</span>
                    <span className="block">{cleanName.split(' ').slice(1).join(' ')}</span>
                  </h2>
                ) : (
                  <h2 className={`text-xl sm:text-2xl font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontSize: cleanName.length > 12 ? 'clamp(0.75rem, 2vw, 1.25rem)' : undefined }}>
                  {cleanName}
                </h2>
              })()}
              {player.isLegend && (
                <p className={`text-xs ${style.subtext} uppercase tracking-widest mt-0.5`}>
                  Prime
                </p>
              )}
            </div>
          </div>

          {/* Middle Section: Avatar (moved higher) and Bio */}
          <div className="flex-1 relative flex flex-col items-center justify-start mt-1">
            {/* Background Glow behind avatar */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-gradient-to-t ${style.accent} opacity-15 blur-2xl rounded-full`} />
            
            {/* Player Avatar - 20% bigger */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/30 z-10">
              <Image
                src={avatarSrc}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Bio (below avatar) - max 50 chars, 20% bigger and bold */}
            {player.bio && (
              <p className={`text-sm font-semibold ${style.subtext} text-center mt-2 px-2 italic opacity-90 line-clamp-2`}>
                &quot;{player.bio.slice(0, 50)}{player.bio.length > 50 ? '...' : ''}&quot;
              </p>
            )}

            {/* Clan Logo (left) and Flag (right) - positioned lower */}
            <div className="absolute bottom-0 left-4 z-20">
              <div className="w-8 h-8 bg-black">
                {clanLogo && (
                  <Image
                    src={clanLogo}
                    alt="Clan"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            <div className="absolute right-4 bottom-0 z-20">
              <Flag code={player.nationality} size="lg" />
            </div>
          </div>

          {/* Bottom Section: Tier & Clan */}
          <div className="mt-auto pt-4">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-3 rounded-full opacity-40`} />
            
            <div className="flex justify-between items-end">
              {/* Tier */}
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>
                  Tier
                </span>
                <span className={`text-lg font-black ${style.text} drop-shadow-sm`}>
                  {playerTier}
                </span>
              </div>

              {/* Clan Badge */}
              {player.clan && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
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
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/50 text-xs">Allowed: {minRating}-{maxRating}</span>
          <span className="text-white/70 text-sm font-medium">Your Rating</span>
          <span className="text-white/50 text-xs">Range: 50-99</span>
        </div>
        <Slider
          value={currentRating}
          onChange={onRatingChange}
          min={50}
          max={99}
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
