"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button, Flag } from "@/components/ui"
import { useDebounce } from "@/hooks/useDebounce"
import { COUNTRY_NAMES, cn, DIVISION_DEFAULT_RATINGS } from "@/lib/utils"
import { Player, PlayerCategory, Division } from "@prisma/client"
import Image from "next/image"

const countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
}))

const categories: { value: PlayerCategory; label: string }[] = [
  { value: "INFANTRY", label: "Infantry" },
  { value: "CAVALRY", label: "Cavalry" },
  { value: "ARCHER", label: "Archer" },
]

const divisions: Division[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

interface Clan {
  id: string
  name: string
  shortName: string
  logo: string | null
}

export default function EditPlayerPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"player" | "clan">("player")
  
  // Left side - Edit existing player
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [nationality, setNationality] = useState("")
  const [clan, setClan] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [division, setDivision] = useState<Division | "">("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false)
  
  // Clan autocomplete for edit form
  const [clanOptions, setClanOptions] = useState<Clan[]>([])
  const [showClanDropdown, setShowClanDropdown] = useState(false)
  const debouncedClanInput = useDebounce(clan, 300)
  
  // Right side - User's own profile
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerCategory, setNewPlayerCategory] = useState<PlayerCategory>("INFANTRY")
  const [newPlayerDivision, setNewPlayerDivision] = useState<Division>("F")
  const [newPlayerNationality, setNewPlayerNationality] = useState("")
  const [newPlayerClan, setNewPlayerClan] = useState("")
  const [newPlayerBio, setNewPlayerBio] = useState("")
  const [newPlayerAvatar, setNewPlayerAvatar] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // New player clan autocomplete
  const [newPlayerClanOptions, setNewPlayerClanOptions] = useState<Clan[]>([])
  const [showNewPlayerClanDropdown, setShowNewPlayerClanDropdown] = useState(false)
  const debouncedNewPlayerClan = useDebounce(newPlayerClan, 300)
  
  // Clan editing
  const [clans, setClans] = useState<Clan[]>([])
  const [clanSearch, setClanSearch] = useState("")
  const [newClanName, setNewClanName] = useState("")
  const [newClanShortName, setNewClanShortName] = useState("")
  const [newClanLogo, setNewClanLogo] = useState<string | null>(null)
  const [clanError, setClanError] = useState<string | null>(null)
  const [clanSuccess, setClanSuccess] = useState(false)
  const [isCreatingClan, setIsCreatingClan] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const editAvatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedClanSearch = useDebounce(clanSearch, 300)
  
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
  
  // Clan autocomplete for edit form
  useEffect(() => {
    async function fetchClans() {
      if (debouncedClanInput.length < 1) {
        setClanOptions([])
        return
      }
      
      try {
        const res = await fetch(`/api/clans?search=${encodeURIComponent(debouncedClanInput)}`)
        if (res.ok) {
          const data = await res.json()
          setClanOptions(data)
        }
      } catch (err) {
        console.error("Clan fetch error:", err)
      }
    }
    
    fetchClans()
  }, [debouncedClanInput])
  
  // Clan autocomplete for new player form
  useEffect(() => {
    async function fetchClans() {
      if (debouncedNewPlayerClan.length < 1) {
        setNewPlayerClanOptions([])
        return
      }
      
      try {
        const res = await fetch(`/api/clans?search=${encodeURIComponent(debouncedNewPlayerClan)}`)
        if (res.ok) {
          const data = await res.json()
          setNewPlayerClanOptions(data)
        }
      } catch (err) {
        console.error("Clan fetch error:", err)
      }
    }
    
    fetchClans()
  }, [debouncedNewPlayerClan])
  
  // Search clans for clan tab
  useEffect(() => {
    async function searchClans() {
      if (debouncedClanSearch.length < 2) {
        setClans([])
        return
      }
      
      try {
        const res = await fetch(`/api/clans?search=${encodeURIComponent(debouncedClanSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setClans(data)
        }
      } catch (err) {
        console.error("Clan search error:", err)
      }
    }
    
    searchClans()
  }, [debouncedClanSearch])
  
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
      setAvatar((selectedPlayer as any).avatar || null)
      setDivision((selectedPlayer as any).division || "")
    }
  }, [selectedPlayer])
  
  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setSearchQuery("")
    setSearchResults([])
    setSaveSuccess(false)
    setError(null)
  }
  
  const handleSelectClan = (clanShortName: string) => {
    setClan(clanShortName)
    setShowClanDropdown(false)
  }
  
  const handleSelectNewPlayerClan = (clanShortName: string) => {
    setNewPlayerClan(clanShortName)
    setShowNewPlayerClanDropdown(false)
  }
  
  const handleSave = async () => {
    if (!selectedPlayer) return
    
    // Validate clan - must be existing clan, "FA", or empty
    if (clan && clan.toUpperCase() !== "FA") {
      const validClan = clanOptions.find(c => c.shortName.toUpperCase() === clan.toUpperCase())
      if (!validClan && clan !== selectedPlayer.clan) {
        setError("Please select a valid clan from the list, use 'FA' for Free Agent, or leave empty")
        return
      }
    }
    
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
          clan: clan || null,
          bio,
          avatar,
          division: division || null,
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
  
  const handleEditAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingEditAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "avatar")
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to upload")
      }
      
      const { url } = await res.json()
      setAvatar(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar")
    } finally {
      setIsUploadingEditAvatar(false)
    }
  }
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "avatar")
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to upload")
      }
      
      const { url } = await res.json()
      setNewPlayerAvatar(url)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to upload avatar")
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "clan-logo")
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to upload")
      }
      
      const { url } = await res.json()
      setNewClanLogo(url)
    } catch (err) {
      setClanError(err instanceof Error ? err.message : "Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }
  
  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      setCreateError("Please enter a name")
      return
    }
    
    // Validate clan - must be existing clan, "FA", or empty
    if (newPlayerClan && newPlayerClan.toUpperCase() !== "FA") {
      const validClan = newPlayerClanOptions.find(c => c.shortName.toUpperCase() === newPlayerClan.toUpperCase())
      if (!validClan) {
        setCreateError("Please select a valid clan from the list, use 'FA' for Free Agent, or leave empty")
        return
      }
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
          division: newPlayerDivision,
          nationality: newPlayerNationality || null,
          clan: newPlayerClan || null,
          bio: newPlayerBio || null,
          avatar: newPlayerAvatar || null,
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
      setNewPlayerAvatar(null)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }
  
  const handleCreateClan = async () => {
    if (!newClanName.trim() || !newClanShortName.trim()) {
      setClanError("Name and short name are required")
      return
    }
    
    setIsCreatingClan(true)
    setClanError(null)
    setClanSuccess(false)
    
    try {
      const res = await fetch(`/api/clans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newClanName.trim(),
          shortName: newClanShortName.trim(),
          logo: newClanLogo || null,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create clan")
      }
      
      setClanSuccess(true)
      setNewClanName("")
      setNewClanShortName("")
      setNewClanLogo(null)
    } catch (err) {
      setClanError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setIsCreatingClan(false)
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
            Sign in to Continue
        </h1>
          <p className="text-white/60 mb-10">
            Connect your Discord account to edit player and clan information
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
          Management
        </p>
        <h1 className="font-display text-4xl font-bold text-white mb-3">
          Edit Player & Clan
        </h1>
        <p className="text-white/60 mb-6">
          Update player info, register yourself, or add your clan
        </p>
        
        {/* Tab Switcher */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab("player")}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              activeTab === "player"
                ? "bg-amber-500 text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("clan")}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              activeTab === "clan"
                ? "bg-amber-500 text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            Clans
          </button>
        </div>
      </div>
      
      {activeTab === "player" ? (
        /* PLAYER TAB */
        <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - Edit Players */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-display font-bold text-white mb-6">
              Edit Player
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
                            <div className="text-white/40 text-sm">{player.category} {player.clan && `- ${player.clan}`}</div>
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
                    {avatar ? (
                      <Image src={avatar} alt={selectedPlayer.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <Flag code={selectedPlayer.nationality} size="lg" className="rounded" />
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{selectedPlayer.name}</h3>
                      <p className="text-white/40 text-sm">{selectedPlayer.category}</p>
                    </div>
                  </div>
                </div>
                
                {/* Avatar Upload */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Avatar</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={editAvatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleEditAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => editAvatarInputRef.current?.click()}
                      disabled={isUploadingEditAvatar}
                      className="w-16 h-16 rounded-lg bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden"
                    >
                      {avatar ? (
                        <Image src={avatar} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                      ) : isUploadingEditAvatar ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/40 text-2xl">+</span>
                      )}
                    </button>
                    <span className="text-white/40 text-xs">PNG or JPEG, square format</span>
                  </div>
                </div>
                
                {/* Division */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Division</label>
                  <div className="grid grid-cols-5 gap-2">
                    {divisions.map((div) => (
                      <button
                        key={div}
                        onClick={() => setDivision(div)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg font-bold transition-all text-sm",
                          division === div
                            ? "bg-amber-500 text-black"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        )}
                      >
                        {div}
                      </button>
                    ))}
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
            
                {/* Clan with autocomplete */}
                <div className="relative">
                  <label className="block text-white/70 text-sm mb-2">Clan (type to search, or use &quot;FA&quot; for Free Agent)</label>
                  <input
                    type="text"
                    placeholder="Search clan or type FA..."
              value={clan}
                    onChange={(e) => {
                      setClan(e.target.value.toUpperCase())
                      setShowClanDropdown(true)
                    }}
                    onFocus={() => setShowClanDropdown(true)}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                  />
                  
                  {showClanDropdown && (clanOptions.length > 0 || clan.length >= 1) && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-800 rounded-xl border border-white/20 p-2 max-h-40 overflow-y-auto shadow-xl">
                      {/* FA option always available */}
                      <button
                        onClick={() => handleSelectClan("FA")}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">FA</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">Free Agent</div>
                          <div className="text-white/40 text-xs">No clan</div>
                        </div>
                      </button>
                      
                      {clanOptions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectClan(c.shortName)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          {c.logo ? (
                            <Image src={c.logo} alt={c.name} width={32} height={32} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 text-xs font-bold">{c.shortName.slice(0, 2)}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{c.name}</div>
                            <div className="text-white/40 text-xs">{c.shortName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                    Request submitted! An admin will review your changes.
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
            <h2 className="text-xl font-display font-bold text-amber-400 mb-6">
              Your Profile
            </h2>
            
            {myPlayer ? (
              // User is already a player
              <div className="space-y-6">
                <div className="bg-black/20 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {(myPlayer as any).avatar ? (
                      <Image 
                        src={(myPlayer as any).avatar} 
                        alt={myPlayer.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <Flag code={myPlayer.nationality} size="xl" className="rounded shadow-md" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{myPlayer.name}</h3>
                  <p className="text-amber-400 font-medium">{myPlayer.category}</p>
                  {myPlayer.clan && <p className="text-white/60 mt-1">{myPlayer.clan}</p>}
                  {(myPlayer as any).division && <p className="text-white/40 text-sm mt-1">Division {(myPlayer as any).division}</p>}
                  {myPlayer.bio && (
                    <p className="text-white/40 text-sm mt-4 italic">&ldquo;{myPlayer.bio}&rdquo;</p>
                  )}
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/60 text-sm">
                    You&apos;re registered! To update your info (avatar, division, clan, bio), search for yourself on the left and submit an edit request.
                  </p>
                </div>
              </div>
            ) : (
              // User is not a player yet - registration form
              <div className="space-y-4">
                <p className="text-white/60 text-sm mb-4">
                  Not listed yet? Register yourself to appear in the rankings!
                </p>
                
                {/* Avatar Upload */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Avatar (optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="w-16 h-16 rounded-lg bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden"
                    >
                      {newPlayerAvatar ? (
                        <Image src={newPlayerAvatar} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                      ) : isUploadingAvatar ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/40 text-2xl">+</span>
                      )}
                    </button>
                    <span className="text-white/40 text-xs">PNG or JPEG, square</span>
                  </div>
                </div>
                
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
                          "px-4 py-3 rounded-xl font-medium transition-all text-sm",
                          newPlayerCategory === cat.value
                            ? "bg-amber-500 text-black"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm mb-2">Division * (Default rating: {DIVISION_DEFAULT_RATINGS[newPlayerDivision]})</label>
                  <div className="grid grid-cols-5 gap-2">
                    {divisions.map((div) => (
                      <button
                        key={div}
                        onClick={() => setNewPlayerDivision(div)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg font-bold transition-all text-sm",
                          newPlayerDivision === div
                            ? "bg-amber-500 text-black"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        )}
                      >
                        {div}
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
                
                {/* Clan with autocomplete */}
                <div className="relative">
                  <label className="block text-white/70 text-sm mb-2">Clan (type to search, or use &quot;FA&quot; for Free Agent)</label>
                  <input
                    type="text"
                    placeholder="Search clan or type FA..."
                    value={newPlayerClan}
                    onChange={(e) => {
                      setNewPlayerClan(e.target.value.toUpperCase())
                      setShowNewPlayerClanDropdown(true)
                    }}
                    onFocus={() => setShowNewPlayerClanDropdown(true)}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                  />
                  
                  {showNewPlayerClanDropdown && (newPlayerClanOptions.length > 0 || newPlayerClan.length >= 1) && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-800 rounded-xl border border-white/20 p-2 max-h-40 overflow-y-auto shadow-xl">
                      {/* FA option always available */}
                      <button
                        onClick={() => handleSelectNewPlayerClan("FA")}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">FA</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">Free Agent</div>
                          <div className="text-white/40 text-xs">No clan</div>
                        </div>
                      </button>
                      
                      {newPlayerClanOptions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectNewPlayerClan(c.shortName)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          {c.logo ? (
                            <Image src={c.logo} alt={c.name} width={32} height={32} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 text-xs font-bold">{c.shortName.slice(0, 2)}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{c.name}</div>
                            <div className="text-white/40 text-xs">{c.shortName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm mb-2">Bio <span className="text-white/40">({newPlayerBio.length}/240)</span></label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={newPlayerBio}
                    onChange={(e) => setNewPlayerBio(e.target.value.slice(0, 240))}
                    maxLength={240}
                    rows={2}
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
                    You&apos;ve been registered! You&apos;ll appear in rankings with default rating {DIVISION_DEFAULT_RATINGS[newPlayerDivision]}.
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
      ) : (
        /* CLAN TAB */
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - View Clans */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-display font-bold text-white mb-6">
                Search Clans
              </h2>
              
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search by name or short name..."
                  value={clanSearch}
                  onChange={(e) => setClanSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              {clans.length > 0 ? (
                <div className="space-y-3">
                  {clans.map((c) => (
                    <div 
                      key={c.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      {c.logo ? (
                        <Image src={c.logo} alt={c.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-bold">{c.shortName.slice(0, 2)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold">{c.name}</h3>
                        <p className="text-white/40 text-sm">{c.shortName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : clanSearch.length >= 2 ? (
                <div className="text-center py-8 text-white/40">
                  No clans found
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>
            
            {/* Right - Add Clan */}
            <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
              <h2 className="text-xl font-display font-bold text-amber-400 mb-6">
                Add New Clan
              </h2>
              
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Clan Logo (optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="w-16 h-16 rounded-lg bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden"
                    >
                      {newClanLogo ? (
                        <Image src={newClanLogo} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                      ) : isUploadingLogo ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/40 text-2xl">+</span>
                      )}
                    </button>
                    <span className="text-white/40 text-xs">PNG or JPEG, square</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm mb-2">Clan Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Vineyard Workers"
                    value={newClanName}
                    onChange={(e) => setNewClanName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm mb-2">Short Name * (used in rankings)</label>
                  <input
                    type="text"
                    placeholder="e.g. VW"
                    value={newClanShortName}
                    onChange={(e) => setNewClanShortName(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                  />
                </div>
                
                {clanError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                    {clanError}
                  </div>
                )}
                
                {clanSuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-sm">
                    Clan created successfully!
                  </div>
                )}
                
                <Button
                  onClick={handleCreateClan}
                  isLoading={isCreatingClan}
                  className="w-full !bg-amber-500 !text-black hover:!bg-amber-400"
                >
                  Create Clan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
