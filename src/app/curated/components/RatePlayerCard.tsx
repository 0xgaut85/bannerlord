"use client"

import Image from "next/image"
import { Flag } from "@/components/ui"
import { cleanPlayerName } from "@/lib/utils"
import { CuratedSession } from "../types"
import { getCuratedCardStyle, getTierFromRating, getDefaultAvatar, categoryShort } from "../utils"

interface RatePlayerCardProps {
  session: CuratedSession
  averageRating: number | null
  totalVotes: number
  maxVotes: number
}

// Big FIFA card for the rate tab - updates background based on real-time rating
export function RatePlayerCard({ session, averageRating, totalVotes, maxVotes }: RatePlayerCardProps) {
  // Use the average rating for styling, or default to 75 if no ratings yet
  const displayRating = averageRating ?? 75
  const style = getCuratedCardStyle(displayRating)
  const tier = getTierFromRating(displayRating)
  const avatarSrc = session.avatar || getDefaultAvatar(session.category)
  const clanLogo = session.clanLogo || null

  return (
    <div className={`relative w-80 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 ${style.border} transition-all duration-500`}>
      {/* Background Base - Changes based on rating */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={{ background: style.bg }}
      />
      
      {/* Overlay Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{ background: style.overlayGradient }}
      />
      
      {/* Heavy Noise/Grain Texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: style.noiseOpacity }}>
        <filter id={`noiseFilter-rate-${session.id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noiseFilter-rate-${session.id})`} />
      </svg>
      
      {/* Secondary grain layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-soft-light" style={{ opacity: style.noiseOpacity * 0.5 }}>
        <filter id={`grainFilter-rate-${session.id}`}>
          <feTurbulence type="turbulence" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grainFilter-rate-${session.id})`} />
      </svg>

      {/* Inner Border (Dashed) */}
      <div className="absolute inset-5 border border-dashed border-white/15 rounded-2xl pointer-events-none z-10" />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-15"
        style={{ 
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
        }}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col p-7 z-30">
        {/* Top Section: Rating & Votes */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-center">
            <span className={`text-6xl font-black ${style.text} drop-shadow-lg transition-colors duration-300`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {averageRating !== null ? Math.round(averageRating) : "?"}
            </span>
            <span className={`text-base font-bold ${style.subtext} uppercase mt-1`}>
              {categoryShort[session.category]}
            </span>
            <div className={`h-0.5 w-8 bg-gradient-to-r ${style.accent} mt-1.5 rounded-full`} />
          </div>
          <div className="text-right">
            <div className={`text-base ${style.subtext} font-medium`}>
              {totalVotes}/{maxVotes} votes
            </div>
            <div className={`text-lg font-black ${style.tierColor} mt-1`}>
              {tier}
            </div>
          </div>
        </div>
        
        {/* Middle Section: Avatar with Clan Logo and Flag */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          {/* Background Glow behind avatar */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-t ${style.accent} opacity-15 blur-3xl rounded-full`} />
          
          {/* Player Avatar - circular */}
          <div className={`relative w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 ${style.border} ring-4 ring-black/30 z-10`}>
            <Image
              src={avatarSrc}
              alt={session.playerName}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Clan Logo (left) and Flag (right) */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="w-8 h-8 bg-black rounded">
              {clanLogo && (
                <Image
                  src={clanLogo}
                  alt="Clan"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
          </div>
          
          <div className="absolute right-4 bottom-4 z-20">
            <Flag code={session.nationality} size="lg" />
          </div>
        </div>

        {/* Bottom Section: Player Info */}
        <div className="mt-auto pt-3">
          <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} mb-3 rounded-full opacity-40`} />
          
          <div className="text-center">
            <h2 className={`text-3xl font-black ${style.text} tracking-tight drop-shadow-lg`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {cleanPlayerName(session.playerName)}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-2">
              {session.clan && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md border border-white/10">
                  <span className={`text-sm font-bold ${style.text}`}>
                    {session.clan}
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

