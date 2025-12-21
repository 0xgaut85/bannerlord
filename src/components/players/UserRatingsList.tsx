"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui"
import { EligibilityProgress } from "@/components/rating"
import { Division, PlayerCategory } from "@prisma/client"

interface Rating {
  id: string
  score: number
  player: {
    id: string
    name: string
    category: PlayerCategory
    nationality: string
  }
}

interface UserRatingsData {
  user: {
    id: string
    name: string | null
    discordName: string | null
    team: string | null
    division: Division | null
    image: string | null
  }
  ratings: Rating[]
  eligibility: {
    isEligible: boolean
    infantry: { current: number; required: number }
    cavalry: { current: number; required: number }
    archer: { current: number; required: number }
  }
}

interface UserRatingsListProps {
  userId: string
  onBack: () => void
}

export function UserRatingsList({ userId, onBack }: UserRatingsListProps) {
  const [data, setData] = useState<UserRatingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRatings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/ratings/user/${userId}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRatings()
  }, [userId])
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-white/10 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/10 rounded-xl animate-pulse" />
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="bg-white/10 rounded-xl p-8 text-center">
        <p className="text-white/40">User not found</p>
      </div>
    )
  }
  
  const { user, ratings, eligibility } = data
  
  const infantryRatings = ratings
    .filter(r => r.player.category === "INFANTRY")
    .sort((a, b) => b.score - a.score)
  const cavalryRatings = ratings
    .filter(r => r.player.category === "CAVALRY")
    .sort((a, b) => b.score - a.score)
  const archerRatings = ratings
    .filter(r => r.player.category === "ARCHER")
    .sort((a, b) => b.score - a.score)
  
  const RatingList = ({ items }: { items: Rating[] }) => (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-white/40 text-center py-6">No ratings yet</p>
      ) : (
        items.map((rating, index) => (
          <div 
            key={rating.id}
            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl"
          >
            <span className="text-sm text-white/40 w-8 font-medium">{index + 1}</span>
            <span className="flex-1 font-medium text-white">{rating.player.name}</span>
            <span className="text-xs text-white/40 uppercase tracking-wide">{rating.player.nationality}</span>
            <span className="font-display text-xl font-semibold text-amber-500 min-w-[50px] text-right">
              {rating.score}
            </span>
          </div>
        ))
      )}
    </div>
  )
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-white/50 hover:text-white transition-colors"
      >
        ← Back to search
      </button>
      
      {/* User Info */}
      <div className="bg-white/10 rounded-xl p-6 flex items-center gap-4 border border-white/10">
        {user.image ? (
          <Image 
            src={user.image} 
            alt="" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-full ring-2 ring-white/30 object-cover" 
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="font-display text-xl font-semibold text-amber-500">
              {(user.discordName || user.name || "U")[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            {user.discordName || user.name || "Unknown User"}
          </h2>
          <div className="flex items-center gap-3 text-white/50">
            {user.team && <span>{user.team}</span>}
            {user.division && (
              <Badge variant="division">Division {user.division}</Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Eligibility */}
      <EligibilityProgress status={eligibility} dark />
      
      {/* Ratings Tabs */}
      <Tabs defaultValue="infantry">
        <TabsList className="w-full grid grid-cols-3 !bg-white/10 !border-white/20">
          <TabsTrigger value="infantry" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
            Infantry ({infantryRatings.length})
          </TabsTrigger>
          <TabsTrigger value="cavalry" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
            Cavalry ({cavalryRatings.length})
          </TabsTrigger>
          <TabsTrigger value="archer" className="!text-white/70 data-[active=true]:!bg-white/20 data-[active=true]:!text-white">
            Archers ({archerRatings.length})
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="infantry">
            <RatingList items={infantryRatings} />
          </TabsContent>
          <TabsContent value="cavalry">
            <RatingList items={cavalryRatings} />
          </TabsContent>
          <TabsContent value="archer">
            <RatingList items={archerRatings} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
