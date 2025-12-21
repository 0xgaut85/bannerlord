"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button, Tabs, TabsList, TabsTrigger } from "@/components/ui"
import { FifaCard, EligibilityProgress, CooldownTimer } from "@/components/rating"
import { canUserEdit, MIN_RATINGS } from "@/lib/utils"
import { Player } from "@prisma/client"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

interface RatingMap {
  [playerId: string]: number
}

const categoryGradients: Record<Category, string> = {
  INFANTRY: "from-amber-900 via-amber-800 to-amber-700",
  CAVALRY: "from-slate-900 via-slate-800 to-slate-700",
  ARCHER: "from-emerald-900 via-emerald-800 to-emerald-700",
}

export default function RatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings] = useState<RatingMap>({})
  const [originalRatings, setOriginalRatings] = useState<RatingMap>({})
  const [skippedPlayers, setSkippedPlayers] = useState<Set<string>>(new Set())
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
          setPlayers(playersData)
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
  
  // Filter players by category (excluding skipped ones for current session)
  const filteredPlayers = players.filter(p => p.category === category)
  const currentCategoryPlayer = filteredPlayers[currentIndex]
  
  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [category])
  
  const handleRatingChange = useCallback((value: number) => {
    if (currentCategoryPlayer) {
      setRatings(prev => ({
        ...prev,
        [currentCategoryPlayer.id]: value
      }))
    }
  }, [currentCategoryPlayer])
  
  const handleSkip = useCallback(() => {
    if (currentCategoryPlayer) {
      // Move to next player
      if (currentIndex < filteredPlayers.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        // Wrap around or stay at last
        setCurrentIndex(0)
      }
    }
  }, [currentCategoryPlayer, currentIndex, filteredPlayers.length])
  
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
      // Refresh session to get updated lastEditAt
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
  
  const gradient = categoryGradients[category]
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradient} flex flex-col`}>
      {/* Top Bar */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <Tabs 
              defaultValue="INFANTRY" 
              onChange={(value) => setCategory(value as Category)}
            >
              <TabsList className="!bg-white/10 !border-white/20">
                <TabsTrigger value="INFANTRY" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
                  ⚔️ Infantry
                </TabsTrigger>
                <TabsTrigger value="CAVALRY" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
                  🐎 Cavalry
                </TabsTrigger>
                <TabsTrigger value="ARCHER" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
                  🏹 Archers
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
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
        <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center max-w-lg mx-auto">
          {error}
        </div>
      )}
      
      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {filteredPlayers.length > 0 && currentCategoryPlayer ? (
          <FifaCard
            player={currentCategoryPlayer}
            currentRating={ratings[currentCategoryPlayer.id] || 75}
            onRatingChange={handleRatingChange}
            onSkip={handleSkip}
            onPrevious={handlePrevious}
            hasPrevious={currentIndex > 0}
            currentIndex={currentIndex}
            totalPlayers={filteredPlayers.length}
          />
        ) : (
          <div className="text-center py-16 text-white/60">
            <p className="font-display text-2xl">No players in this category yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
