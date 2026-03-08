"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Button, Flag } from "@/components/ui"
import { signIn } from "next-auth/react"
import { cleanPlayerName } from "@/lib/utils"

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

const categoryShort: Record<string, string> = {
  INFANTRY: "INF",
  CAVALRY: "CAV",
  ARCHER: "ARC",
}

function getDefaultAvatar(category: string): string {
  switch (category) {
    case "INFANTRY": return "/inf.png"
    case "CAVALRY": return "/cav.png"
    case "ARCHER": return "/arc.png"
    default: return "/inf.png"
  }
}

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
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col bg-black overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-white/[0.015] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* ─── HEADER ─── */}
        <div className="w-full text-center pt-10 pb-6 lg:pt-14 lg:pb-8 px-6">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#444] mb-4 animate-fade-up">
            Mount & Blade II
          </p>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-3 animate-fade-up stagger-1">
            Bannerlord
          </h1>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#555] leading-[0.95] tracking-tight mb-4 animate-fade-up stagger-2">
            Ranking
          </h2>
          <p className="text-[#444] text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6 animate-fade-up stagger-3">
            The definitive ranking system for competitive players.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 max-w-md mx-auto animate-fade-up stagger-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group p-3 rounded-lg border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200"
              >
                <h3 className="text-white text-[12px] font-semibold mb-1">{item.title}</h3>
                <p className="text-[#333] text-[10px] leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 animate-fade-up stagger-5">
            <Link href="/community">
              <Button size="lg" variant="primary">View Rankings</Button>
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

        {/* ─── MOVERS SECTIONS ─── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto px-4 pb-12 space-y-12 animate-fade-up stagger-5">
            {winners.length > 0 && (
              <MoverSection
                title="They are waking up"
                subtitle={`Biggest gains vs ${previousPeriod || "last period"}`}
                players={winners}
                type="winner"
              />
            )}
            {losers.length > 0 && (
              <MoverSection
                title="Getting rusty"
                subtitle={`Biggest drops vs ${previousPeriod || "last period"}`}
                players={losers}
                type="loser"
              />
            )}
          </div>
        )}
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

function MoverSection({ title, subtitle, players, type }: {
  title: string
  subtitle: string
  players: Mover[]
  type: "winner" | "loser"
}) {
  const isWinner = type === "winner"

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[#555] text-xs mt-1">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {players.map((player, i) => (
          <MoverCard key={player.id} player={player} rank={i + 1} isWinner={isWinner} />
        ))}
      </div>
    </div>
  )
}

function MoverCard({ player, rank, isWinner }: { player: Mover; rank: number; isWinner: boolean }) {
  const avatarSrc = player.avatar || getDefaultAvatar(player.category)
  const absDelta = Math.abs(player.delta)

  return (
    <Link href="/community" className="group">
      <div className={`relative rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.03] ${
        isWinner
          ? "bg-gradient-to-b from-emerald-950/40 to-black border-emerald-500/20 hover:border-emerald-400/40"
          : "bg-gradient-to-b from-red-950/40 to-black border-red-500/20 hover:border-red-400/40"
      }`}>
        {/* Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 blur-3xl opacity-20 ${
          isWinner ? "bg-emerald-500" : "bg-red-500"
        }`} />

        <div className="relative p-5 flex flex-col items-center text-center">
          {/* Rank badge */}
          <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-md ${
            isWinner ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}>
            #{rank}
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold text-[#555] tracking-wider uppercase">
              {categoryShort[player.category]}
            </span>
          </div>

          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10 mb-3 mt-4">
            <Image
              src={avatarSrc}
              alt={player.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name */}
          <h4 className="text-white font-bold text-sm truncate w-full mb-0.5">
            {cleanPlayerName(player.name)}
          </h4>

          {/* Clan & Flag */}
          <div className="flex items-center gap-1.5 mb-4">
            <Flag code={player.nationality} size="sm" />
            {player.clan && (
              <span className="text-[#555] text-xs">{player.clan}</span>
            )}
          </div>

          {/* Delta — the big number */}
          <div className={`text-4xl font-black leading-none mb-1 ${
            isWinner ? "text-emerald-400" : "text-red-400"
          }`}>
            {isWinner ? "+" : ""}{absDelta.toFixed(1)}
          </div>
          <p className="text-[#555] text-[10px] mb-3">pts vs previous</p>

          {/* Rating comparison */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-[#555] text-[9px] uppercase mb-0.5">Before</div>
              <div className="text-white/50 font-semibold">{player.previousRating.toFixed(1)}</div>
            </div>
            <div className={`text-lg ${isWinner ? "text-emerald-500" : "text-red-500"}`}>→</div>
            <div className="text-center">
              <div className="text-[#555] text-[9px] uppercase mb-0.5">Now</div>
              <div className="text-white font-bold">{player.currentRating.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
