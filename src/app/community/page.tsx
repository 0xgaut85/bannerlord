"use client"

import { useState, useEffect } from "react"
import { RankingTable } from "@/components/community"
import { PlayerWithRating } from "@/types"

export default function CommunityPage() {
  const [infantryPlayers, setInfantryPlayers] = useState<PlayerWithRating[]>([])
  const [cavalryPlayers, setCavalryPlayers] = useState<PlayerWithRating[]>([])
  const [archerPlayers, setArcherPlayers] = useState<PlayerWithRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchAllRankings() {
      setIsLoading(true)
      try {
        const [infantryRes, cavalryRes, archerRes] = await Promise.all([
          fetch(`/api/community?category=INFANTRY`),
          fetch(`/api/community?category=CAVALRY`),
          fetch(`/api/community?category=ARCHER`)
        ])
        
        if (infantryRes.ok) setInfantryPlayers(await infantryRes.json())
        if (cavalryRes.ok) setCavalryPlayers(await cavalryRes.json())
        if (archerRes.ok) setArcherPlayers(await archerRes.json())
        
      } catch (error) {
        console.error("Error fetching rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllRankings()
  }, [])
  
  return (
    <div className="page-transition w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-12 sm:py-16 bg-[#f5f5f5]">
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
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3">
        {/* Infantry Column - Black */}
        <div className="bg-[#0a0a0a] p-8">
          <h2 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-3 justify-center border-b border-white/10 pb-4">
            Infantry
          </h2>
          <RankingTable players={infantryPlayers} isLoading={isLoading} dark />
        </div>

        {/* Cavalry Column - White */}
        <div className="bg-white p-8 border-x border-[#e5e5e5]">
          <h2 className="text-xl font-display font-semibold text-[#1a1a1a] mb-6 flex items-center gap-3 justify-center border-b border-[#e5e5e5] pb-4">
            Cavalry
          </h2>
          <RankingTable players={cavalryPlayers} isLoading={isLoading} />
        </div>

        {/* Archer Column - Light Gray */}
        <div className="bg-[#f5f5f5] p-8">
          <h2 className="text-xl font-display font-semibold text-[#1a1a1a] mb-6 flex items-center gap-3 justify-center border-b border-[#e5e5e5] pb-4">
            Archer
          </h2>
          <RankingTable players={archerPlayers} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
