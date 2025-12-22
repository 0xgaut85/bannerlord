"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
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
}

interface TeamPlayer extends Player {
  position: number // 0-5 for the 6 slots
}

// Card styling based on rating
function getCardStyle(rating: number) {
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

// Link types between players
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

// Card positions for hexagonal layout (2 rows of 3)
const cardPositions = [
  { x: 80, y: 60 },   // Top left
  { x: 250, y: 60 },  // Top center
  { x: 420, y: 60 },  // Top right
  { x: 80, y: 280 },  // Bottom left
  { x: 250, y: 280 }, // Bottom center
  { x: 420, y: 280 }, // Bottom right
]

// Define links between adjacent positions
const linkPairs = [
  [0, 1], [1, 2], // Top row
  [3, 4], [4, 5], // Bottom row
  [0, 3], [0, 4], // Top-left to bottom
  [1, 3], [1, 4], [1, 5], // Top-center to bottom
  [2, 4], [2, 5], // Top-right to bottom
]

export default function TeamBuilderPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [team, setTeam] = useState<(TeamPlayer | null)[]>([null, null, null, null, null, null])
  const [isSearching, setIsSearching] = useState(false)

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
    // Check if already in team
    if (team.some(p => p?.id === player.id)) return false
    
    // Check team size
    if (team.filter(p => p !== null).length >= 6) return false
    
    // Check category limits (max 2 cav, max 2 archer)
    if (player.category === "CAVALRY" && categoryCounts.CAVALRY >= 2) return false
    if (player.category === "ARCHER" && categoryCounts.ARCHER >= 2) return false
    
    return true
  }

  // Add player to team
  const addPlayer = (player: Player) => {
    if (!canAddPlayer(player)) return
    
    // Find first empty slot
    const emptyIndex = team.findIndex(p => p === null)
    if (emptyIndex === -1) return
    
    const newTeam = [...team]
    newTeam[emptyIndex] = { ...player, position: emptyIndex }
    setTeam(newTeam)
    setSearchQuery("")
    setSearchResults([])
  }

  // Remove player from team
  const removePlayer = (index: number) => {
    const newTeam = [...team]
    newTeam[index] = null
    setTeam(newTeam)
  }

  // Calculate team score (average-based, max 99)
  const { baseScore, linkBonus, totalScore, links, greenLinks, yellowLinks } = useMemo(() => {
    const players = team.filter((p): p is TeamPlayer => p !== null)
    
    // Base score = average of ratings (0 if no players)
    const baseScore = players.length > 0 
      ? players.reduce((sum, p) => sum + p.averageRating, 0) / players.length
      : 0
    
    // Calculate links and bonus
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
    
    // Bonus: +1.0 per green link, +0.5 per yellow link (added to average)
    const linkBonus = (greenLinks * 1.0) + (yellowLinks * 0.5)
    
    // Total score capped at 99
    const rawTotal = baseScore + linkBonus
    const totalScore = Math.min(99, rawTotal)
    
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Score */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-2">
              Build Your Squad
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Team Builder
            </h1>
            <p className="text-white/50 mt-2">
              Max 2 Cavalry, Max 2 Archers · Links boost your team score
            </p>
          </div>
          
          {/* Team Score */}
          <div className="text-right bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-6 border border-amber-500/30">
            <p className="text-amber-400 text-sm uppercase tracking-wider mb-1">Team Rating</p>
            <p className="text-5xl font-black text-white">{totalScore}</p>
            <div className="mt-2 text-sm space-y-1">
              <div>
                <span className="text-white/50">Avg: {baseScore}</span>
                {linkBonus > 0 && (
                  <span className="text-green-400 ml-2">+{linkBonus}</span>
                )}
              </div>
              {(greenLinks > 0 || yellowLinks > 0) && (
                <div className="text-xs text-white/40">
                  {greenLinks > 0 && <span className="text-green-400">{greenLinks} strong</span>}
                  {greenLinks > 0 && yellowLinks > 0 && <span> · </span>}
                  {yellowLinks > 0 && <span className="text-yellow-400">{yellowLinks} weak</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Search & Team List */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <label className="block text-white/70 text-sm mb-2">Search Players</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type player name..."
                className="w-full px-4 py-3 bg-black/30 rounded-xl border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((player) => {
                    const canAdd = canAddPlayer(player)
                    return (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          canAdd 
                            ? "bg-black/20 hover:bg-black/40 cursor-pointer" 
                            : "bg-black/10 opacity-50"
                        )}
                        onClick={() => canAdd && addPlayer(player)}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black/30">
                          <Image
                            src={player.avatar || getDefaultAvatar(player.category)}
                            alt=""
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{player.name}</p>
                          <p className="text-white/40 text-xs">{player.category} · {player.clan || "FA"}</p>
                        </div>
                        <span className="text-amber-400 font-bold">{Math.round(player.averageRating)}</span>
                        {canAdd && (
                          <button className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                            Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {isSearching && (
                <p className="text-white/30 text-sm mt-3">Searching...</p>
              )}
            </div>

            {/* Team List */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-4">Your Team ({teamPlayers.length}/6)</h3>
              
              {/* Category limits */}
              <div className="flex gap-3 mb-4 text-xs">
                <span className={cn(
                  "px-2 py-1 rounded",
                  categoryCounts.INFANTRY > 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"
                )}>
                  INF: {categoryCounts.INFANTRY}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded",
                  categoryCounts.CAVALRY >= 2 ? "bg-blue-500/40 text-blue-300" : 
                  categoryCounts.CAVALRY > 0 ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/40"
                )}>
                  CAV: {categoryCounts.CAVALRY}/2
                </span>
                <span className={cn(
                  "px-2 py-1 rounded",
                  categoryCounts.ARCHER >= 2 ? "bg-green-500/40 text-green-300" : 
                  categoryCounts.ARCHER > 0 ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
                )}>
                  ARC: {categoryCounts.ARCHER}/2
                </span>
              </div>

              <div className="space-y-2">
                {team.map((player, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      player ? "bg-black/20 border-white/10" : "border-dashed border-white/20"
                    )}
                  >
                    {player ? (
                      <>
                        <span className="text-white/40 w-4">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{player.name}</p>
                          <p className="text-white/40 text-xs">{player.category}</p>
                        </div>
                        <span className="text-amber-400 font-bold text-sm">{Math.round(player.averageRating)}</span>
                        <button
                          onClick={() => removePlayer(idx)}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="text-white/30 text-sm">Empty slot {idx + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Link Legend */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3">Link Bonuses</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-green-500 rounded" />
                  <span className="text-white/70">Same Nation + Same Clan</span>
                  <span className="text-green-400 ml-auto">+1.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-yellow-500 rounded" />
                  <span className="text-white/70">Same Nation OR Same Clan</span>
                  <span className="text-yellow-400 ml-auto">+0.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-red-500 rounded" />
                  <span className="text-white/70">No Connection</span>
                  <span className="text-red-400 ml-auto">+0</span>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-3">
                Score = Average rating + link bonuses (max 99)
              </p>
            </div>
          </div>

          {/* Right: Team Visualization with Cards */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 p-8 min-h-[550px]">
              {/* SVG for link lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {links.map((link, idx) => {
                  const from = cardPositions[link.from]
                  const to = cardPositions[link.to]
                  // Offset to card center
                  const x1 = from.x + 70
                  const y1 = from.y + 100
                  const x2 = to.x + 70
                  const y2 = to.y + 100
                  
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={getLinkColor(link.type)}
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.8}
                    />
                  )
                })}
              </svg>

              {/* Player Cards */}
              {cardPositions.map((pos, idx) => {
                const player = team[idx]
                
                if (!player) {
                  return (
                    <div
                      key={idx}
                      className="absolute w-36 aspect-[2/3] rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center"
                      style={{ left: pos.x, top: pos.y, zIndex: 2 }}
                    >
                      <span className="text-white/30 text-sm">Slot {idx + 1}</span>
                    </div>
                  )
                }

                const style = getCardStyle(player.averageRating)
                const avatarSrc = player.avatar || getDefaultAvatar(player.category)
                const tier = getTierFromRating(player.averageRating)

                return (
                  <div
                    key={idx}
                    className={`absolute w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-2 ${style.border}`}
                    style={{ left: pos.x, top: pos.y, zIndex: 10 }}
                  >
                    {/* Background */}
                    <div className="absolute inset-0" style={{ background: style.bg }} />
                    
                    {/* Noise */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-30">
                      <filter id={`noise-team-${idx}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                      </filter>
                      <rect width="100%" height="100%" filter={`url(#noise-team-${idx})`} />
                    </svg>
                    
                    {/* Inner border */}
                    <div className="absolute inset-2 border border-dashed border-white/15 rounded-xl pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col p-3 z-20">
                      {/* Top: Rating */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className={`text-2xl font-black ${style.text} leading-none`}>
                            {Math.round(player.averageRating)}
                          </span>
                          <span className={`text-[10px] font-bold ${style.subtext} uppercase`}>
                            {categoryShort[player.category]}
                          </span>
                        </div>
                        <span className={`text-xs font-bold ${style.text} uppercase truncate max-w-[60px]`}>
                          {player.name.split(' ')[0]}
                        </span>
                      </div>
                      
                      {/* Avatar */}
                      <div className="flex-1 flex items-center justify-center py-1">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                          <Image
                            src={avatarSrc}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Bottom */}
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1">
                          {player.clanLogo && (
                            <div className="w-4 h-4 bg-black overflow-hidden">
                              <Image src={player.clanLogo} alt="" width={16} height={16} className="object-cover" />
                            </div>
                          )}
                          <Flag code={player.nationality} size="sm" />
                        </div>
                        <span className={`text-sm font-bold ${style.text}`}>{tier}</span>
                      </div>
                      
                      {/* Clan */}
                      {player.clan && (
                        <div className="mt-1 text-center">
                          <span className={`text-[9px] ${style.subtext} bg-black/30 px-1.5 py-0.5 rounded`}>
                            {player.clan}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

