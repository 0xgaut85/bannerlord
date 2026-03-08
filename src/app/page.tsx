"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button, Tilt3DCard } from "@/components/ui"
import { FifaDisplayCard } from "@/components/ui/FifaDisplayCard"
import { signIn } from "next-auth/react"

interface Mover {
  id: string
  name: string
  category: string
  nationality: string | null
  clan: string | null
  clanLogo: string | null
  avatar: string | null
  currentRating: number
  previousRating: number
  delta: number
}

const links = [
  { title: "Rankings", href: "/community", desc: "Community-voted competitive rankings" },
  { title: "Rate Players", href: "/rate", desc: "Score players and shape the meta" },
  { title: "Team Builder", href: "/team-builder", desc: "Draft your dream roster" },
  { title: "Stats", href: "/stats", desc: "Analytics and leaderboard data" },
]

export default function HomePage() {
  const { data: session } = useSession()
  const [winners, setWinners] = useState<Mover[]>([])
  const [losers, setLosers] = useState<Mover[]>([])
  const [previousPeriod, setPreviousPeriod] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovers() {
      try {
        const res = await fetch("/api/rankings/movers")
        if (res.ok) {
          const data = await res.json()
          setWinners(data.winners || [])
          setLosers(data.losers || [])
          setPreviousPeriod(data.previousPeriod || null)
        }
      } catch (error) {
        console.error("Error fetching movers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMovers()
  }, [])

  return (
    <div className="relative h-[calc(100vh-3.5rem)] flex flex-col bg-black overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-white/[0.015] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch w-full overflow-hidden">
        {/* ─── LEFT: Mover Cards ─── */}
        <div className="lg:w-1/2 relative flex items-center justify-center px-3 py-4 lg:py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5 w-full mx-auto px-2">
              {winners.length > 0 && (
                <MoverRow label="They are waking up" players={winners} type="winner" />
              )}
              {losers.length > 0 && (
                <MoverRow label="Getting rusty" players={losers} type="loser" />
              )}
              {winners.length === 0 && losers.length === 0 && (
                <p className="text-center text-[#444] text-sm">No rating changes yet</p>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Titles & CTAs ─── */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center px-6 py-6 lg:py-0">
          <div className="w-full text-center">
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#444] mb-4 lg:mb-6 animate-fade-up">
              Mount & Blade II
            </p>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-4 lg:mb-6 animate-fade-up stagger-1">
              Bannerlord
            </h1>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#555] leading-[0.95] tracking-tight mb-5 lg:mb-8 animate-fade-up stagger-2">
              Ranking
            </h2>

            <p className="text-[#444] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mx-auto mb-8 lg:mb-12 animate-fade-up stagger-3">
              The definitive ranking system for competitive players.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 lg:mb-10 max-w-md mx-auto animate-fade-up stagger-4">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-3 lg:p-4 rounded-lg border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200"
                >
                  <h3 className="text-white text-[12px] lg:text-[13px] font-semibold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[#333] text-[10px] lg:text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 animate-fade-up stagger-5">
              <Link href="/community">
                <Button size="lg" variant="primary">
                  View Rankings
                </Button>
              </Link>
              {!session && (
                <button
                  onClick={() => signIn("discord")}
                  className="text-[#444] hover:text-white text-[14px] font-medium transition-colors duration-200"
                >
                  Sign in to Rate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom credit */}
      <div className="relative z-10 shrink-0">
        <div className="text-center py-3">
          <p className="text-[11px] text-[#282828]">
            Crafted by <span className="text-[#555]">Obelix</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function MoverRow({ label, players, type }: { label: string; players: Mover[]; type: "winner" | "loser" }) {
  const isWinner = type === "winner"

  return (
    <div>
      <p className={`text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 text-center ${
        isWinner ? "text-emerald-500/70" : "text-red-500/70"
      }`}>
        {label}
      </p>
      <div className="flex justify-center gap-2 sm:gap-3">
        {players.map((p) => (
          <Tilt3DCard key={p.id} maxTilt={10} scale={1.04}>
            <div className="relative">
              <FifaDisplayCard
                player={{
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  nationality: p.nationality,
                  clan: p.clan,
                  avatar: p.avatar,
                  clanLogo: p.clanLogo,
                }}
                rating={p.currentRating}
                size="md"
              />
              {/* Delta badge */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-lg text-xs font-black shadow-lg whitespace-nowrap ${
                isWinner
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}>
                {isWinner ? "+" : ""}{p.delta.toFixed(1)}
              </div>
            </div>
          </Tilt3DCard>
        ))}
      </div>
    </div>
  )
}
