"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button, Card, Input, Flag } from "@/components/ui"
import { useDebounce } from "@/hooks/useDebounce"
import { COUNTRY_NAMES, cn } from "@/lib/utils"
import { Player, PlayerCategory } from "@prisma/client"

const countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
}))

const categories: { value: PlayerCategory; label: string; icon: string }[] = [
  { value: "INFANTRY", label: "Infantry", icon: "⚔️" },
  { value: "CAVALRY", label: "Cavalry", icon: "🐎" },
  { value: "ARCHER", label: "Archer", icon: "🏹" },
]

export default function EditPlayerPage() {
  const { data: session, status } = useSession()
  
  // Left side - Edit existing player
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [nationality, setNationality] = useState("")
  const [clan, setClan] = useState("")
  const [bio, setBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Right side - User's own profile
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerCategory, setNewPlayerCategory] = useState<PlayerCategory>("INFANTRY")
  const [newPlayerNationality, setNewPlayerNationality] = useState("")
  const [newPlayerClan, setNewPlayerClan] = useState("")
  const [newPlayerBio, setNewPlayerBio] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
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
          setSearchResults(data)
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }
    
    searchPlayers()
  }, [debouncedSearch])
  
  // Check if user is already a player
  useEffect(() => {
    async function checkMyPlayer() {
      if (!session?.user?.discordName) return
      
      try {
        const res = await fetch(`/api/players?search=${encodeURIComponent(session.user.discordName)}`)
        if (res.ok) {
          const data = await res.json()
          const match = data.find((p: Player) => 
            p.name.toLowerCase() === session.user.discordName?.toLowerCase()
          )
          if (match) {
            setMyPlayer(match)
          }
        }
      } catch (err) {
        console.error("Error checking player:", err)
      }
    }
    
    if (session?.user?.discordName) {
      checkMyPlayer()
    }
  }, [session?.user?.discordName])
  
  // Load selected player data
  useEffect(() => {
    if (selectedPlayer) {
      setNationality(selectedPlayer.nationality || "")
      setClan(selectedPlayer.clan || "")
      setBio(selectedPlayer.bio || "")
    }
  }, [selectedPlayer])
  
  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setSearchQuery("")
    setSearchResults([])
    setSaveSuccess(false)
    setError(null)
  }
  
  const handleSave = async () => {
    if (!selectedPlayer) return
    
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)
    
    try {
      const res = await fetch(`/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId: selectedPlayer.id,
          nationality, 
          clan,
          bio 
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit request")
      }
      
      setSaveSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      setCreateError("Please enter a name")
      return
    }
    
    setIsCreating(true)
    setCreateError(null)
    setCreateSuccess(false)
    
    try {
      const res = await fetch(`/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newPlayerName.trim(),
          category: newPlayerCategory,
          nationality: newPlayerNationality || null,
          clan: newPlayerClan || null,
          bio: newPlayerBio || null,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create player")
      }
      
      const newPlayer = await res.json()
      setMyPlayer(newPlayer)
      setCreateSuccess(true)
      setNewPlayerName("")
      setNewPlayerNationality("")
      setNewPlayerClan("")
      setNewPlayerBio("")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }
  
  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
            Authentication Required
          </p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Sign in to Edit Players
          </h1>
          <p className="text-white/60 mb-10">
            Connect your Discord account to edit player information
          </p>
          <Button onClick={() => signIn("discord")} size="lg" className="!bg-amber-500 !text-black hover:!bg-amber-400">
            Sign in with Discord
          </Button>
        </div>
      </div>
    )
  }
  
  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="text-center py-12">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
          Player Management
        </p>
        <h1 className="font-display text-4xl font-bold text-white mb-3">
          Edit & Register
        </h1>
        <p className="text-white/60">
          Update player info or register yourself
        </p>
      </div>
      
      {/* Split Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT SIDE - Edit Players */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            ✏️ Edit Player
          </h2>
          
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for a player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-slate-800 rounded-xl border border-white/20 p-2 max-h-60 overflow-y-auto shadow-xl">
                {isSearching ? (
                  <div className="py-4 text-center text-white/40">Searching...</div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <Flag code={player.nationality} size="md" className="rounded" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{player.name}</div>
                          <div className="text-white/40 text-sm">{player.category} {player.clan && `• ${player.clan}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected Player Form */}
          {selectedPlayer ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Flag code={selectedPlayer.nationality} size="lg" className="rounded" />
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selectedPlayer.name}</h3>
                    <p className="text-white/40 text-sm">{selectedPlayer.category}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Nationality</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="">Select nationality</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Clan</label>
                <input
                  type="text"
                  placeholder="Enter clan name"
                  value={clan}
                  onChange={(e) => setClan(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Bio <span className="text-white/40">({bio.length}/240)</span></label>
                <textarea
                  placeholder="Write a short bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 240))}
                  maxLength={240}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              {saveSuccess && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-sm">
                  ✓ Request submitted! An admin will review your changes.
                </div>
              )}
              
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="w-full !bg-amber-500 !text-black hover:!bg-amber-400"
              >
                Submit Edit Request
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <p className="text-lg mb-2">Search for a player above</p>
              <p className="text-sm">Enter at least 2 characters</p>
            </div>
          )}
        </div>
        
        {/* RIGHT SIDE - User Dashboard */}
        <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <h2 className="text-xl font-display font-bold text-amber-400 mb-6 flex items-center gap-2">
            👤 Your Profile
          </h2>
          
          {myPlayer ? (
            // User is already a player
            <div className="space-y-6">
              <div className="bg-black/20 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Flag code={myPlayer.nationality} size="xl" className="rounded shadow-md" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{myPlayer.name}</h3>
                <p className="text-amber-400 font-medium">{myPlayer.category}</p>
                {myPlayer.clan && <p className="text-white/60 mt-1">{myPlayer.clan}</p>}
                {myPlayer.bio && (
                  <p className="text-white/40 text-sm mt-4 italic">&ldquo;{myPlayer.bio}&rdquo;</p>
                )}
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-sm">
                  You&apos;re registered as a player! To update your info, search for yourself on the left and submit an edit request.
                </p>
              </div>
            </div>
          ) : (
            // User is not a player yet - registration form
            <div className="space-y-4">
              <p className="text-white/60 text-sm mb-4">
                Not listed yet? Register yourself to appear in the rankings!
              </p>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Your In-Game Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Class *</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setNewPlayerCategory(cat.value)}
                      className={cn(
                        "px-4 py-3 rounded-xl font-medium transition-all",
                        newPlayerCategory === cat.value
                          ? "bg-amber-500 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      )}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Nationality</label>
                <select
                  value={newPlayerNationality}
                  onChange={(e) => setNewPlayerNationality(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="">Select nationality</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Clan</label>
                <input
                  type="text"
                  placeholder="Enter your clan"
                  value={newPlayerClan}
                  onChange={(e) => setNewPlayerClan(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Bio <span className="text-white/40">({newPlayerBio.length}/240)</span></label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={newPlayerBio}
                  onChange={(e) => setNewPlayerBio(e.target.value.slice(0, 240))}
                  maxLength={240}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>
              
              {createError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {createError}
                </div>
              )}
              
              {createSuccess && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-sm">
                  ✓ You&apos;ve been registered! You&apos;ll appear in rankings once you receive ratings.
                </div>
              )}
              
              <Button
                onClick={handleCreatePlayer}
                isLoading={isCreating}
                className="w-full !bg-amber-500 !text-black hover:!bg-amber-400"
              >
                Register Myself
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
