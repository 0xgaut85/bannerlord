"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button, Flag } from "@/components/ui"
import { FifaCard, EligibilityProgress } from "@/components/rating"
import { MIN_RATINGS } from "@/lib/utils"
import { Player, Division } from "@prisma/client"
import { useDebounce } from "@/hooks/useDebounce"

interface RatingMap {
  [playerId: string]: number
}

// Display divisions for filter buttons (H+ covers H, I, J)
const DIVISION_BUTTONS = ["A", "B", "C", "D", "E", "F", "G", "H+"] as const
type DivisionButton = typeof DIVISION_BUTTONS[number]
const CATEGORIES = ["ALL", "INFANTRY", "CAVALRY", "ARCHER"] as const

export default function RatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings] = useState<RatingMap>({})
  const [originalRatings, setOriginalRatings] = useState<RatingMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  // Filters
  const [selectedDivisions, setSelectedDivisions] = useState<DivisionButton[]>([])
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("ALL")
  
  // Search
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Eligibility calculation
  const eligibility = {
    isEligible: false,
    infantry: { current: 0, required: MIN_RATINGS.INFANTRY },
    cavalry: { current: 0, required: MIN_RATINGS.CAVALRY },
    archer: { current: 0, required: MIN_RATINGS.ARCHER },
  }
  
  // Count ratings per category
  Object.keys(ratings).forEach(playerId => {
    const player = players.find(p => p.id === playerId)
    if (player) {
      if (player.category === "INFANTRY") eligibility.infantry.current++
      else if (player.category === "CAVALRY") eligibility.cavalry.current++
      else if (player.category === "ARCHER") eligibility.archer.current++
    }
  })
  
  eligibility.isEligible = 
    eligibility.infantry.current >= eligibility.infantry.required &&
    eligibility.cavalry.current >= eligibility.cavalry.required &&
    eligibility.archer.current >= eligibility.archer.required
  
  // Fetch players and existing ratings
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const playersRes = await fetch("/api/players")
        if (playersRes.ok) {
          const playersData = await playersRes.json()
          const shuffled = [...playersData].sort(() => Math.random() - 0.5)
          setPlayers(shuffled)
          setFilteredPlayers(shuffled)
        }
        
        if (session?.user?.id) {
          const ratingsRes = await fetch("/api/ratings")
          if (ratingsRes.ok) {
            const ratingsData = await ratingsRes.json()
            const ratingsMap: RatingMap = {}
            ratingsData.forEach((r: { playerId: string; score: number }) => {
              ratingsMap[r.playerId] = r.score
            })
            setRatings(ratingsMap)
            setOriginalRatings(ratingsMap)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status !== "loading") {
      fetchData()
    }
  }, [session?.user?.id, status])
  
  // Apply filters
  useEffect(() => {
    let filtered = [...players]
    
    // Filter by division (API now returns calculated division for all players)
    if (selectedDivisions.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.division) return false
        // Check if player's division matches any selected division
        for (const sel of selectedDivisions) {
          if (sel === "H+") {
            // H+ matches H, I, J
            if (p.division === "H" || p.division === "I" || p.division === "J") return true
          } else if (p.division === sel) {
            return true
          }
        }
        return false
      })
    }
    
    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    setFilteredPlayers(filtered)
    setCurrentIndex(0)
  }, [players, selectedDivisions, selectedCategory])
  
  // Search players
  useEffect(() => {
    async function searchPlayers() {
      if (debouncedSearch.length < 2) {
        setSearchResults([])
        return
      }
      
      setIsSearching(true)
      try {
        const res = await fetch(`/api/players?search=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.slice(0, 10))
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }
    
    searchPlayers()
  }, [debouncedSearch])
  
  const toggleDivision = (division: DivisionButton) => {
    setSelectedDivisions(prev => 
      prev.includes(division) 
        ? prev.filter(d => d !== division)
        : [...prev, division]
    )
  }
  
  const currentPlayer = filteredPlayers[currentIndex]
  
  const handleRatingChange = useCallback((value: number) => {
    if (currentPlayer) {
      setRatings(prev => ({
        ...prev,
        [currentPlayer.id]: value
      }))
    }
  }, [currentPlayer])
  
  const handleValidate = useCallback(async () => {
    if (!currentPlayer) return
    
    // Save immediately when validating
    setIsSaving(true)
    setSaveMessage(null)
    setError(null)
    
    try {
      const ratingsToSend = Object.entries(ratings).map(([playerId, score]) => ({
        playerId,
        score,
      }))
      
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings: ratingsToSend }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save")
      }
      
      setOriginalRatings({ ...ratings })
      setSaveMessage("Rating saved!")
      
      // Move to next player
      setTimeout(() => {
        setSaveMessage(null)
        if (currentIndex < filteredPlayers.length - 1) {
          setCurrentIndex(i => i + 1)
        } else {
          setCurrentIndex(0)
        }
      }, 300)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }, [currentPlayer, ratings, currentIndex, filteredPlayers.length])
  
  const handleSkip = useCallback(() => {
    if (currentIndex < filteredPlayers.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setCurrentIndex(0)
    }
  }, [currentIndex, filteredPlayers.length])
  
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }, [currentIndex])
  
  const handleSelectPlayer = (player: Player) => {
    const idx = filteredPlayers.findIndex(p => p.id === player.id)
    if (idx !== -1) {
      setCurrentIndex(idx)
    } else {
      // Player not in filtered list, clear filters and find in all players
      setSelectedDivisions([])
      setSelectedCategory("ALL")
      const allIdx = players.findIndex(p => p.id === player.id)
      if (allIdx !== -1) {
        setCurrentIndex(allIdx)
      }
    }
    setSearchQuery("")
    setSearchResults([])
  }
  
  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Authentication Required
          </p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Sign in to Rate Players
          </h1>
          <p className="text-white/60 mb-10">
            Connect your Discord account to create your own player rankings
          </p>
          <Button onClick={() => signIn("discord")} size="lg" variant="primary" className="!bg-amber-500 !text-black hover:!bg-amber-400">
            Sign in with Discord
          </Button>
        </div>
      </div>
    )
  }
  
  // Profile not complete
  if (session && !session.user?.isProfileComplete) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Profile Setup
          </p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Complete Your Profile
          </h1>
          <p className="text-white/60 mb-10">
            Please set your team and division before rating players
          </p>
          <Button onClick={() => router.push("/profile")} size="lg" variant="primary" className="!bg-amber-500 !text-black hover:!bg-amber-400">
            Go to Profile
          </Button>
        </div>
      </div>
    )
  }
  
  // Loading
  if (status === "loading" || isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col overflow-hidden">
      {/* Compact Top Bar */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-lg font-display font-bold text-white shrink-0">Rate Players</h1>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 rounded-lg border border-white/20 p-1 max-h-60 overflow-y-auto shadow-xl">
                {isSearching ? (
                  <div className="py-3 text-center text-white/40 text-sm">Searching...</div>
                ) : (
                  <div className="space-y-0.5">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player)}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors text-left"
                      >
                        <Flag code={player.nationality} size="sm" />
                        <span className="text-white text-sm truncate">{player.name}</span>
                        <span className="text-white/40 text-xs ml-auto">{player.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <EligibilityProgress status={eligibility} dark />
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-black/10 border-b border-white/5 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
          {/* Division Filters */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-medium">Division:</span>
            {DIVISION_BUTTONS.map(div => (
              <button
                key={div}
                onClick={() => toggleDivision(div)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  selectedDivisions.includes(div)
                    ? "bg-amber-500 text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {div}
              </button>
            ))}
            {selectedDivisions.length > 0 && (
              <button
                onClick={() => setSelectedDivisions([])}
                className="px-2 py-0.5 text-xs text-white/40 hover:text-white/60"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-white/40 text-xs font-medium">Class:</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          
          {/* Player count */}
          <div className="ml-auto text-white/40 text-xs">
            {filteredPlayers.length} players
          </div>
        </div>
      </div>
      
      {/* Note about eligibility */}
      {!eligibility.isEligible && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-center">
          <p className="text-amber-400 text-xs">
            Rate at least {MIN_RATINGS.INFANTRY} infantry, {MIN_RATINGS.CAVALRY} cavalry, and {MIN_RATINGS.ARCHER} archers to have your ratings count
          </p>
        </div>
      )}
      
      {/* Messages */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center text-sm">
          {error}
        </div>
      )}
      {saveMessage && (
        <div className="mx-4 mt-2 p-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center text-sm">
          {saveMessage}
        </div>
      )}
      
      {/* Main Card Area - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        {filteredPlayers.length > 0 && currentPlayer ? (
          <FifaCard
            player={currentPlayer}
            currentRating={ratings[currentPlayer.id] || 75}
            onRatingChange={handleRatingChange}
            onSkip={handleSkip}
            onValidate={handleValidate}
            onPrevious={handlePrevious}
            hasPrevious={currentIndex > 0}
            currentIndex={currentIndex}
            totalPlayers={filteredPlayers.length}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-16 text-white/60">
            <p className="font-display text-2xl">
              {players.length === 0 ? "No players yet" : "No players match your filters"}
            </p>
            {filteredPlayers.length === 0 && players.length > 0 && (
              <button
                onClick={() => { setSelectedDivisions([]); setSelectedCategory("ALL") }}
                className="mt-4 text-amber-500 hover:text-amber-400 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
