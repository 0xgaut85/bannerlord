"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"
import { getDefaultAvatar, categoryShort } from "../utils"
import { SearchPlayer } from "../types"

interface PlayerWithDetails extends SearchPlayer {
  division?: string
  isLegend?: boolean
}

interface StreamerPlayerManagerProps {
  onSelectPlayer: (playerId: string) => void
  disabled: boolean
}

type ViewMode = "ADDED" | "INFANTRY" | "CAVALRY" | "ARCHER"

export function StreamerPlayerManager({ onSelectPlayer, disabled }: StreamerPlayerManagerProps) {
  // Division A players from current rankings
  const [divisionAPlayers, setDivisionAPlayers] = useState<PlayerWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  // Players added by streamer via search
  const [addedPlayers, setAddedPlayers] = useState<PlayerWithDetails[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PlayerWithDetails[]>([])
  const [searching, setSearching] = useState(false)
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("ADDED")

  // Fetch Division A players on mount
  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      try {
        const categories = ["INFANTRY", "CAVALRY", "ARCHER"]
        const allPlayers: PlayerWithDetails[] = []
        
        for (const cat of categories) {
          const res = await fetch(`/api/community?category=${cat}`)
          if (res.ok) {
            const data = await res.json()
            const divAPlayers = data.filter((p: any) => p.division === "A")
            allPlayers.push(...divAPlayers.map((p: any) => ({
              ...p,
              division: p.division
            })))
          }
        }
        
        // Sort alphabetically by name
        allPlayers.sort((a, b) => a.name.localeCompare(b.name))
        setDivisionAPlayers(allPlayers)
      } catch (error) {
        console.error("Error fetching Division A players:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  // Search players (global - all divisions, including legends)
  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      // Search without divisionA filter to get all players including legends
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&legends=true`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.slice(0, 15))
      }
    } catch (error) {
      console.error("Failed to search players:", error)
    } finally {
      setSearching(false)
    }
  }

  // Add player to the added list
  const addPlayer = (player: PlayerWithDetails) => {
    // Check if already added
    if (addedPlayers.some(p => p.id === player.id)) return
    setAddedPlayers(prev => [...prev, player])
    setSearchQuery("")
    setSearchResults([])
  }

  // Remove player from added list
  const removePlayer = (playerId: string) => {
    setAddedPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  // Get players to display based on view mode
  const getDisplayPlayers = (): PlayerWithDetails[] => {
    if (viewMode === "ADDED") {
      return addedPlayers
    }
    return divisionAPlayers.filter(p => p.category === viewMode)
  }

  const displayPlayers = getDisplayPlayers()

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-3 text-center">🔍 Search Any Player</h2>
        <p className="text-white/40 text-sm text-center mb-3">Search all players (any division, legends included)</p>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Type player name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchPlayers(e.target.value)
            }}
            className="w-full px-4 py-3 bg-black/50 border border-violet-500/40 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">
              ...
            </div>
          )}
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto max-w-md mx-auto">
            {searchResults.map(player => {
              const isAlreadyAdded = addedPlayers.some(p => p.id === player.id)
              return (
                <button
                  key={player.id}
                  onClick={() => addPlayer(player)}
                  disabled={isAlreadyAdded}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 border rounded-xl transition-all text-left",
                    isAlreadyAdded 
                      ? "bg-green-500/10 border-green-500/30 cursor-default"
                      : "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30"
                  )}
                >
                  <Image
                    src={player.avatar || getDefaultAvatar(player.category)}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-white font-semibold">{player.name}</div>
                    <div className="text-violet-300/60 text-sm">
                      {player.category} • {player.clan || "FA"}
                      {player.isLegend && " • 🏆 Legend"}
                    </div>
                  </div>
                  {player.nationality && <Flag code={player.nationality} size="sm" />}
                  {isAlreadyAdded && <span className="text-green-400 text-sm">✓ Added</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Player List */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
        {/* Category Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {viewMode === "ADDED" 
              ? `⭐ Players Added (${addedPlayers.length})`
              : `📋 Division A - ${viewMode} (${displayPlayers.length})`
            }
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("ADDED")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                viewMode === "ADDED"
                  ? "bg-amber-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              ⭐ Added ({addedPlayers.length})
            </button>
            {(["INFANTRY", "CAVALRY", "ARCHER"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setViewMode(cat)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                  viewMode === cat
                    ? "bg-violet-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                {categoryShort[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Player Grid */}
        {loading && viewMode !== "ADDED" ? (
          <div className="text-center py-8 text-white/50">Loading players...</div>
        ) : displayPlayers.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            {viewMode === "ADDED" 
              ? "No players added yet. Use the search above to add players."
              : "No players found"
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {displayPlayers.map(player => (
              <div
                key={player.id}
                className="relative flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/50 rounded-xl transition-all"
              >
                {/* Remove button for added players */}
                {viewMode === "ADDED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlayer(player.id)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white text-xs rounded-full flex items-center justify-center z-10"
                  >
                    ✕
                  </button>
                )}
                
                <button
                  onClick={() => onSelectPlayer(player.id)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-2 w-full disabled:opacity-50"
                >
                  <Image
                    src={player.avatar || getDefaultAvatar(player.category)}
                    alt={player.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="text-center">
                    <div className="text-white font-medium text-sm truncate max-w-[100px]">
                      {cleanPlayerName(player.name)}
                    </div>
                    <div className="text-white/40 text-xs">
                      {categoryShort[player.category]}
                      {player.isLegend && " • 🏆"}
                    </div>
                  </div>
                  {player.nationality && (
                    <Flag code={player.nationality} size="sm" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

