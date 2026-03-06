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
  const [divisionAPlayers, setDivisionAPlayers] = useState<PlayerWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  const [addedPlayers, setAddedPlayers] = useState<PlayerWithDetails[]>([])
  const [listSaved, setListSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PlayerWithDetails[]>([])
  const [searching, setSearching] = useState(false)
  
  const [viewMode, setViewMode] = useState<ViewMode>("ADDED")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedList = localStorage.getItem('curatedStreamerPlayerList')
      if (savedList) {
        try {
          const parsed = JSON.parse(savedList)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAddedPlayers(parsed)
            setListSaved(true)
          }
        } catch (e) {
          console.error("Failed to load saved player list:", e)
        }
      }
    }
  }, [])

  const saveList = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('curatedStreamerPlayerList', JSON.stringify(addedPlayers))
      setListSaved(true)
      setHasUnsavedChanges(false)
    }
  }

  const clearSavedList = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('curatedStreamerPlayerList')
      setAddedPlayers([])
      setListSaved(false)
      setHasUnsavedChanges(false)
    }
  }

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

  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
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

  const addPlayer = (player: PlayerWithDetails) => {
    if (addedPlayers.some(p => p.id === player.id)) return
    setAddedPlayers(prev => [...prev, player])
    setHasUnsavedChanges(true)
    setSearchQuery("")
    setSearchResults([])
  }

  const removePlayer = (playerId: string) => {
    setAddedPlayers(prev => prev.filter(p => p.id !== playerId))
    setHasUnsavedChanges(true)
  }

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
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.04] rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-3 text-center">Search Any Player</h2>
        <p className="text-[#888] text-sm text-center mb-3">Search all players (any division, legends included)</p>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Type player name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchPlayers(e.target.value)
            }}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.04] rounded-xl text-white text-lg placeholder:text-[#444] focus:outline-none focus:border-white/20"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] text-sm">
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
                      : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.04]"
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
                    <div className="text-[#555] text-sm">
                      {player.category} • {player.clan || "FA"}
                      {player.isLegend && " • Legend"}
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
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.04] rounded-2xl p-5">
        {/* Category Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">
              {viewMode === "ADDED" 
                ? `Players Added (${addedPlayers.length})`
                : `Division A - ${viewMode} (${displayPlayers.length})`
              }
            </h2>
            {viewMode === "ADDED" && addedPlayers.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={saveList}
                  disabled={!hasUnsavedChanges && listSaved}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1",
                    hasUnsavedChanges
                      ? "bg-green-500 hover:bg-green-400 text-white animate-pulse"
                      : listSaved
                        ? "bg-green-500/20 text-green-300 cursor-default"
                        : "bg-green-500 hover:bg-green-400 text-white"
                  )}
                >
                  {hasUnsavedChanges ? "Save List" : listSaved ? "Saved ✓" : "Save List"}
                </button>
                <button
                  onClick={clearSavedList}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("ADDED")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                viewMode === "ADDED"
                  ? "bg-white text-black"
                  : "bg-white/[0.02] text-[#555] hover:text-white border border-white/[0.04]"
              )}
            >
              Added ({addedPlayers.length})
            </button>
            {(["INFANTRY", "CAVALRY", "ARCHER"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setViewMode(cat)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                  viewMode === cat
                    ? "bg-white text-black"
                    : "bg-white/[0.02] text-[#555] hover:text-white border border-white/[0.04]"
                )}
              >
                {categoryShort[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Player Grid */}
        {loading && viewMode !== "ADDED" ? (
          <div className="text-center py-8 text-[#888]">Loading players...</div>
        ) : displayPlayers.length === 0 ? (
          <div className="text-center py-8 text-[#888]">
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
                className="relative flex flex-col items-center gap-2 p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 rounded-xl transition-all"
              >
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
                    <div className="text-[#888] text-xs">
                      {categoryShort[player.category]}
                      {player.isLegend && " • Legend"}
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
