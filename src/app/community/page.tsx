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
    <div className="page-transition w-full min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="text-center py-12 sm:py-16 bg-gradient-to-b from-slate-900 to-slate-800">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-amber-500 mb-4">
          Community Rankings
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
          Top Players
        </h1>
        <p className="text-white/60">
          Rankings based on weighted community votes
        </p>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Infantry Column */}
        <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-6 lg:p-8">
          <h2 className="text-xl font-display font-bold text-amber-500 mb-6 flex items-center gap-3 justify-center border-b border-amber-500/20 pb-4">
            <span className="text-2xl">⚔️</span>
            Infantry
          </h2>
          <RankingTable players={infantryPlayers} isLoading={isLoading} dark initialLimit={20} />
        </div>

        {/* Cavalry Column */}
        <div className="bg-white p-6 lg:p-8 border-x border-gray-200">
          <h2 className="text-xl font-display font-bold text-slate-700 mb-6 flex items-center gap-3 justify-center border-b border-gray-200 pb-4">
            <span className="text-2xl">🐎</span>
            Cavalry
          </h2>
          <RankingTable players={cavalryPlayers} isLoading={isLoading} initialLimit={20} />
        </div>

        {/* Archer Column */}
        <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 p-6 lg:p-8">
          <h2 className="text-xl font-display font-bold text-emerald-500 mb-6 flex items-center gap-3 justify-center border-b border-emerald-500/20 pb-4">
            <span className="text-2xl">🏹</span>
            Archers
          </h2>
          <RankingTable players={archerPlayers} isLoading={isLoading} dark initialLimit={20} />
        </div>
      </div>
    </div>
  )
}
