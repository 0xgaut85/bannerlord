"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { FifaCard, EligibilityProgress, CooldownTimer } from "@/components/rating"
import { canUserEdit, MIN_RATINGS } from "@/lib/utils"
import { Player } from "@prisma/client"

interface RatingMap {
  [playerId: string]: number
}

export default function RatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [players, setPlayers] = useState<Player[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings] = useState<RatingMap>({})
  const [originalRatings, setOriginalRatings] = useState<RatingMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isModified = JSON.stringify(ratings) !== JSON.stringify(originalRatings)
  
  // Check if can edit
  const canEdit = canUserEdit(session?.user?.lastEditAt ? new Date(session.user.lastEditAt) : null)
  
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
        // Fetch all players
        const playersRes = await fetch("/api/players")
        if (playersRes.ok) {
          const playersData = await playersRes.json()
          // Shuffle players randomly
          const shuffled = [...playersData].sort(() => Math.random() - 0.5)
          setPlayers(shuffled)
        }
        
        // Fetch user's existing ratings if logged in
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
  
  const currentPlayer = players[currentIndex]
  
  const handleRatingChange = useCallback((value: number) => {
    if (currentPlayer) {
      setRatings(prev => ({
        ...prev,
        [currentPlayer.id]: value
      }))
    }
  }, [currentPlayer])
  
  const handleSkip = useCallback(() => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setCurrentIndex(0)
    }
  }, [currentIndex, players.length])
  
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }, [currentIndex])
  
  const handleSave = async () => {
    if (!canEdit) {
      setError("You can only edit once every 24 hours")
      return
    }
    
    setIsSaving(true)
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
        throw new Error(data.error || "Failed to save ratings")
      }
      
      setOriginalRatings({ ...ratings })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-6">
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Top Bar */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-white">
              Rate Players
            </h1>
            
            {/* Save Button */}
            {isModified && canEdit && (
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="!bg-amber-500 !text-black hover:!bg-amber-400 font-semibold"
              >
                💾 Save All Ratings
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress Bars */}
      <div className="bg-black/10 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <EligibilityProgress status={eligibility} dark />
          <CooldownTimer lastEditAt={session?.user?.lastEditAt} dark />
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="mx-auto mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center max-w-lg">
          {error}
        </div>
      )}
      
      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {players.length > 0 && currentPlayer ? (
          <FifaCard
            player={currentPlayer}
            currentRating={ratings[currentPlayer.id] || 75}
            onRatingChange={handleRatingChange}
            onSkip={handleSkip}
            onPrevious={handlePrevious}
            hasPrevious={currentIndex > 0}
            currentIndex={currentIndex}
            totalPlayers={players.length}
          />
        ) : (
          <div className="text-center py-16 text-white/60">
            <p className="font-display text-2xl">No players yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
