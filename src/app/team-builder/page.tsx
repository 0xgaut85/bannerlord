"use client"

import { useState, useEffect, useMemo, DragEvent, useRef } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Flag } from "@/components/ui"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  name: string
  category: string
  nationality: string | null
  clan: string | null
  avatar: string | null
  clanLogo: string | null
  averageRating: number
  isLegend?: boolean
}

interface TeamPlayer extends Player {
  position: number
}

interface SavedTeam {
  id: string
  name: string
  playerIds: string[]
}

// Card styling based on rating (with legend style)
function getCardStyle(rating: number, isLegend?: boolean) {
  // Special legend style - white/marble
  if (isLegend) return {
    bg: "linear-gradient(145deg, #f8f8f8 0%, #e8e8e8 20%, #ffffff 40%, #f0f0f0 60%, #e0e0e0 80%, #f5f5f5 100%)",
    border: "border-white",
    text: "text-slate-800",
    subtext: "text-slate-600",
    isLegend: true,
  }
  if (rating >= 95) return {
    bg: "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)",
    border: "border-cyan-300/60",
    text: "text-white",
    subtext: "text-cyan-200",
  }
  if (rating >= 90) return {
    bg: "linear-gradient(145deg, #1a0f00 0%, #3d2200 20%, #5c3a00 40%, #4a2c00 60%, #2d1800 80%, #1a0f00 100%)",
    border: "border-amber-400/60",
    text: "text-amber-50",
    subtext: "text-amber-200",
  }
  if (rating >= 85) return {
    bg: "linear-gradient(145deg, #5c4a00 0%, #8b7500 25%, #b8960a 50%, #8b7500 75%, #5c4a00 100%)",
    border: "border-yellow-400/50",
    text: "text-white",
    subtext: "text-yellow-100",
  }
  if (rating >= 80) return {
    bg: "linear-gradient(145deg, #2a2a2a 0%, #4a4a4a 25%, #6a6a6a 50%, #4a4a4a 75%, #2a2a2a 100%)",
    border: "border-slate-300/50",
    text: "text-white",
    subtext: "text-slate-200",
  }
  if (rating >= 75) return {
    bg: "linear-gradient(145deg, #1f1f1f 0%, #3a3a3a 25%, #505050 50%, #3a3a3a 75%, #1f1f1f 100%)",
    border: "border-slate-400/40",
    text: "text-slate-100",
    subtext: "text-slate-300",
  }
  if (rating >= 70) return {
    bg: "linear-gradient(145deg, #1a0800 0%, #4a1c00 25%, #6d3500 50%, #4a1c00 75%, #1a0800 100%)",
    border: "border-orange-500/50",
    text: "text-orange-50",
    subtext: "text-orange-200",
  }
  return {
    bg: "linear-gradient(145deg, #0f0a06 0%, #1f150d 25%, #2a1f15 50%, #1f150d 75%, #0f0a06 100%)",
    border: "border-[#6b5344]/50",
    text: "text-[#e8dcc5]",
    subtext: "text-[#c2b299]",
  }
}

function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

function getTierFromRating(rating: number): string {
  if (rating >= 95) return "S"
  if (rating >= 90) return "A+"
  if (rating >= 85) return "A"
  if (rating >= 80) return "B+"
  if (rating >= 75) return "B"
  if (rating >= 70) return "B-"
  if (rating >= 65) return "C+"
  if (rating >= 60) return "C"
  if (rating >= 55) return "C-"
  return "D"
}

type LinkType = "green" | "yellow" | "red"

function getLinkType(p1: TeamPlayer, p2: TeamPlayer): LinkType {
  const sameNation = p1.nationality && p2.nationality && p1.nationality === p2.nationality
  const sameClan = p1.clan && p2.clan && p1.clan === p2.clan
  if (sameNation && sameClan) return "green"
  if (sameNation || sameClan) return "yellow"
  return "red"
}

function getLinkColor(type: LinkType): string {
  switch (type) {
    case "green": return "#22c55e"
    case "yellow": return "#eab308"
    case "red": return "#ef4444"
  }
}

