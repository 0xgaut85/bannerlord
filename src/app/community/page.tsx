"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui"
import { RankingTable } from "@/components/community"
import { PlayerWithRating } from "@/types"

type Category = "INFANTRY" | "CAVALRY" | "ARCHER"

export default function CommunityPage() {
  const [category, setCategory] = useState<Category>("INFANTRY")
  const [players, setPlayers] = useState<PlayerWithRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/community?category=${category}`)
        if (res.ok) {
          const data = await res.json()
          setPlayers(data)
        }
      } catch (error) {
        console.error("Error fetching rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRankings()
  }, [category])
  
  return (
    <div className="page-transition max-w-4xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#c9a962] mb-4">
          Community Rankings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1a1a1a] mb-3">
          Top Players
        </h1>
        <p className="text-[#5a5a5a]">
          Rankings based on weighted community votes
        </p>
      </div>
      
      {/* Category Tabs */}
      <Tabs 
        defaultValue="INFANTRY" 
        onChange={(value) => setCategory(value as Category)}
        className="mb-8"
      >
        <TabsList className="w-full grid grid-cols-3 p-1.5">
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
        
        <div className="mt-8">
          <TabsContent value="INFANTRY">
            <RankingTable players={players} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="CAVALRY">
            <RankingTable players={players} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="ARCHER">
            <RankingTable players={players} isLoading={isLoading} />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Info */}
      <div className="mt-12 glass rounded-xl p-6 text-sm text-[#5a5a5a]">
        <p className="mb-3">
          <span className="font-medium text-[#1a1a1a]">How rankings work:</span>{" "}
          Each player&apos;s score is calculated from the weighted average of all eligible votes.
        </p>
        <p>
          <span className="font-medium text-[#1a1a1a]">Vote weight:</span>{" "}
          A (100%) · B (75%) · C/D (50%) · E/F (25%).
          Only users who have rated at least 20 Infantry, 20 Cavalry, and 10 Archers are counted.
        </p>
      </div>
    </div>
  )
}
