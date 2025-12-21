"use client"

import { Player } from "@prisma/client"
import { Button, Slider } from "@/components/ui"
import { getFlagEmoji } from "@/lib/utils"

interface FifaCardProps {
  player: Player
  currentRating: number
  onRatingChange: (rating: number) => void
  onSkip: () => void
  onValidate: () => void
  onPrevious?: () => void
  hasPrevious: boolean
  currentIndex: number
  totalPlayers: number
}

const categoryIcons: Record<string, string> = {
  INFANTRY: "⚔️",
  CAVALRY: "🐎",
  ARCHER: "🏹",
}

// Rating-based card colors
function getRatingGradient(rating: number): { gradient: string; shine: boolean } {
  if (rating >= 95) return { gradient: "from-gray-200 via-white to-gray-100", shine: true } // Bright marble
  if (rating >= 90) return { gradient: "from-amber-400 via-yellow-300 to-amber-300", shine: true } // Bright gold
  if (rating >= 85) return { gradient: "from-amber-600 via-amber-500 to-yellow-500", shine: false } // Normal gold
  if (rating >= 80) return { gradient: "from-gray-300 via-gray-200 to-white", shine: true } // Bright silver
  if (rating >= 75) return { gradient: "from-gray-400 via-gray-300 to-gray-200", shine: false } // Normal silver
  if (rating >= 70) return { gradient: "from-orange-500 via-orange-400 to-amber-400", shine: true } // Bright bronze
  if (rating >= 65) return { gradient: "from-orange-700 via-orange-600 to-orange-500", shine: false } // Normal bronze
  if (rating >= 60) return { gradient: "from-amber-800 via-amber-700 to-yellow-700", shine: true } // Bright wood
  return { gradient: "from-amber-900 via-amber-800 to-amber-700", shine: false } // Normal wood
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
}: FifaCardProps) {
  const flag = player.nationality 
    ? getFlagEmoji(player.nationality) 
    : "🇪🇺"
  
  const icon = categoryIcons[player.category] || "⚔️"
  const { gradient, shine } = getRatingGradient(currentRating)
  
  // Text color based on background brightness
  const isLightBg = currentRating >= 95 || currentRating >= 80 && currentRating < 85
  const textColor = isLightBg ? "text-gray-900" : "text-white"
  const subTextColor = isLightBg ? "text-gray-600" : "text-white/70"
  
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-white/60 text-sm font-medium tracking-wider">
          {currentIndex + 1} / {totalPlayers}
        </span>
      </div>
      
      {/* FIFA Card */}
      <div className={`relative w-56 sm:w-64 aspect-[3/4] bg-gradient-to-b ${gradient} rounded-2xl shadow-2xl overflow-hidden ${shine ? "ring-2 ring-white/50" : ""}`}>
        {/* Shine effect for bright cards */}
        {shine && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        )}
        
        {/* Card pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${isLightBg ? "bg-black/20" : "bg-black/30"} backdrop-blur-sm rounded-lg px-3 py-1`}>
            <div className={`text-3xl font-black ${textColor} drop-shadow-lg`}>
              {currentRating}
            </div>
          </div>
        </div>
        
        {/* Category Icon */}
        <div className="absolute top-3 right-3">
          <div className="text-3xl drop-shadow-lg">
            {icon}
          </div>
        </div>
        
        {/* Player Info - Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-12">
          {/* Flag */}
          <div className="text-5xl mb-2 drop-shadow-lg">
            {flag}
          </div>
          
          {/* Name */}
          <h2 className={`text-xl sm:text-2xl font-black ${textColor} text-center drop-shadow-lg uppercase tracking-wide mb-1`}>
            {player.name}
          </h2>
          
          {/* Clan */}
          {player.clan && (
            <div className={`${isLightBg ? "bg-black/10" : "bg-black/30"} backdrop-blur-sm rounded-full px-3 py-1 mt-1`}>
              <span className={`${subTextColor} font-semibold text-xs tracking-wider`}>
                {player.clan}
              </span>
            </div>
          )}
        </div>
        
        {/* Category Label - Bottom */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className={`${isLightBg ? "bg-black/20" : "bg-black/40"} backdrop-blur-sm rounded-lg px-3 py-1`}>
            <span className={`${textColor} font-bold text-xs uppercase tracking-widest`}>
              {player.category}
            </span>
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
          ← Back
        </Button>
        
        <Button
          variant="primary"
          onClick={onValidate}
          className="flex-1 !bg-green-500 !text-white hover:!bg-green-400 font-semibold !py-2"
        >
          ✓ Validate
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex-1 !bg-white/10 !text-white hover:!bg-white/20 !py-2"
        >
          Skip →
        </Button>
      </div>
    </div>
  )
}