// Link pairs for the 2x3 grid
const linkPairs = [
  [0, 1], [1, 2], // Top row
  [3, 4], [4, 5], // Bottom row
  [0, 3], [0, 4], // Top-left to bottom
  [1, 3], [1, 4], [1, 5], // Top-center to bottom
  [2, 4], [2, 5], // Top-right to bottom
]

// FIFA Card Component (draggable)
function FifaCard({ 
  player, 
  onDragStart,
  onDragEnd,
  isDragging,
  size = "lg"
}: { 
  player: TeamPlayer
  onDragStart: (e: DragEvent, player: TeamPlayer) => void
  onDragEnd: () => void
  isDragging: boolean
  size?: "md" | "lg"
}) {
  const style = getCardStyle(player.averageRating, player.isLegend)
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const tier = player.isLegend ? "LEG" : getTierFromRating(player.averageRating)
  
  const sizeClasses = size === "lg" 
    ? "w-40 sm:w-48 md:w-52" 
    : "w-32 sm:w-36"
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, player)}
      onDragEnd={onDragEnd}
      className={cn(
        `relative ${sizeClasses} aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 cursor-grab active:cursor-grabbing`,
        style.border,
        isDragging ? "opacity-30 scale-95" : ""
      )}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: style.bg }} />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
      
      {/* Inner border */}
      <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col p-3 sm:p-4 z-20">
        {/* Top: Rating & Name */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className={`text-3xl sm:text-4xl font-black ${style.text} leading-none drop-shadow-lg`}>
              {Math.round(player.averageRating)}
            </span>
            <span className={`text-xs sm:text-sm font-bold ${style.subtext} uppercase mt-1`}>
              {categoryShort[player.category]}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-sm sm:text-base font-bold ${style.text} uppercase block truncate max-w-[80px]`}>
              {player.name.split(' ')[0]}
            </span>
          </div>
        </div>
        
        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
            <Image src={avatarSrc} alt="" fill className="object-cover" />
          </div>
        </div>
        
        {/* Bottom */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1">
            {player.clanLogo && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black overflow-hidden">
                <Image src={player.clanLogo} alt="" width={24} height={24} className="object-cover" />
              </div>
            )}
            <Flag code={player.nationality} size="md" />
          </div>
          <span className={`text-lg sm:text-xl font-bold ${style.text}`}>{tier}</span>
        </div>
        
        {/* Clan */}
        {player.clan && (
          <div className="mt-2 text-center">
            <span className={`text-xs sm:text-sm ${style.subtext} bg-black/40 px-2 py-1 rounded`}>
              {player.clan}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeamBuilderPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [team, setTeam] = useState<(TeamPlayer | null)[]>([null, null, null, null, null, null])
  const [isSearching, setIsSearching] = useState(false)
  const [draggedPlayer, setDraggedPlayer] = useState<TeamPlayer | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([])
  const [teamName, setTeamName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const teamGridRef = useRef<HTMLDivElement>(null)

  // Fetch saved teams
  useEffect(() => {
    if (session?.user) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSavedTeams(data)
        })
        .catch(console.error)
    }
  }, [session])

  // Save team
  const handleSaveTeam = async () => {
    if (!teamName.trim() || team.filter(p => p).length !== 6) return
    setIsSaving(true)
    try {
      const playerIds = team.map(p => p?.id || "")
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, playerIds })
      })
      if (res.ok) {
        const newTeam = await res.json()
        setSavedTeams(prev => {
          const filtered = prev.filter(t => t.name !== newTeam.name)
          return [newTeam, ...filtered]
        })
        setShowSaveModal(false)
        setTeamName("")
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Load team
  const handleLoadTeam = async (savedTeam: SavedTeam) => {
    // Fetch player details for each ID
    const players: (TeamPlayer | null)[] = []
    for (let i = 0; i < savedTeam.playerIds.length; i++) {
      const playerId = savedTeam.playerIds[i]
      if (!playerId) {
        players.push(null)
        continue
      }
      try {
        const res = await fetch(`/api/players/${playerId}`)
        if (res.ok) {
          const player = await res.json()
          players.push({ ...player, position: i })
        } else {
          players.push(null)
        }
      } catch {
        players.push(null)
      }
    }
    setTeam(players)
    setShowLoadModal(false)
  }

  // Delete saved team
  const handleDeleteTeam = async (teamId: string) => {
    try {
      await fetch(`/api/teams?id=${teamId}`, { method: "DELETE" })
      setSavedTeams(prev => prev.filter(t => t.id !== teamId))
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  // Screenshot
  const handleScreenshot = async () => {
    if (!teamGridRef.current) return
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(teamGridRef.current, {
        backgroundColor: "#1e293b",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `dream-team-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error("Screenshot error:", error)
    }
  }

  // Search for players
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.slice(0, 10))
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Count players by category
  const categoryCounts = useMemo(() => {
    const counts = { INFANTRY: 0, CAVALRY: 0, ARCHER: 0 }
    team.forEach(p => {
      if (p) counts[p.category as keyof typeof counts]++
    })
    return counts
  }, [team])

  // Check if can add player
  const canAddPlayer = (player: Player): boolean => {
    if (team.some(p => p?.id === player.id)) return false
    if (team.filter(p => p !== null).length >= 6) return false
    if (player.category === "CAVALRY" && categoryCounts.CAVALRY >= 2) return false
    if (player.category === "ARCHER" && categoryCounts.ARCHER >= 2) return false
    return true
  }

  // Add player to specific slot
  const addPlayerToSlot = (player: Player, slotIndex: number) => {
    if (!canAddPlayer(player)) return
    const newTeam = [...team]
    newTeam[slotIndex] = { ...player, position: slotIndex }
    setTeam(newTeam)
    setSearchQuery("")
    setSearchResults([])
  }

  // Add player to first empty slot
  const addPlayer = (player: Player) => {
    const emptyIndex = team.findIndex(p => p === null)
    if (emptyIndex === -1) return
    addPlayerToSlot(player, emptyIndex)
  }

  // Remove player from team
  const removePlayer = (index: number) => {
    const newTeam = [...team]
    newTeam[index] = null
    setTeam(newTeam)
  }

  // Drag handlers
  const handleDragStart = (e: DragEvent, player: TeamPlayer) => {
    // Set drag data
    e.dataTransfer.setData("text/plain", player.id)
    e.dataTransfer.effectAllowed = "move"
    // Delay setting dragged player to allow the drag image to be created
    setTimeout(() => setDraggedPlayer(player), 0)
  }

  const handleDragOver = (e: DragEvent, slotIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    // Only update if different slot
    if (dragOverSlot !== slotIndex) {
      setDragOverSlot(slotIndex)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    // Only clear if leaving the slot container, not a child
    const relatedTarget = e.relatedTarget as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverSlot(null)
    }
  }

  const handleDrop = (e: DragEvent, targetSlotIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const playerId = e.dataTransfer.getData("text/plain")
    const sourceIndex = team.findIndex(p => p?.id === playerId)
    
    if (sourceIndex === -1 || sourceIndex === targetSlotIndex) {
      setDraggedPlayer(null)
      setDragOverSlot(null)
      return
    }
    
    const newTeam = [...team]
    const sourcePlayer = newTeam[sourceIndex]
    const targetPlayer = newTeam[targetSlotIndex]
    
    // Swap players
    if (sourcePlayer) {
      newTeam[targetSlotIndex] = { ...sourcePlayer, position: targetSlotIndex }
    }
    newTeam[sourceIndex] = targetPlayer ? { ...targetPlayer, position: sourceIndex } : null
    
    setTeam(newTeam)
    setDraggedPlayer(null)
    setDragOverSlot(null)
  }

  const handleDragEnd = () => {
    setDraggedPlayer(null)
    setDragOverSlot(null)
  }

  // Calculate team score
  const { baseScore, linkBonus, totalScore, links, greenLinks, yellowLinks } = useMemo(() => {
    const players = team.filter((p): p is TeamPlayer => p !== null)
    const baseScore = players.length > 0 
      ? players.reduce((sum, p) => sum + p.averageRating, 0) / players.length
      : 0
    
    const links: { from: number; to: number; type: LinkType }[] = []
    let greenLinks = 0
    let yellowLinks = 0
    
    for (const [i, j] of linkPairs) {
      const p1 = team[i]
      const p2 = team[j]
      if (p1 && p2) {
        const type = getLinkType(p1, p2)
        links.push({ from: i, to: j, type })
        if (type === "green") greenLinks++
        else if (type === "yellow") yellowLinks++
      }
    }
    
    const linkBonus = (greenLinks * 1.0) + (yellowLinks * 0.5)
    const totalScore = Math.min(99, baseScore + linkBonus)
    
    return {
      baseScore: Math.round(baseScore * 10) / 10,
      linkBonus: Math.round(linkBonus * 10) / 10,
      totalScore: Math.round(totalScore * 10) / 10,
      links,
      greenLinks,
      yellowLinks
    }
  }, [team])

  const teamPlayers = team.filter((p): p is TeamPlayer => p !== null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Save Dream Team</h3>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name..."
              className="w-full px-4 py-3 bg-black/30 rounded-lg border border-white/20 text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeam}
                disabled={!teamName.trim() || isSaving}
                className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Load Dream Team</h3>
            {savedTeams.length === 0 ? (
              <p className="text-white/50 text-center py-8">No saved teams yet</p>
            ) : (
              <div className="space-y-2 mb-4">
                {savedTeams.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <button
                      onClick={() => handleLoadTeam(t)}
                      className="flex-1 text-left text-white font-medium hover:text-amber-400"
                    >
                      {t.name}
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(t.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadModal(false)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/30 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Team Builder
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Drag cards to rearrange · Max 2 Cavalry, Max 2 Archers
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {session && (
                <>
                  <button
                    onClick={() => setShowLoadModal(true)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm"
                  >
                    Load Team
                  </button>
                  <button
                    onClick={() => teamPlayers.length === 6 && setShowSaveModal(true)}
                    disabled={teamPlayers.length !== 6}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 text-sm"
                  >
                    Save Team
                  </button>
                </>
              )}
              <button
                onClick={handleScreenshot}
                disabled={teamPlayers.length === 0}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 text-sm"
              >
                Screenshot
              </button>
              
              {/* Team Score */}
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl px-6 py-3 border border-amber-500/30">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-amber-400 text-xs uppercase tracking-wider">Team Rating</p>
                    <p className="text-4xl font-black text-white">{totalScore}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-white/50">Avg: {baseScore}</div>
                    {linkBonus > 0 && <div className="text-green-400">+{linkBonus} links</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Panel: Search & Controls */}
          <div className="xl:w-80 flex-shrink-0 space-y-4">
            {/* Search */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <label className="block text-white/70 text-sm mb-2">Search Players</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type player name..."
                className="w-full px-4 py-3 bg-black/30 rounded-lg border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
              />
              
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((player) => {
                    const canAdd = canAddPlayer(player)
                    return (
                      <div
                        key={player.id}
                        onClick={() => canAdd && addPlayer(player)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-colors",
                          canAdd ? "bg-black/20 hover:bg-black/40 cursor-pointer" : "opacity-40"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black/30">
                          <Image
                            src={player.avatar || getDefaultAvatar(player.category)}
                            alt="" width={32} height={32} className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{player.name}</p>
                          <p className="text-white/40 text-xs">{player.category}</p>
                        </div>
                        <span className="text-amber-400 font-bold text-sm">{Math.round(player.averageRating)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {isSearching && <p className="text-white/30 text-sm mt-2">Searching...</p>}
            </div>

            {/* Category Limits */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Squad Composition</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={cn("p-2 rounded-lg", categoryCounts.INFANTRY > 0 ? "bg-red-500/20" : "bg-white/5")}>
                  <div className="text-lg font-bold text-white">{categoryCounts.INFANTRY}</div>
                  <div className="text-xs text-white/50">INF</div>
                </div>
                <div className={cn("p-2 rounded-lg", categoryCounts.CAVALRY >= 2 ? "bg-blue-500/40" : categoryCounts.CAVALRY > 0 ? "bg-blue-500/20" : "bg-white/5")}>
                  <div className="text-lg font-bold text-white">{categoryCounts.CAVALRY}/2</div>
                  <div className="text-xs text-white/50">CAV</div>
                </div>
                <div className={cn("p-2 rounded-lg", categoryCounts.ARCHER >= 2 ? "bg-green-500/40" : categoryCounts.ARCHER > 0 ? "bg-green-500/20" : "bg-white/5")}>
                  <div className="text-lg font-bold text-white">{categoryCounts.ARCHER}/2</div>
                  <div className="text-xs text-white/50">ARC</div>
                </div>
              </div>
            </div>

            {/* Link Legend */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Link Bonuses</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-green-500 rounded" />
                  <span className="text-white/60 flex-1">Nation + Clan</span>
                  <span className="text-green-400">+1.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-yellow-500 rounded" />
                  <span className="text-white/60 flex-1">Nation or Clan</span>
                  <span className="text-yellow-400">+0.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-red-500 rounded" />
                  <span className="text-white/60 flex-1">No link</span>
                  <span className="text-red-400">+0</span>
                </div>
              </div>
            </div>

            {/* Team List (for removing) */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Remove Players</h3>
              <div className="space-y-1">
                {team.map((player, idx) => player && (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                    <span className="text-white/40 text-xs w-4">{idx + 1}</span>
                    <span className="text-white text-sm flex-1 truncate">{player.name}</span>
                    <button
                      onClick={() => removePlayer(idx)}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded"
                    >
                      X
                    </button>
                  </div>
                ))}
                {teamPlayers.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-2">No players yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Area: Team Grid */}
          <div className="flex-1 min-h-[600px] lg:min-h-[700px]">
            <div ref={teamGridRef} className="relative w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/80 rounded-2xl border border-white/10 p-4 sm:p-8">
              
              {/* SVG for link lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {links.map((link, idx) => {
                  // Calculate positions based on grid (responsive)
                  const cols = 3
                  const fromRow = Math.floor(link.from / cols)
                  const fromCol = link.from % cols
                  const toRow = Math.floor(link.to / cols)
                  const toCol = link.to % cols
                  
                  // Percentage-based positions
                  const x1 = `${(fromCol + 0.5) * (100 / cols)}%`
                  const y1 = `${(fromRow + 0.5) * 50}%`
                  const x2 = `${(toCol + 0.5) * (100 / cols)}%`
                  const y2 = `${(toRow + 0.5) * 50}%`
                  
                  return (
                    <line
                      key={idx}
                      x1={x1} y1={y1}
                      x2={x2} y2={y2}
                      stroke={getLinkColor(link.type)}
                      strokeWidth={4}
                      strokeLinecap="round"
                      opacity={0.7}
                    />
                  )
                })}
              </svg>

              {/* Grid of slots */}
              <div className="relative z-10 grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 h-full">
                {team.map((player, idx) => (
                  <div
                    key={`slot-${idx}`}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={cn(
                      "flex items-center justify-center rounded-2xl min-h-[200px] sm:min-h-[280px]",
                      dragOverSlot === idx && draggedPlayer && "bg-amber-500/20 ring-2 ring-amber-500/50",
                      !player && "border-2 border-dashed border-white/20"
                    )}
                  >
                    {player ? (
                      <FifaCard
                        player={player}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedPlayer?.id === player.id}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2">
                          <span className="text-2xl sm:text-3xl text-white/20">+</span>
                        </div>
                        <span className="text-white/30 text-sm">Slot {idx + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
