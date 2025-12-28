"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"
import { getDefaultAvatar, categoryShort } from "../utils"

interface DivisionAPlayer {
  id: string
  name: string
  category: string
  nationality: string | null
  clan: string | null
  avatar: string | null
  averageRating: number
}

interface DivisionAPlayersListProps {
  onSelectPlayer: (playerId: string) => void
  disabled: boolean
}

export function DivisionAPlayersList({ onSelectPlayer, disabled }: DivisionAPlayersListProps) {
  const [players, setPlayers] = useState<DivisionAPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "INFANTRY" | "CAVALRY" | "ARCHER">("ALL")

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      try {
        // Fetch all 3 categories and merge
        const categories = ["INFANTRY", "CAVALRY", "ARCHER"]
        const allPlayers: DivisionAPlayer[] = []
        
        for (const cat of categories) {
          const res = await fetch(`/api/community?category=${cat}`)
          if (res.ok) {
            const data = await res.json()
            // Filter only Division A players
            const divAPlayers = data.filter((p: any) => p.division === "A")
            allPlayers.push(...divAPlayers)
          }
        }
        
        // Sort by rating descending
        allPlayers.sort((a, b) => b.averageRating - a.averageRating)
        setPlayers(allPlayers)
      } catch (error) {
        console.error("Error fetching Division A players:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  const filteredPlayers = categoryFilter === "ALL" 
    ? players 
    : players.filter(p => p.category === categoryFilter)

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">📋 Division A Players ({filteredPlayers.length})</h2>
        <div className="flex gap-2">
          {(["ALL", "INFANTRY", "CAVALRY", "ARCHER"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                categoryFilter === cat 
                  ? "bg-violet-500 text-white" 
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {cat === "ALL" ? "All" : categoryShort[cat]}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-white/50">Loading players...</div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-8 text-white/50">No Division A players found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              disabled={disabled}
              className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/50 rounded-xl transition-all disabled:opacity-50"
            >
              <Image
                src={player.avatar || getDefaultAvatar(player.category)}
                alt={player.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="text-center">
                <div className="text-white font-medium text-sm truncate max-w-[100px]">{cleanPlayerName(player.name)}</div>
                <div className="text-white/40 text-xs">
                  {categoryShort[player.category]} • {Math.round(player.averageRating)}
                </div>
              </div>
              {player.nationality && (
                <Flag code={player.nationality} size="sm" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

