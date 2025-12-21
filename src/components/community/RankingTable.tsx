"use client"

import { PlayerWithRating } from "@/types"
import { Card, Badge } from "@/components/ui"
import { cn } from "@/lib/utils"

interface RankingTableProps {
  players: PlayerWithRating[]
  isLoading?: boolean
}

export function RankingTable({ players, isLoading }: RankingTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="h-16 glass rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    )
  }
  
  if (players.length === 0) {
    return (
      <div className="text-center py-16 text-[#8a8a8a]">
        <p className="font-display text-xl">No players found</p>
        <p className="text-sm mt-2">Check back later</p>
      </div>
    )
  }
  
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="font-display text-2xl font-semibold text-[#c9a962]">1st</span>
      case 2:
        return <span className="font-display text-2xl font-semibold text-[#8a8a8a]">2nd</span>
      case 3:
        return <span className="font-display text-2xl font-semibold text-[#a67c52]">3rd</span>
      default:
        return <span className="text-lg font-medium text-[#8a8a8a]">{rank}</span>
    }
  }
  
  const getCardVariant = (rank: number): "default" | "gold" | "silver" | "bronze" => {
    switch (rank) {
      case 1: return "gold"
      case 2: return "silver"
      case 3: return "bronze"
      default: return "default"
    }
  }
  
  return (
    <div className="space-y-3">
      {players.map((player) => (
        <Card 
          key={player.id} 
          variant={getCardVariant(player.rank || 0)}
          className={cn(
            "flex items-center gap-4 p-4 hover-lift",
            player.rank && player.rank <= 3 && "py-5"
          )}
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-16">
            {getRankDisplay(player.rank || 0)}
          </div>
          
          {/* Name */}
          <div className="flex-1">
            <h3 className={cn(
              "font-medium",
              player.rank === 1 && "text-lg text-[#a68b47]",
              player.rank === 2 && "text-lg text-[#5a5a5a]",
              player.rank === 3 && "text-lg text-[#8b5a2b]",
              (!player.rank || player.rank > 3) && "text-[#1a1a1a]"
            )}>
              {player.name}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {player.nationality}
            </p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-4">
            <Badge variant={player.rank && player.rank <= 3 
              ? (["gold", "silver", "bronze"] as const)[player.rank - 1] 
              : "default"
            }>
              {player.totalRatings} votes
            </Badge>
            <div className={cn(
              "font-display text-3xl font-semibold min-w-[70px] text-right",
              player.rank === 1 && "text-[#c9a962]",
              player.rank === 2 && "text-[#5a5a5a]",
              player.rank === 3 && "text-[#a67c52]",
              (!player.rank || player.rank > 3) && "text-[#1a1a1a]"
            )}>
              {player.averageRating > 0 ? player.averageRating.toFixed(1) : "—"}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
