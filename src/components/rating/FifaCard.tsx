"use client"

import { Player } from "@prisma/client"
import { Button, Slider, Flag } from "@/components/ui"

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
  isSaving?: boolean
}

// Rating-based card colors with grain texture
function getRatingStyle(rating: number) {
  if (rating >= 95) return { 
    gradient: "from-gray-100 via-white to-gray-200", 
    shine: true,
    grainOpacity: "0.15",
    label: "MARBLE"
  }
  if (rating >= 90) return { 
    gradient: "from-amber-400 via-yellow-300 to-amber-400", 
    shine: true,
    grainOpacity: "0.12",
    label: "GOLD"
  }
  if (rating >= 85) return { 
    gradient: "from-amber-600 via-amber-500 to-amber-600", 
    shine: false,
    grainOpacity: "0.18",
    label: "GOLD"
  }
  if (rating >= 80) return { 
    gradient: "from-gray-200 via-gray-100 to-gray-300", 
    shine: true,
    grainOpacity: "0.12",
    label: "SILVER"
  }
  if (rating >= 75) return { 
    gradient: "from-gray-400 via-gray-300 to-gray-400", 
    shine: false,
    grainOpacity: "0.15",
    label: "SILVER"
  }
  if (rating >= 70) return { 
    gradient: "from-orange-500 via-orange-400 to-orange-500", 
    shine: true,
    grainOpacity: "0.15",
    label: "BRONZE"
  }
  if (rating >= 65) return { 
    gradient: "from-orange-700 via-orange-600 to-orange-700", 
    shine: false,
    grainOpacity: "0.2",
    label: "BRONZE"
  }
  if (rating >= 60) return { 
    gradient: "from-amber-700 via-amber-600 to-amber-700", 
    shine: true,
    grainOpacity: "0.25",
    label: "WOOD"
  }
  return { 
    gradient: "from-amber-900 via-amber-800 to-amber-900", 
    shine: false,
    grainOpacity: "0.3",
    label: "WOOD"
  }
}

const categoryLabels: Record<string, string> = {
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
  const style = getRatingStyle(currentRating)
  
  // Text color based on background brightness
  const isLightBg = currentRating >= 95 || (currentRating >= 80 && currentRating < 85) || (currentRating >= 75 && currentRating < 80)
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
      <div className={`relative w-56 sm:w-64 aspect-[3/4] bg-gradient-to-b ${style.gradient} rounded-2xl shadow-2xl overflow-hidden ${style.shine ? "ring-2 ring-white/50" : ""}`}>
        {/* Grain/Noise texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: style.grainOpacity,
            mixBlendMode: "overlay",
          }}
        />
        
        {/* Shine effect for bright cards */}
        {style.shine && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
        )}
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
        
        {/* Category Label */}
        <div className="absolute top-3 right-3">
          <div className={`${isLightBg ? "bg-black/20" : "bg-black/30"} backdrop-blur-sm rounded-lg px-2 py-1`}>
            <span className={`text-sm font-bold ${textColor}`}>
              {categoryLabels[player.category] || "INF"}
            </span>
          </div>
        </div>
        
        {/* Player Info - Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-10">
          {/* Flag */}
          <div className="mb-3 drop-shadow-lg">
            <Flag code={player.nationality} size="xl" className="rounded shadow-md" />
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
        
        {/* Card Type Label - Bottom */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className={`${isLightBg ? "bg-black/20" : "bg-black/40"} backdrop-blur-sm rounded-lg px-3 py-1`}>
            <span className={`${textColor} font-bold text-xs uppercase tracking-widest`}>
              {style.label}
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
          Back
        </Button>
        
        <Button
          variant="primary"
          onClick={onValidate}
          disabled={isSaving}
          className="flex-1 !bg-green-500 !text-white hover:!bg-green-400 font-semibold !py-2 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Validate"}
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
