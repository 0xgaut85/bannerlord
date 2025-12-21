"use client"

import { Player } from "@prisma/client"
import { Button, Slider } from "@/components/ui"
import { getFlagEmoji } from "@/lib/utils"

interface FifaCardProps {
  player: Player
  currentRating: number
  onRatingChange: (rating: number) => void
  onSkip: () => void
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

const categoryGradients: Record<string, string> = {
  INFANTRY: "from-amber-600 via-amber-500 to-yellow-400",
  CAVALRY: "from-slate-700 via-slate-600 to-slate-500",
  ARCHER: "from-emerald-700 via-emerald-600 to-emerald-500",
}

export function FifaCard({
  player,
  currentRating,
  onRatingChange,
  onSkip,
  onPrevious,
  hasPrevious,
  currentIndex,
  totalPlayers,
}: FifaCardProps) {
  // Get flag - use EU flag if unknown
  const flag = player.nationality 
    ? getFlagEmoji(player.nationality) 
    : "🇪🇺"
  
  const gradient = categoryGradients[player.category] || categoryGradients.INFANTRY
  const icon = categoryIcons[player.category] || "⚔️"
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-white/60 text-sm font-medium tracking-wider">
          {currentIndex + 1} / {totalPlayers}
        </span>
      </div>
      
      {/* FIFA Card */}
      <div className={`relative w-72 sm:w-80 aspect-[3/4] bg-gradient-to-b ${gradient} rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Card pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-4xl font-black text-white drop-shadow-lg">
              {currentRating}
            </div>
          </div>
        </div>
        
        {/* Category Icon */}
        <div className="absolute top-4 right-4">
          <div className="text-4xl drop-shadow-lg">
            {icon}
          </div>
        </div>
        
        {/* Player Info - Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-16">
          {/* Flag */}
          <div className="text-6xl mb-4 drop-shadow-lg">
            {flag}
          </div>
          
          {/* Name */}
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center drop-shadow-lg uppercase tracking-wide mb-2">
            {player.name}
          </h2>
          
          {/* Clan */}
          {player.clan && (
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5 mt-2">
              <span className="text-white/90 font-semibold text-sm tracking-wider">
                {player.clan}
              </span>
            </div>
          )}
        </div>
        
        {/* Category Label - Bottom */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white font-bold text-sm uppercase tracking-widest">
              {player.category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Rating Slider */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6">
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
      <div className="flex items-center gap-4 w-full max-w-sm">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex-1 !bg-white/10 !text-white hover:!bg-white/20 disabled:opacity-30"
        >
          ← Back
        </Button>
        
        <Button
          variant="primary"
          onClick={onSkip}
          className="flex-1 !bg-white !text-gray-900 hover:!bg-gray-100 font-semibold"
        >
          Skip →
        </Button>
      </div>
    </div>
  )
}

