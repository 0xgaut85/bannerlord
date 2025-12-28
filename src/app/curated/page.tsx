"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Flag } from "@/components/ui"
import { cn, cleanPlayerName } from "@/lib/utils"

// Types and constants
import { Tab, Category, CuratedRanking, CuratedSession, PlayerNotes, RATER_NAMES } from "./types"
import { getDefaultAvatar } from "./utils"

// Components
import {
  FifaDisplayCard,
  ElitePlayerCard,
  CompactPlayerCard,
  RatePlayerCard,
  StreamerPlayerManager,
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

  // Session creation
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

  // Track if we've done initial sync (to avoid overwriting local edits during polling)
  const [initialSyncDone, setInitialSyncDone] = useState(false)

  // Debounce timers for auto-submit (so streamer sees updates in real-time)
  const noteDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const ratingDebounceRef = useRef<NodeJS.Timeout | null>(null)

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
        const prevSessionId = activeSession?.id
        const isNewSession = data?.id !== prevSessionId
        
        // Always update session data (so streamer sees all raters' updates in real-time)
        setActiveSession(data)
        
        // Only sync MY OWN local state on initial load or when session changes
        // This prevents overwriting user's local edits during polling
        // But other raters' data is always updated via setActiveSession above
        if (data && usernameSet && (!initialSyncDone || isNewSession)) {
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
          setInitialSyncDone(true)
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error)
    }
  }, [username, usernameSet, initialSyncDone, activeSession?.id])

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
        setInitialSyncDone(false) // Reset for next session
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
      setInitialSyncDone(false) // Reset for next session
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
            <StreamerPlayerManager onSelectPlayer={createSession} disabled={creatingSession} />
          )}

          {/* Active Rating Session - Large Layout with Notes */}
          {activeSession && (() => {
            // Get all ratings from session, padded to 10 slots
            const allRatings = activeSession.ratings
            // Find my rating by username
            const myRatingData = allRatings.find(r => r.raterName === username)
            // For display: show all existing ratings + empty slots up to 10
            // Left side: slots 0-4, Right side: slots 5-9
            const leftSlots = Array.from({ length: 5 }, (_, i) => {
              const rating = allRatings[i]
              const isMe = rating?.raterName === username
              return { index: i, rating, isMe, displayName: rating?.raterName || `Rater ${i + 1}` }
            })
            const rightSlots = Array.from({ length: 5 }, (_, i) => {
              const rating = allRatings[i + 5]
              const isMe = rating?.raterName === username
              return { index: i + 5, rating, isMe, displayName: rating?.raterName || `Rater ${i + 6}` }
            })
            // For raters: find their position or assign to first empty slot
            const mySlotIndex = allRatings.findIndex(r => r.raterName === username)
            
            return (
            <div className="flex items-start justify-center gap-16 py-8">
              {/* Left Side - Raters 1-5 with notes */}
              <div className="space-y-4 pt-6">
                {leftSlots.map(({ index, rating, isMe, displayName }) => {
                  // Check if this is my slot (either I have a rating here, or I'm a new rater taking an empty slot)
                  const isMySlot = isMe || (!myRatingData && !rating && selectedSlot === RATER_NAMES[index])
                  const raterData = isMySlot ? (myRatingData || rating) : rating
                  const name = isMySlot ? username : displayName
                  return (
                    <RaterBox
                      key={index}
                      raterName={name}
                      raterData={raterData}
                      isMe={isMySlot}
                      isLeft={true}
                      myRating={myRating}
                      myNote={myNote}
                      myConfirmed={myConfirmed}
                      submittingRating={submittingRating}
                      onRatingChange={(val) => {
                        setMyRating(val)
                        if (ratingDebounceRef.current) clearTimeout(ratingDebounceRef.current)
                        ratingDebounceRef.current = setTimeout(() => {
                          if (val) submitRating(val)
                        }, 500)
                      }}
                      onRatingBlur={() => {
                        if (ratingDebounceRef.current) clearTimeout(ratingDebounceRef.current)
                        submitRating(myRating)
                      }}
                      onNoteChange={(val) => {
                        setMyNote(val)
                        if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current)
                        noteDebounceRef.current = setTimeout(() => {
                          submitNote(val)
                        }, 500)
                      }}
                      onNoteBlur={() => {
                        if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current)
                        submitNote(myNote)
                      }}
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
                {rightSlots.map(({ index, rating, isMe, displayName }) => {
                  // Check if this is my slot
                  const isMySlot = isMe || (!myRatingData && !rating && selectedSlot === RATER_NAMES[index])
                  const raterData = isMySlot ? (myRatingData || rating) : rating
                  const name = isMySlot ? username : displayName
                  return (
                    <RaterBox
                      key={index}
                      raterName={name}
                      raterData={raterData}
                      isMe={isMySlot}
                      isLeft={false}
                      myRating={myRating}
                      myNote={myNote}
                      myConfirmed={myConfirmed}
                      submittingRating={submittingRating}
                      onRatingChange={(val) => {
                        setMyRating(val)
                        if (ratingDebounceRef.current) clearTimeout(ratingDebounceRef.current)
                        ratingDebounceRef.current = setTimeout(() => {
                          if (val) submitRating(val)
                        }, 500)
                      }}
                      onRatingBlur={() => {
                        if (ratingDebounceRef.current) clearTimeout(ratingDebounceRef.current)
                        submitRating(myRating)
                      }}
                      onNoteChange={(val) => {
                        setMyNote(val)
                        // Debounced auto-submit for real-time updates
                        if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current)
                        noteDebounceRef.current = setTimeout(() => {
                          submitNote(val)
                        }, 500)
                      }}
                      onNoteBlur={() => {
                        if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current)
                        submitNote(myNote)
                      }}
                      onConfirm={confirmMyRating}
                      onEdit={editMyRating}
                    />
                  )
                })}
              </div>
            </div>
            )
          })()}

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
