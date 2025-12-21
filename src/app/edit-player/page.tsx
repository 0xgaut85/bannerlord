"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button, Card, Input } from "@/components/ui"
import { useDebounce } from "@/hooks/useDebounce"
import { COUNTRY_NAMES } from "@/lib/utils"
import { Player } from "@prisma/client"

const countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
}))

export default function EditPlayerPage() {
  const { data: session, status } = useSession()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  const [nationality, setNationality] = useState("")
  const [clan, setClan] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
  
  // Load selected player data
  useEffect(() => {
    if (selectedPlayer) {
      setNationality(selectedPlayer.nationality || "")
      setClan(selectedPlayer.clan || "")
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
      const res = await fetch(`/api/players/${selectedPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationality, clan }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update player")
      }
      
      const updatedPlayer = await res.json()
      setSelectedPlayer(updatedPlayer)
      setSaveSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Authentication Required
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1a1a1a] mb-4">
          Sign in to Edit Players
        </h1>
        <p className="text-[#5a5a5a] mb-10">
          Connect your Discord account to edit player information
        </p>
        <Button onClick={() => signIn("discord")} size="lg" variant="primary">
          Sign in with Discord
        </Button>
      </div>
    )
  }
  
  // Loading
  if (status === "loading") {
    return (
      <div className="page-transition max-w-2xl mx-auto px-6 lg:px-8 py-20">
        <div className="h-96 glass rounded-xl animate-pulse" />
      </div>
    )
  }
  
  return (
    <div className="page-transition max-w-2xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Player Management
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1a1a1a] mb-3">
          Edit Player
        </h1>
        <p className="text-[#5a5a5a]">
          Update player nationality and clan information
        </p>
      </div>
      
      {/* Search */}
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search for a player..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {(searchResults.length > 0 || isSearching) && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-10 p-2 max-h-80 overflow-y-auto shadow-xl">
            {isSearching ? (
              <div className="py-6 text-center text-[#8a8a8a]">
                Searching...
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1a1a1a]">
                        {player.name}
                      </div>
                      <div className="text-sm text-[#8a8a8a] flex items-center gap-2">
                        <span>{player.category}</span>
                        {player.nationality && (
                          <span>{COUNTRY_NAMES[player.nationality] || player.nationality}</span>
                        )}
                        {player.clan && (
                          <span>{player.clan}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
      
      {/* Selected Player */}
      {selectedPlayer ? (
        <Card>
          <div className="mb-6 pb-6 border-b border-white/30">
            <h2 className="font-display text-2xl font-semibold text-[#1a1a1a] mb-1">
              {selectedPlayer.name}
            </h2>
            <p className="text-[#8a8a8a]">
              {selectedPlayer.category}
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Nationality
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]/50 text-[#1a1a1a] transition-all duration-300"
              >
                <option value="">Select nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              id="clan"
              label="Clan"
              placeholder="Enter clan name"
              value={clan}
              onChange={(e) => setClan(e.target.value)}
            />
            
            {/* Error */}
            {error && (
              <div className="p-4 glass rounded-xl border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {/* Success */}
            {saveSuccess && (
              <div className="p-4 glass rounded-xl border border-[#c9a962]/30 text-[#a68b47] text-sm">
                Player updated successfully
              </div>
            )}
            
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="w-full"
              size="lg"
              variant="primary"
            >
              Save Changes
            </Button>
          </div>
        </Card>
      ) : (
        <div className="text-center py-16 text-[#8a8a8a]">
          <p className="font-display text-xl mb-2">Search for a player</p>
          <p className="text-sm">
            Enter at least 2 characters to search
          </p>
        </div>
      )}
    </div>
  )
}

