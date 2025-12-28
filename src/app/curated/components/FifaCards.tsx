"use client"

import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"
import { CuratedRanking } from "../types"
import { getCuratedCardStyle, getTierFromRating, getDefaultAvatar, categoryShort } from "../utils"

// FIFA-style display card for Top 3
export function FifaDisplayCard({ 
  player, 
  rank, 
  isCenter,
  onPlayerClick
}: { 
  player: CuratedRanking
  rank: number
  isCenter: boolean
  onPlayerClick?: (id: string) => void
}) {
  const style = getCuratedCardStyle(player.rating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.rating)
  const clanLogo = player.clanLogo || null
  
  const rankLabels: Record<number, string> = { 1: "#1", 2: "#2", 3: "#3" }
  
  return (
    <button 
      onClick={() => onPlayerClick?.(player.playerId)}
      className={cn(
        "flex justify-center",
        isCenter ? "md:scale-110 z-10" : ""
      )}
    >
      {/* FIFA Card - Same layout as current ranking */}
      <div className={`relative w-48 sm:w-56 aspect-[2/3.2] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border} hover:scale-105 transition-transform`}>
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
        
        {/* Heavy Noise/Grain Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`noiseFilter-curated-${player.playerId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noiseFilter-curated-${player.playerId})`} />
        </svg>
        
        {/* Secondary grain layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-soft-light" style={{ opacity: style.noiseOpacity * 0.5 }}>
          <filter id={`grainFilter-curated-${player.playerId}`}>
            <feTurbulence type="turbulence" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grainFilter-curated-${player.playerId})`} />
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
        <div className="relative h-full flex flex-col p-4 z-30">
          
          {/* Top Section: Rating & Position Left, Name Right */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center -ml-1">
              <span className={`text-4xl font-black ${style.text} leading-none drop-shadow-lg`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {Math.round(player.rating)}
              </span>
              <span className={`text-[10px] font-bold ${style.subtext} tracking-widest mt-1 uppercase`}>
                {categoryShort[player.category]}
              </span>
              <div className={`h-0.5 w-6 bg-gradient-to-r ${style.accent} mt-1.5 rounded-full`} />
            </div>
            
            <div className="flex-1 text-right mt-1 pl-2">
              <div className={`text-xs font-bold ${style.subtext} mb-0.5 opacity-80 tracking-widest`}>
                {rankLabels[rank]}
              </div>
              <h2 className={`text-base sm:text-lg font-black ${style.text} uppercase tracking-tight leading-tight drop-shadow-md truncate`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                {cleanPlayerName(player.playerName)}
              </h2>
            </div>
          </div>

          {/* Middle Section: Avatar with Clan Logo and Flag */}
          <div className="flex-1 relative flex flex-col items-center justify-start mt-0">
            {/* Background Glow behind avatar */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-t ${style.accent} opacity-15 blur-2xl rounded-full`} />
            
            {/* Player Avatar - circular like current ranking */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/30 z-10">
              <Image
                src={avatarSrc}
                alt={player.playerName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Clan Logo (left) and Flag (right) - positioned lower */}
            <div className="absolute bottom-0 left-3 z-20">
              <div className="w-6 h-6 bg-black">
                {clanLogo && (
                  <Image
                    src={clanLogo}
                    alt="Clan"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            <div className="absolute right-3 bottom-0 z-20">
              <Flag code={player.nationality} size="md" />
            </div>
          </div>

          {/* Bottom Section: Tier & Clan */}
          <div className="mt-auto pt-3">
            <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-2 rounded-full opacity-40`} />
            
            <div className="flex justify-between items-end">
              {/* Tier */}
              <div className="flex flex-col">
                <span className={`text-[8px] font-bold ${style.subtext} opacity-60 uppercase tracking-widest`}>
                  Tier
                </span>
                <span className={`text-sm font-black ${style.text} drop-shadow-sm`}>
                  {playerTier}
                </span>
              </div>

              {/* Clan Badge */}
              {player.clan && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-lg">
                  <span className={`text-[10px] font-bold ${style.text} tracking-wide`}>
                    {player.clan}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Elite player card (ranks 4-15) - Same layout as current ranking
export function ElitePlayerCard({ 
  player, 
  onPlayerClick 
}: { 
  player: CuratedRanking
  onPlayerClick?: (id: string) => void 
}) {
  const style = getCuratedCardStyle(player.rating)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const playerTier = getTierFromRating(player.rating)
  const clanLogo = player.clanLogo || null
  
  return (
    <button onClick={() => onPlayerClick?.(player.playerId)} className="flex justify-center w-full">
      {/* Small FIFA Card */}
      <div className={`relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-3 ${style.border} hover:scale-105 transition-transform`}>
        {/* Background Base */}
        <div 
          className="absolute inset-0"
          style={{ background: style.bg }}
        />
        
        {/* Overlay Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: style.overlayGradient }}
        />
        
        {/* Noise Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
          <filter id={`eliteNoise-curated-${player.playerId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#eliteNoise-curated-${player.playerId})`} />
        </svg>

        {/* Inner Border (Dashed) */}
        <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none z-10" />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-2.5 z-30">
          {/* Top: Rating & Tier */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black ${style.text} leading-none`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {Math.round(player.rating)}
              </span>
              <span className={`text-[8px] font-bold ${style.subtext} tracking-wider uppercase`}>
                {categoryShort[player.category]}
              </span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-black ${style.text}`}>{playerTier}</div>
            </div>
          </div>

          {/* Middle: Avatar with Clan Logo and Flag */}
          <div className="flex-1 relative flex flex-col items-center justify-start py-0.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg border border-white/10 z-10">
              <Image
                src={avatarSrc}
                alt={player.playerName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Clan Logo on left */}
            <div className="absolute left-0 bottom-0 z-20">
              <div className="w-5 h-5 bg-black">
                {clanLogo && (
                  <Image
                    src={clanLogo}
                    alt="Clan"
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            {/* Flag on right */}
            <div className="absolute right-0 bottom-0 shadow-lg z-20">
              <Flag code={player.nationality} size="sm" />
            </div>
          </div>

          {/* Bottom: Name & Clan */}
          <div className="mt-auto">
            <div className={`h-px w-full bg-gradient-to-r ${style.accent} mb-1.5 opacity-40`} />
            <h3 className={`text-xs font-black ${style.text} uppercase truncate text-center`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {cleanPlayerName(player.playerName)}
            </h3>
            {player.clan && (
              <p className={`text-[9px] ${style.subtext} text-center opacity-70 truncate`}>{player.clan}</p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact player card for rest
export function CompactPlayerCard({ 
  player,
  rank,
  onPlayerClick 
}: { 
  player: CuratedRanking
  rank: number
  onPlayerClick?: (id: string) => void 
}) {
  const style = getCuratedCardStyle(player.rating)
  const tier = getTierFromRating(player.rating)
  
  return (
    <button
      onClick={() => onPlayerClick?.(player.playerId)}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:brightness-125 transition-all text-left border",
        style.border,
        style.boxBg
      )}
    >
      <span className="text-white/40 w-7 text-xs">#{rank}</span>
      <Flag code={player.nationality} size="sm" />
      <span className="text-white/90 truncate flex-1 font-medium">{cleanPlayerName(player.playerName)}</span>
      <span className={cn("font-bold text-xs", style.tierColor)}>{tier}</span>
      <span className="text-white/70 font-mono text-xs">{player.rating.toFixed(1)}</span>
    </button>
  )
}

