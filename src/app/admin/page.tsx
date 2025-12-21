"use client"

import { useState, useEffect } from "react"
import { Button, Flag } from "@/components/ui"
import { useDebounce } from "@/hooks/useDebounce"
import { COUNTRY_NAMES } from "@/lib/utils"

const countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
}))

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [search, setSearch] = useState("")
  const [players, setPlayers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("players")
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Country search
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 10)

  const debouncedSearch = useDebounce(search, 500)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "godmode" && password === "godmode123*") {
      setIsAuthenticated(true)
      fetchPlayers()
      fetchRequests()
      fetchUsers()
    } else {
      alert("Invalid credentials")
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests?status=PENDING")
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Failed to fetch requests", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    }
  }

  const fetchUserRatings = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedUser(data)
      }
    } catch (error) {
      console.error("Failed to fetch user ratings", error)
    }
  }

  const deleteUserRatings = async (userId: string) => {
    if (!confirm("Are you sure you want to delete ALL ratings from this user? This cannot be undone.")) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        alert("All ratings deleted successfully")
        setSelectedUser(null)
        fetchUsers()
      } else {
        alert("Failed to delete ratings")
      }
    } catch (error) {
      alert("Error deleting ratings")
    }
  }

  const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== requestId))
      }
    } catch (error) {
      alert("Action failed")
    }
  }

  const fetchPlayers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/players?search=${search}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error("Failed to fetch players", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlayers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, isAuthenticated])

  const handleDelete = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPlayers(players.filter(p => p.id !== playerId))
      } else {
        alert("Failed to delete player")
      }
    } catch (error) {
      alert("Error deleting player")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlayer) return

    try {
      const res = await fetch(`/api/admin/players/${editingPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clan: editingPlayer.clan,
          nationality: editingPlayer.nationality,
          category: editingPlayer.category,
        }),
      })
      
      if (res.ok) {
        setEditingPlayer(null)
        setCountrySearch("")
        fetchPlayers()
      } else {
        alert("Failed to update player")
      }
    } catch (error) {
      alert("Error updating player")
    }
  }
  
  const selectCountry = (code: string) => {
    setEditingPlayer({...editingPlayer, nationality: code})
    setShowCountryDropdown(false)
    setCountrySearch("")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <h1 className="text-2xl font-display text-center mb-2 text-white">Admin Login</h1>
          <p className="text-white/50 text-center text-sm mb-8">Enter your credentials to access the admin panel</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Enter password"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full !bg-amber-500 !text-black hover:!bg-amber-400 mt-6">
              Login
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display text-white">Admin Panel</h1>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "players" ? "primary" : "ghost"} 
                onClick={() => setActiveTab("players")}
                className={activeTab === "players" ? "!bg-amber-500 !text-black" : "!bg-white/10 !text-white"}
              >
                Players
              </Button>
              <Button 
                variant={activeTab === "requests" ? "primary" : "ghost"} 
                onClick={() => setActiveTab("requests")}
                className={`relative ${activeTab === "requests" ? "!bg-amber-500 !text-black" : "!bg-white/10 !text-white"}`}
              >
                Requests
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {requests.length}
                  </span>
                )}
              </Button>
              <Button 
                variant={activeTab === "users" ? "primary" : "ghost"} 
                onClick={() => setActiveTab("users")}
                className={activeTab === "users" ? "!bg-amber-500 !text-black" : "!bg-white/10 !text-white"}
              >
                User Lists
              </Button>
            </div>
            <Button onClick={() => setIsAuthenticated(false)} className="!bg-white/10 !text-white hover:!bg-white/20">
              Logout
            </Button>
          </div>
        </div>

        {activeTab === "requests" && (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-white text-lg">
                      Edit for: {request.player.name}
                    </h3>
                    <p className="text-sm text-white/50">
                      Submitted by: {request.user.discordName || request.user.name}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
                    PENDING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-black/20 rounded-lg p-3">
                    <span className="block text-white/50 mb-2 text-xs uppercase tracking-wide">Current</span>
                    <div className="text-white space-y-1">
                      <p>Nationality: {request.player.nationality || "None"}</p>
                      <p>Clan: {request.player.clan || "None"}</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <span className="block text-green-400 mb-2 text-xs uppercase tracking-wide">Suggested</span>
                    <div className="text-white space-y-1">
                      <p>Nationality: {request.suggestedNationality || "No Change"}</p>
                      <p>Clan: {request.suggestedClan || "No Change"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    size="sm" 
                    className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30"
                    onClick={() => handleRequestAction(request.id, "reject")}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="!bg-green-500/20 !text-green-400 hover:!bg-green-500/30"
                    onClick={() => handleRequestAction(request.id, "approve")}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center text-white/40 py-12">No pending requests</div>
            )}
          </div>
        )}

        {activeTab === "players" && (
          <>
            <div className="mb-6">
              <input
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {editingPlayer && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-display text-white mb-6">Edit Player: {editingPlayer.name}</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Clan</label>
                      <input
                        value={editingPlayer.clan || ""}
                        onChange={(e) => setEditingPlayer({...editingPlayer, clan: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm text-white/70 mb-2">Nationality</label>
                      <div className="flex gap-2 items-center">
                        <input
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value)
                            setShowCountryDropdown(true)
                          }}
                          onFocus={() => setShowCountryDropdown(true)}
                          placeholder="Type country name..."
                          className="flex-1 px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        {editingPlayer.nationality && (
                          <div className="flex items-center gap-2 bg-slate-900 border border-white/20 rounded-xl px-4 py-2">
                            <Flag code={editingPlayer.nationality} size="md" />
                            <span className="text-white text-sm">{editingPlayer.nationality.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      
                      {showCountryDropdown && countrySearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 rounded-xl border border-white/20 p-2 max-h-60 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => selectCountry(country.code)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                            >
                              <Flag code={country.code} size="md" />
                              <span className="text-white">{country.name}</span>
                              <span className="text-white/40 text-sm ml-auto">{country.code.toUpperCase()}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className="text-white/40 text-center py-2">No countries found</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Category</label>
                      <select
                        className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                        value={editingPlayer.category}
                        onChange={(e) => setEditingPlayer({...editingPlayer, category: e.target.value})}
                      >
                        <option value="INFANTRY">INFANTRY</option>
                        <option value="CAVALRY">CAVALRY</option>
                        <option value="ARCHER">ARCHER</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                      <Button type="button" onClick={() => { setEditingPlayer(null); setCountrySearch("") }} className="!bg-white/10 !text-white hover:!bg-white/20">
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" className="!bg-amber-500 !text-black hover:!bg-amber-400">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {players.map((player) => (
                <div key={player.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-3">
                    <Flag code={player.nationality} size="md" />
                    <div>
                      <h3 className="font-medium text-white">{player.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-white/10 text-white/70 rounded text-xs">{player.category}</span>
                        {player.clan && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{player.clan}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="!bg-white/10 !text-white hover:!bg-white/20" onClick={() => setEditingPlayer(player)}>
                      Edit
                    </Button>
                    <Button size="sm" className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30" onClick={() => handleDelete(player.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {players.length === 0 && !loading && (
                <div className="text-center text-white/40 py-12">No players found</div>
              )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            {selectedUser ? (
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-2">
                      {selectedUser.discordName || selectedUser.name}
                    </h2>
                    <p className="text-white/50">
                      Division: {selectedUser.division || "N/A"} | Total Ratings: {selectedUser.ratings.length}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30"
                      onClick={() => deleteUserRatings(selectedUser.id)}
                    >
                      Delete All Ratings
                    </Button>
                    <Button 
                      className="!bg-white/10 !text-white hover:!bg-white/20"
                      onClick={() => setSelectedUser(null)}
                    >
                      Back
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {selectedUser.ratings.map((rating: any) => (
                    <div key={rating.id} className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Flag code={rating.player.nationality} size="md" />
                        <div>
                          <h3 className="text-white font-medium">{rating.player.name}</h3>
                          <p className="text-white/40 text-sm">
                            {rating.player.category} {rating.player.clan && `• ${rating.player.clan}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-amber-500">
                        {rating.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium text-lg">
                        {user.discordName || user.name || "Unknown User"}
                      </h3>
                      <p className="text-white/50 text-sm">
                        Division: {user.division || "N/A"} | Ratings: {user._count.ratings}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      className="!bg-amber-500/20 !text-amber-400 hover:!bg-amber-500/30"
                      onClick={() => fetchUserRatings(user.id)}
                    >
                      View List
                    </Button>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center text-white/40 py-12">No users found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
