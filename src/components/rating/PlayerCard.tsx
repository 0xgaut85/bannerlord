"use client"

import { Player } from "@prisma/client"
import { Card, Slider, Button } from "@/components/ui"
import { COUNTRY_NAMES } from "@/lib/utils"

interface PlayerCardProps {
  player: Player
  currentRating: number
  onRatingChange: (rating: number) => void
  onPrevious?: () => void
  onNext?: () => void
  onSave?: () => void
  hasPrevious: boolean
  hasNext: boolean
  currentIndex: number
  totalPlayers: number
  isModified?: boolean
}

const categoryLabels = {
  INFANTRY: "Infantry",
  CAVALRY: "Cavalry",
  ARCHER: "Archer",
}

const categoryColors = {
  INFANTRY: "bg-[#c9a962]/10 text-[#a68b47] border-[#c9a962]/30",
  CAVALRY: "bg-[#5a5a5a]/10 text-[#404040] border-[#5a5a5a]/30",
  ARCHER: "bg-[#a67c52]/10 text-[#8b5a2b] border-[#a67c52]/30",
}

export function PlayerCard({
  player,
  currentRating,
  onRatingChange,
  onPrevious,
  onNext,
  onSave,
  hasPrevious,
  hasNext,
  currentIndex,
  totalPlayers,
  isModified,
}: PlayerCardProps) {
  return (
    <Card className="max-w-lg mx-auto overflow-hidden">
      {/* Header with category */}
      <div className={`-mx-6 -mt-6 px-6 py-4 mb-6 border-b ${categoryColors[player.category]}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium tracking-wide">
            {categoryLabels[player.category]}
          </span>
          <span className="text-sm opacity-70">
            {currentIndex + 1} of {totalPlayers}
          </span>
        </div>
      </div>
      
      {/* Player Info */}
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl font-semibold text-[#1a1a1a] mb-2">
          {player.name}
        </h2>
        <p className="text-[#8a8a8a]">
          {COUNTRY_NAMES[player.nationality] || player.nationality}
        </p>
      </div>
      
      {/* Rating Slider */}
      <div className="mb-8">
        <Slider
          value={currentRating}
          onChange={onRatingChange}
          min={50}
          max={99}
          label="Your Rating"
        />
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          Previous
        </Button>
        
        {isModified && onSave && (
          <Button
            variant="primary"
            onClick={onSave}
          >
            Save Progress
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </Card>
  )
}
