"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

// Types and constants
import { Tab, Category, CuratedRanking, CuratedSession, PlayerNotes, SearchPlayer, RATER_NAMES } from "./types"
import { getDefaultAvatar, categoryShort } from "./utils"

// Components
import {
  FifaDisplayCard,
  ElitePlayerCard,
  CompactPlayerCard,
  RatePlayerCard,
  DivisionAPlayersList,
  PlayerNotesModal,
  RaterBox,
  CodeEntryScreen,
  SlotSelectionScreen,
  NameEntryScreen,
} from "./components"

export default function CuratedPage() {
  // Access control state
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isStreamer, setIsStreamer] = useState(false)
  const [username, setUsername] = useState("") // The custom display name
  const [usernameSet, setUsernameSet] = useState(false)
  const [codeError, setCodeError] = useState("")

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("rankings")
  const [category, setCategory] = useState<Category>("INFANTRY")

  // Rankings state
  const [rankings, setRankings] = useState<CuratedRanking[]>([])
  const [loadingRankings, setLoadingRankings] = useState(false)

  // Rating session state
  const [activeSession, setActiveSession] = useState<CuratedSession | null>(null)
  const [myRating, setMyRating] = useState<string>("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [myConfirmed, setMyConfirmed] = useState(false)

  // Player search for streamer
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([])
  const [searching, setSearching] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  // Note state
  const [myNote, setMyNote] = useState<string>("")

  // Player notes modal
  const [selectedPlayerNotes, setSelectedPlayerNotes] = useState<PlayerNotes | null>(null)
  const [loadingNotes, setLoadingNotes] = useState(false)

  // Rater slot selection (for custom name entry)
  // selectedSlot = "Rater 1", "Rater 2", etc. or "Streamer"
  // username = the custom display name entered by the user
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [customName, setCustomName] = useState<string>("")

  // Handle code submission
  const handleCodeSubmit = () => {
    if (accessCode === "MRASH") {
      setIsAuthenticated(true)
      setIsStreamer(true)
      setSelectedSlot("Streamer") // Streamer gets the "Streamer" slot
      setCodeError("")
    } else if (accessCode === "OBELIXNW") {
      setIsAuthenticated(true)
      setIsStreamer(false)
      setCodeError("")
    } else {
      setCodeError("Invalid access code")
    }
  }

  // Fetch rankings
  const fetchRankings = useCallback(async () => {
    setLoadingRankings(true)
    try {
      const res = await fetch(`/api/curated/rankings?category=${category}`)
      if (res.ok) {
        const data = await res.json()
        setRankings(data)
      }
    } catch (error) {
      console.error("Failed to fetch rankings:", error)
    } finally {
      setLoadingRankings(false)
    }
  }, [category])

  // Fetch active session
  const fetchActiveSession = useCallback(async () => {
    try {
      const res = await fetch("/api/curated/sessions")
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data)
        
        // Sync local state with session data
        if (data && usernameSet) {
          const myData = data.ratings.find((r: any) => r.raterName === username)
          if (myData) {
            setMyRating(myData.score?.toString() || "")
            setMyNote(myData.note || "")
            setMyConfirmed(myData.confirmed || false)
          } else {
            setMyRating("")
            setMyNote("")
            setMyConfirmed(false)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error)
    }
  }, [username, usernameSet])

  // Fetch player notes
  const fetchPlayerNotes = async (playerId: string) => {
    setLoadingNotes(true)
    try {
      const res = await fetch(`/api/curated/players/${playerId}/notes`)
      if (res.ok) {
        const data = await res.json()
        setSelectedPlayerNotes(data)
      }
    } catch (error) {
      console.error("Failed to fetch player notes:", error)
    } finally {
      setLoadingNotes(false)
    }
  }

  // Search players - only Division A for curated rankings
  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&divisionA=true`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.slice(0, 10))
      }
    } catch (error) {
      console.error("Failed to search players:", error)
    } finally {
      setSearching(false)
    }
  }

  // Create session (streamer only)
  const createSession = async (playerId: string) => {
    setCreatingSession(true)
    try {
      const res = await fetch("/api/curated/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, streamerCode: accessCode })
      })
      if (res.ok) {
        const session = await res.json()
        setActiveSession(session)
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setCreatingSession(false)
    }
  }

  // Submit rating
  const submitRating = async (score: string, note?: string, confirmed?: boolean) => {
    if (!usernameSet || !activeSession) return
    if (myConfirmed && confirmed !== false) return
    
    setSubmittingRating(true)
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: score === "" ? null : parseInt(score),
          note: note !== undefined ? note : myNote,
          raterCode: accessCode,
          confirmed: confirmed ?? false
        })
      })
      setMyRating(score)
      if (confirmed !== undefined) {
        setMyConfirmed(confirmed)
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
    } finally {
      setSubmittingRating(false)
    }
  }

  // Submit note
  const submitNote = async (note: string) => {
    if (!usernameSet || !activeSession) return
    if (myConfirmed) return
    
    try {
      await fetch("/api/curated/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterName: username,
          score: myRating === "" ? null : parseInt(myRating),
          note: note,
          raterCode: accessCode,
          confirmed: false
        })
      })
    } catch (error) {
      console.error("Failed to submit note:", error)
    }
  }

  // Confirm rating
  const confirmMyRating = async () => {
    if (!myRating) return
    await submitRating(myRating, myNote, true)
  }

  // Edit rating
  const editMyRating = async () => {
    await submitRating(myRating, myNote, false)
  }

  // Confirm session (streamer only)
  const confirmSession = async () => {
    if (!isStreamer || !activeSession) return
    setConfirming(true)
    try {
      const res = await fetch("/api/curated/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerCode: accessCode })
      })
      if (res.ok) {
        setActiveSession(null)
        fetchRankings()
      }
    } catch (error) {
      console.error("Failed to confirm session:", error)
    } finally {
      setConfirming(false)
    }
  }

  // End session without confirming
  const endSession = async () => {
    if (!isStreamer) return
    try {
      await fetch("/api/curated/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerCode: accessCode })
      })
      setActiveSession(null)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Effects
  useEffect(() => {
    if (activeTab === "rankings") {
      fetchRankings()
    }
  }, [activeTab, fetchRankings])

  useEffect(() => {
    if (activeTab === "rate" && isAuthenticated) {
      fetchActiveSession()
      const interval = setInterval(fetchActiveSession, 2000)
      return () => clearInterval(interval)
    }
  }, [activeTab, isAuthenticated, fetchActiveSession])

  // Calculate average from current ratings
  const calculateAverage = () => {
    if (!activeSession) return null
    const validRatings = activeSession.ratings.filter(r => r.score !== null)
    if (validRatings.length === 0) return null
    const avg = validRatings.reduce((sum, r) => sum + (r.score || 0), 0) / validRatings.length
    return Math.round(avg * 10) / 10
  }

  // Separate rankings by tier
  const top3 = rankings.slice(0, 3)
  const elite = rankings.slice(3, 15)
  const rest = rankings.slice(15)

  // Code entry screen - only for rate tab
  if (activeTab === "rate" && !isAuthenticated) {
    return (
      <CodeEntryScreen
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accessCode={accessCode}
        setAccessCode={setAccessCode}
        codeError={codeError}
        onSubmit={handleCodeSubmit}
      />
    )
  }

  // Username entry for raters - two-step: select slot, then enter name
  if (activeTab === "rate" && isAuthenticated && !usernameSet) {
    // Step 1: Select rater slot (for non-streamers)
    if (!isStreamer && !selectedSlot) {
      return (
        <SlotSelectionScreen
          onSelectSlot={setSelectedSlot}
          onViewRankings={() => setActiveTab("rankings")}
        />
      )
    }
    
    // Step 2: Enter custom name
    return (
      <NameEntryScreen
        isStreamer={isStreamer}
        selectedSlot={selectedSlot}
        customName={customName}
        setCustomName={setCustomName}
        onContinue={() => {
          if (customName.trim()) {
            setUsername(customName.trim())
            setUsernameSet(true)
          }
        }}
        onBack={() => setSelectedSlot("")}
        onViewRankings={() => setActiveTab("rankings")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Player Notes Modal */}
      {selectedPlayerNotes && (
        <PlayerNotesModal
          notes={selectedPlayerNotes}
          onClose={() => setSelectedPlayerNotes(null)}
        />
      )}

      {/* Header */}
      <div className="text-center py-8 sm:py-12">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-violet-400 mb-3">
          Expert Selection
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
          Curated Rankings
        </h1>
        
        {/* Tabs */}
        <div className="flex justify-center gap-2 px-4">
          <button
            onClick={() => setActiveTab("rankings")}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all",
              activeTab === "rankings"
                ? "bg-violet-500 text-white shadow-xl"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            Rankings
          </button>
          <button
            onClick={() => setActiveTab("rate")}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all",
              activeTab === "rate"
                ? "bg-violet-500 text-white shadow-xl"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            Rate {isStreamer && "🎬"}
          </button>
        </div>
      </div>

      {/* Rankings Tab */}
      {activeTab === "rankings" && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-8">
            {(["INFANTRY", "CAVALRY", "ARCHER"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl font-semibold text-sm transition-all",
                  category === cat
                    ? "bg-violet-500 text-white shadow-lg"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                )}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {loadingRankings ? (
            <div className="text-center py-12 text-white/50">Loading rankings...</div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h2>
              <p className="text-white/50">Curated rankings will appear here once confirmed</p>
            </div>
          ) : (
            <>
              {/* TOP 3 */}
              {top3.length > 0 && (
                <section className="mb-12">
                  <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8">
                    {top3[1] && (
                      <FifaDisplayCard 
                        player={top3[1]} 
                        rank={2} 
                        isCenter={false}
                        onPlayerClick={fetchPlayerNotes}
                      />
                    )}
                    {top3[0] && (
                      <FifaDisplayCard 
                        player={top3[0]} 
                        rank={1} 
                        isCenter={true}
                        onPlayerClick={fetchPlayerNotes}
                      />
                    )}
                    {top3[2] && (
                      <FifaDisplayCard 
                        player={top3[2]} 
                        rank={3} 
                        isCenter={false}
                        onPlayerClick={fetchPlayerNotes}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* ELITE (4-15) */}
              {elite.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-lg font-display font-bold text-white/60 mb-4 text-center">
                    Elite Players
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {elite.map(player => (
                      <ElitePlayerCard 
                        key={player.id} 
                        player={player}
                        onPlayerClick={fetchPlayerNotes}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ALL PLAYERS */}
              {rest.length > 0 && (
                <section>
                  <h2 className="text-lg font-display font-bold text-white/60 mb-4">
                    All Players
                  </h2>
                  
                  <div className="bg-black/20 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rest.map((player, index) => (
                        <CompactPlayerCard 
                          key={player.id} 
                          player={player} 
                          rank={index + 16}
                          onPlayerClick={fetchPlayerNotes}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Rate Tab */}
      {activeTab === "rate" && isAuthenticated && usernameSet && (
        <div className="w-full px-4 pb-4">
          {/* Streamer Controls */}
          {isStreamer && !activeSession && (
            <div className="space-y-6">
              {/* Search Box - Compact */}
              <div className="bg-black/40 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-5 max-w-md mx-auto">
                <h2 className="text-lg font-bold text-white mb-3 text-center">🔍 Search Division A Player</h2>
                <div className="relative">
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
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map(player => (
                      <button
                        key={player.id}
                        onClick={() => createSession(player.id)}
                        disabled={creatingSession}
                        className="w-full flex items-center gap-3 p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl transition-all text-left"
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
                          </div>
                        </div>
                        {player.nationality && <Flag code={player.nationality} size="sm" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Division A Players Grid */}
              <DivisionAPlayersList onSelectPlayer={createSession} disabled={creatingSession} />
            </div>
          )}

          {/* Active Rating Session - Large Layout with Notes */}
          {activeSession && (
            <div className="flex items-start justify-center gap-16 py-8">
              {/* Left Side - Raters 1-5 with notes */}
              <div className="space-y-4 pt-6">
                {RATER_NAMES.slice(0, 5).map((slotName, index) => {
                  // Find rating for this slot - either by slot name or by the current user if they have this slot
                  const isMySlot = selectedSlot === slotName
                  const raterData = isMySlot 
                    ? activeSession.ratings.find(r => r.raterName === username)
                    : activeSession.ratings.find(r => r.raterName === slotName)
                  // Display the custom name if this is my slot, otherwise show the raterName from data or slot name
                  const displayName = isMySlot ? username : (raterData?.raterName || slotName)
                  return (
                    <RaterBox
                      key={slotName}
                      raterName={displayName}
                      raterData={raterData}
                      isMe={isMySlot}
                      isLeft={true}
                      myRating={myRating}
                      myNote={myNote}
                      myConfirmed={myConfirmed}
                      submittingRating={submittingRating}
                      onRatingChange={setMyRating}
                      onRatingBlur={() => submitRating(myRating)}
                      onNoteChange={setMyNote}
                      onNoteBlur={() => submitNote(myNote)}
                      onConfirm={confirmMyRating}
                      onEdit={editMyRating}
                    />
                  )
                })}
              </div>

              {/* Center - Big Player Card + Controls */}
              <div className="flex flex-col items-center">
                {/* Big FIFA Card with dynamic background */}
                <RatePlayerCard
                  session={activeSession}
                  averageRating={calculateAverage()}
                  totalVotes={activeSession.ratings.filter(r => r.score !== null).length}
                  maxVotes={RATER_NAMES.length}
                />

                {/* Streamer Buttons */}
                {isStreamer && (
                  <div className="flex gap-4 mt-5">
                    <button 
                      onClick={confirmSession} 
                      disabled={confirming || calculateAverage() === null} 
                      className="px-8 py-4 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-white text-lg font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-lg"
                    >
                      {confirming ? "..." : "✓ Confirm Final Rating"}
                    </button>
                    <button 
                      onClick={endSession} 
                      className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white text-lg font-bold rounded-xl transition-all shadow-lg"
                    >
                      ✕ Cancel Session
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side - Raters 6-10 with notes */}
              <div className="space-y-4 pt-6">
                {RATER_NAMES.slice(5, 10).map((slotName, index) => {
                  // Find rating for this slot - either by slot name or by the current user if they have this slot
                  const isMySlot = selectedSlot === slotName
                  const raterData = isMySlot 
                    ? activeSession.ratings.find(r => r.raterName === username)
                    : activeSession.ratings.find(r => r.raterName === slotName)
                  // Display the custom name if this is my slot, otherwise show the raterName from data or slot name
                  const displayName = isMySlot ? username : (raterData?.raterName || slotName)
                  return (
                    <RaterBox
                      key={slotName}
                      raterName={displayName}
                      raterData={raterData}
                      isMe={isMySlot}
                      isLeft={false}
                      myRating={myRating}
                      myNote={myNote}
                      myConfirmed={myConfirmed}
                      submittingRating={submittingRating}
                      onRatingChange={setMyRating}
                      onRatingBlur={() => submitRating(myRating)}
                      onNoteChange={setMyNote}
                      onNoteBlur={() => submitNote(myNote)}
                      onConfirm={confirmMyRating}
                      onEdit={editMyRating}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* No Active Session - Rater View */}
          {!activeSession && !isStreamer && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Session</h2>
              <p className="text-white/50">
                The streamer hasn&apos;t started a rating session yet. Please wait...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
