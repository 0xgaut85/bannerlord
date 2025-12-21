"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useDebounce } from "@/hooks/useDebounce"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [search, setSearch] = useState("")
  const [players, setPlayers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("players")
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "godmode" && password === "godmode123*") {
      setIsAuthenticated(true)
      fetchPlayers()
      fetchRequests()
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

  // Effect to refetch when search changes
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
        fetchPlayers()
      } else {
        alert("Failed to update player")
      }
    } catch (error) {
      alert("Error updating player")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-display text-center mb-6 text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8a8a8a] mb-1">Username</label>
              <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a8a] mb-1">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display text-white">Admin Panel</h1>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "players" ? "primary" : "outline"} 
                onClick={() => setActiveTab("players")}
              >
                Players
              </Button>
              <Button 
                variant={activeTab === "requests" ? "primary" : "outline"} 
                onClick={() => setActiveTab("requests")}
                className="relative"
              >
                Requests
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                    {requests.length}
                  </span>
                )}
              </Button>
            </div>
            <Button onClick={() => setIsAuthenticated(false)} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {activeTab === "requests" && (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-[#111] p-4 rounded-lg border border-[#222]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-white text-lg">
                      Edit for: {request.player.name}
                    </h3>
                    <p className="text-sm text-[#8a8a8a]">
                      Submitted by: {request.user.discordName || request.user.name}
                    </p>
                  </div>
                  <Badge variant="outline">PENDING</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="block text-[#8a8a8a] mb-1">Current</span>
                    <div className="text-white">
                      <p>Nationality: {request.player.nationality || "None"}</p>
                      <p>Clan: {request.player.clan || "None"}</p>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[#c9a962] mb-1">Suggested</span>
                    <div className="text-white">
                      <p>Nationality: {request.suggestedNationality || "No Change"}</p>
                      <p>Clan: {request.suggestedClan || "No Change"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    size="sm" 
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    onClick={() => handleRequestAction(request.id, "reject")}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    onClick={() => handleRequestAction(request.id, "approve")}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center text-[#555] py-8">No pending requests</div>
            )}
          </div>
        )}

        {activeTab === "players" && (
          <>
            <div className="mb-6">
              <Input
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>

            {editingPlayer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-xl font-display text-white mb-4">Edit Player: {editingPlayer.name}</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8a8a8a] mb-1">Clan</label>
                  <Input
                    value={editingPlayer.clan || ""}
                    onChange={(e) => setEditingPlayer({...editingPlayer, clan: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a8a] mb-1">Nationality (ISO Code)</label>
                  <Input
                    value={editingPlayer.nationality || ""}
                    onChange={(e) => setEditingPlayer({...editingPlayer, nationality: e.target.value})}
                    maxLength={2}
                  />
                  <p className="text-xs text-[#5a5a5a] mt-1">e.g. FR, DE, US, TR</p>
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a8a] mb-1">Category</label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a962]"
                    value={editingPlayer.category}
                    onChange={(e) => setEditingPlayer({...editingPlayer, category: e.target.value})}
                  >
                    <option value="INFANTRY">INFANTRY</option>
                    <option value="CAVALRY">CAVALRY</option>
                    <option value="ARCHER">ARCHER</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setEditingPlayer(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
          {players.map((player) => (
            <div key={player.id} className="bg-[#111] p-4 rounded-lg flex items-center justify-between border border-[#222]">
              <div>
                <h3 className="font-medium text-white text-lg">{player.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{player.category}</Badge>
                  {player.clan && <Badge variant="secondary" className="text-xs">{player.clan}</Badge>}
                  {player.nationality && <span className="text-sm">{player.nationality}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingPlayer(player)}>
                  Edit
                </Button>
                <Button size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => handleDelete(player.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {players.length === 0 && !loading && (
            <div className="text-center text-[#555] py-8">No players found</div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}

