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
    <div className="page-transition w-full px-4 lg:px-8 py-12 sm:py-16">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Infantry Column */}
        <div>
          <h2 className="text-xl font-display font-semibold text-[#1a1a1a] mb-6 flex items-center gap-3 justify-center border-b border-[#e5e5e5] pb-4">
            Infantry
          </h2>
          <RankingTable players={infantryPlayers} isLoading={isLoading} />
        </div>

        {/* Cavalry Column */}
        <div>
          <h2 className="text-xl font-display font-semibold text-[#1a1a1a] mb-6 flex items-center gap-3 justify-center border-b border-[#e5e5e5] pb-4">
            Cavalry
          </h2>
          <RankingTable players={cavalryPlayers} isLoading={isLoading} />
        </div>

        {/* Archer Column */}
        <div>
          <h2 className="text-xl font-display font-semibold text-[#1a1a1a] mb-6 flex items-center gap-3 justify-center border-b border-[#e5e5e5] pb-4">
            Archer
          </h2>
          <RankingTable players={archerPlayers} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
