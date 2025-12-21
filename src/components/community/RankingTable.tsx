"use client"

import { useState } from "react"
import { PlayerWithRating } from "@/types"
import { Button, Flag } from "@/components/ui"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface RankingTableProps {
  players: PlayerWithRating[]
  isLoading?: boolean
  dark?: boolean
  initialLimit?: number
}

// Get default avatar based on category
function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/cav.png"
    default: return "/inf.png"
  }
}

export function RankingTable({ players, isLoading, dark, initialLimit = 20 }: RankingTableProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayedPlayers = showAll ? players : players.slice(0, initialLimit)
  const hasMore = players.length > initialLimit
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-16 rounded-xl animate-pulse",
              dark ? "bg-white/5" : "bg-gray-100"
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    )
  }
  
  if (players.length === 0) {
    return (
      <div className={cn(
        "text-center py-16",
        dark ? "text-white/40" : "text-gray-500"
      )}>
        <p className="font-display text-xl">No players found</p>
        <p className="text-sm mt-2">Check back later</p>
      </div>
    )
  }
  
  const getRankStyles = (rank: number, isDark: boolean) => {
    if (rank === 1) return { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", medal: "1st" }
    if (rank === 2) return { text: isDark ? "text-gray-300" : "text-gray-600", bg: isDark ? "bg-white/5" : "bg-gray-100", border: isDark ? "border-white/10" : "border-gray-200", medal: "2nd" }
    if (rank === 3) return { text: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/30", medal: "3rd" }
    return { text: isDark ? "text-white" : "text-gray-900", bg: isDark ? "bg-white/5" : "bg-white", border: isDark ? "border-white/10" : "border-gray-200", medal: null }
  }
  
  return (
    <div className="space-y-2">
      {displayedPlayers.map((player) => {
        const styles = getRankStyles(player.rank || 0, dark || false)
        const avatarSrc = (player as PlayerWithRating & { avatar?: string | null }).avatar || getDefaultAvatar(player.category)
        
        return (
          <div 
            key={player.id} 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]",
              styles.bg,
              styles.border,
              player.rank !== undefined && player.rank <= 3 ? "p-4" : ""
            )}
          >
            {/* Rank */}
            <div className={cn(
              "w-10 text-center font-bold",
              player.rank === 1 && "text-2xl text-amber-500",
              player.rank === 2 && "text-2xl",
              player.rank === 3 && "text-2xl text-orange-600",
              (!player.rank || player.rank > 3) && "text-lg",
              dark && player.rank !== 1 && player.rank !== 3 ? "text-white/60" : "",
              !dark && player.rank !== 1 && player.rank !== 3 ? "text-gray-500" : ""
            )}>
              {styles.medal ? styles.medal : `#${player.rank}`}
            </div>
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/10 shrink-0">
              <Image
                src={avatarSrc}
                alt={player.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Flag */}
            <Flag code={player.nationality} size="md" />
            
            {/* Name & Clan */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold truncate",
                styles.text,
                player.rank !== undefined && player.rank >= 1 && player.rank <= 3 ? "text-lg" : ""
              )}>
                {player.name}
              </h3>
              {player.clan && (
                <p className={cn(
                  "text-xs truncate",
                  dark ? "text-white/50" : "text-gray-500"
                )}>
                  {player.clan}
                </p>
              )}
            </div>
            
            {/* Rating */}
            <div className={cn(
              "font-bold text-xl tabular-nums",
              player.rank === 1 && "text-amber-500 text-2xl",
              player.rank === 2 && (dark ? "text-gray-300" : "text-gray-600") + " text-2xl",
              player.rank === 3 && "text-orange-600 text-2xl",
              (!player.rank || player.rank > 3) && (dark ? "text-white" : "text-gray-900")
            )}>
              {player.averageRating > 0 ? player.averageRating.toFixed(1) : "—"}
            </div>
          </div>
        )
      })}
      
      {/* Show More Button */}
      {hasMore && !showAll && (
        <Button
          onClick={() => setShowAll(true)}
          variant="ghost"
          className={cn(
            "w-full mt-4",
            dark ? "!text-white/70 hover:!bg-white/10" : "!text-gray-600 hover:!bg-gray-100"
          )}
        >
          Show {players.length - initialLimit} more players
        </Button>
      )}
      
      {showAll && hasMore && (
        <Button
          onClick={() => setShowAll(false)}
          variant="ghost"
          className={cn(
            "w-full mt-4",
            dark ? "!text-white/70 hover:!bg-white/10" : "!text-gray-600 hover:!bg-gray-100"
          )}
        >
          Show less
        </Button>
      )}
    </div>
  )
}
