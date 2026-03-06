"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

const nav = [
  {
    label: "Rankings",
    links: [
      { name: "Current", href: "/community" },
      { name: "Curated", href: "/curated" },
      { name: "All-Time", href: "/alltime" },
      { name: "History", href: "/history" },
    ],
  },
  {
    label: "Play",
    links: [
      { name: "Rate Players", href: "/rate" },
      { name: "Team Builder", href: "/team-builder" },
      { name: "Stats", href: "/stats" },
    ],
  },
  {
    label: "More",
    links: [
      { name: "Edit Player", href: "/edit-player" },
      { name: "Q&A", href: "/qa" },
      { name: "Admin", href: "/admin" },
    ],
  },
]

function Dropdown({ group, pathname }: { group: typeof nav[0]; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const isActive = group.links.some((l) => pathname === l.href)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setOpen(true) }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 120) }}
    >
      <button
        className={cn(
          "px-3 py-1.5 text-[13px] font-medium rounded-md flex items-center gap-1 transition-colors duration-150",
          isActive ? "text-white" : "text-[#666] hover:text-white"
        )}
      >
        {group.label}
        <svg className={cn("w-3 h-3 transition-transform duration-150", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={cn(
          "absolute top-full left-0 mt-2 min-w-[160px] rounded-lg border border-white/[0.06] bg-[#0a0a0a] shadow-2xl shadow-black/60 py-1 transition-all duration-150 origin-top-left",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {group.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "block px-3 py-2 text-[13px] font-medium transition-colors duration-100",
              pathname === link.href ? "text-white bg-white/[0.05]" : "text-[#666] hover:text-white hover:bg-white/[0.03]"
            )}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const isHome = pathname === "/"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        isHome ? "bg-transparent" : "bg-[#050505]/90 backdrop-blur-2xl border-b border-white/[0.04]"
      )}
    >
      <nav className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-[15px] font-bold tracking-tight text-white">
              BANNERLORD
            </span>
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#555] group-hover:text-[#888] transition-colors">
              RANK
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {nav.map((g) => (
              <Dropdown key={g.label} group={g} pathname={pathname} />
            ))}
          </div>

          {/* Auth + mobile toggle */}
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="w-7 h-7 rounded-full skeleton" />
            ) : session ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                    pathname === "/profile" ? "text-white" : "text-[#666] hover:text-white"
                  )}
                >
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="" width={24} height={24} className="w-6 h-6 rounded-full ring-1 ring-white/10 object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                      {(session.user?.discordName || session.user?.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block">{session.user?.discordName || session.user?.name || "Profile"}</span>
                </Link>
                <button onClick={() => signOut()} className="text-[13px] text-[#444] hover:text-[#888] transition-colors px-2 py-1">
                  Sign out
                </button>
              </>
            ) : (
              <Button onClick={() => signIn("discord")} size="sm" variant="primary">
                Sign in
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-md text-[#666] hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className="w-4 h-3.5 flex flex-col justify-between">
                <span className={cn("w-full h-[1.5px] bg-current transition-all duration-200", mobileOpen && "rotate-45 translate-y-[5px]")} />
                <span className={cn("w-full h-[1.5px] bg-current transition-all duration-200", mobileOpen && "opacity-0")} />
                <span className={cn("w-full h-[1.5px] bg-current transition-all duration-200", mobileOpen && "-rotate-45 -translate-y-[5px]")} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className={cn("md:hidden overflow-hidden transition-all duration-250", mobileOpen ? "max-h-[500px] pb-3" : "max-h-0")}>
          <div className="pt-1 border-t border-white/[0.04]">
            {nav.map((g) => (
              <div key={g.label}>
                <button
                  onClick={() => setExpanded(expanded === g.label ? null : g.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold text-[#666] hover:text-white transition-colors"
                >
                  {g.label}
                  <svg className={cn("w-3.5 h-3.5 transition-transform duration-150", expanded === g.label && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={cn("overflow-hidden transition-all duration-200", expanded === g.label ? "max-h-[200px]" : "max-h-0")}>
                  {g.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block pl-6 pr-3 py-2 text-[13px] font-medium transition-colors",
                        pathname === link.href ? "text-white" : "text-[#555] hover:text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
