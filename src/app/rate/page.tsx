"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui"
import { PlayerCard, EligibilityProgress, CooldownTimer } from "@/components/rating"
import { canUserEdit, MIN_RATINGS } from "@/lib/utils"
import { Player } from "@prisma/client"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

interface RatingMap {
  [playerId: string]: number
}

export default function RatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [category, setCategory] = useState<Category>("INFANTRY")
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
  
  // Filter players by category
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
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Authentication Required
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1a1a1a] mb-4">
          Sign in to Rate Players
        </h1>
        <p className="text-[#5a5a5a] mb-10">
          Connect your Discord account to create your own player rankings
        </p>
        <Button onClick={() => signIn("discord")} size="lg" variant="primary">
          Sign in with Discord
        </Button>
      </div>
    )
  }
  
  // Profile not complete
  if (session && !session.user?.isProfileComplete) {
    return (
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Profile Setup
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1a1a1a] mb-4">
          Complete Your Profile
        </h1>
        <p className="text-[#5a5a5a] mb-10">
          Please set your team and division before rating players
        </p>
        <Button onClick={() => router.push("/profile")} size="lg" variant="primary">
          Go to Profile
        </Button>
      </div>
    )
  }
  
  // Loading
  if (status === "loading" || isLoading) {
    return (
      <div className="page-transition max-w-lg mx-auto px-6 lg:px-8 py-20">
        <div className="space-y-4">
          <div className="h-24 glass rounded-xl animate-pulse" />
          <div className="h-96 glass rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="page-transition max-w-2xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Rate Players
        </p>
        <h1 className="font-display text-4xl font-semibold text-[#1a1a1a]">
          Create Your List
        </h1>
      </div>
      
      {/* Cooldown Timer */}
      <CooldownTimer lastEditAt={session?.user?.lastEditAt} />
      
      {/* Eligibility Progress */}
      <EligibilityProgress status={eligibility} />
      
      {/* Error */}
      {error && (
        <div className="mb-6 p-4 glass rounded-xl border border-red-200 text-red-700">
          {error}
        </div>
      )}
      
      {/* Category Tabs */}
      <Tabs 
        defaultValue="INFANTRY" 
        onChange={(value) => setCategory(value as Category)}
        className="mb-6"
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="INFANTRY">
            Infantry
          </TabsTrigger>
          <TabsTrigger value="CAVALRY">
            Cavalry
          </TabsTrigger>
          <TabsTrigger value="ARCHER">
            Archers
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Player Card */}
      {filteredPlayers.length > 0 && currentCategoryPlayer ? (
        <PlayerCard
          player={currentCategoryPlayer}
          currentRating={ratings[currentCategoryPlayer.id] || 75}
          onRatingChange={handleRatingChange}
          onPrevious={() => setCurrentIndex(i => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex(i => Math.min(filteredPlayers.length - 1, i + 1))}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < filteredPlayers.length - 1}
          currentIndex={currentIndex}
          totalPlayers={filteredPlayers.length}
        />
      ) : (
        <div className="text-center py-16 text-[#8a8a8a]">
          <p className="font-display text-xl">No players in this category yet</p>
        </div>
      )}
      
      {/* Save Button */}
      {isModified && canEdit && (
        <div className="mt-10 text-center">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            variant="primary"
            className="min-w-[200px]"
          >
            Save All Ratings
          </Button>
        </div>
      )}
    </div>
  )
}
