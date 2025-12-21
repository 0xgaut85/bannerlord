"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Global Ranking", href: "/community" },
  { name: "Users Ranking", href: "/players" },
  { name: "Make your Ranking", href: "/rate" },
  { name: "Q&A", href: "/qa" },
  { name: "Edit Player", href: "/edit-player" },
  { name: "Admin", href: "/admin" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isHome = pathname === "/"
  
  return (
    <header className={cn(
      "sticky top-0 z-50 transition-colors duration-300",
      isHome ? "bg-transparent" : "glass"
    )}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className={cn(
              "font-display text-2xl font-semibold tracking-tight transition-colors",
              isHome ? "text-[#6a6a6a]" : "text-[#1a1a1a]"
            )}>
              Bannerlord
            </span>
            <span className={cn(
              "hidden sm:block text-sm font-medium tracking-wide uppercase transition-colors",
              isHome ? "text-[#6a6a6a]" : "text-[#8a8a8a]"
            )}>
              Ranking
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium tracking-tight rounded-lg transition-all duration-200",
                    isActive 
                      ? isHome
                        ? "text-[#0a0a0a] bg-white/90"
                        : "text-[#c9a962] bg-[#c9a962]/10"
                      : isHome
                        ? "text-[#8a8a8a] hover:text-[#0a0a0a] hover:bg-white/90"
                        : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/50"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-[#c5c5c5]/30 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
                    pathname === "/profile"
                      ? isHome
                        ? "text-[#0a0a0a] bg-white/90"
                        : "text-[#c9a962] bg-[#c9a962]/10"
                      : isHome
                        ? "text-[#8a8a8a] hover:text-[#0a0a0a] hover:bg-white/90"
                        : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/50"
                  )}
                >
                  {session.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="" 
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full ring-2 ring-white/20 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#c9a962]/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#c9a962]">
                        {(session.user?.discordName || session.user?.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {session.user?.discordName || session.user?.name || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    isHome ? "text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-white/90 rounded-lg" : "text-[#8a8a8a] hover:text-[#1a1a1a]"
                  )}
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Button onClick={() => signIn("discord")} size="sm" variant="primary">
                Sign in
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                isHome 
                  ? "text-[#8a8a8a] hover:text-[#0a0a0a] hover:bg-white/90" 
                  : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/50"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menu</span>
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={cn(
                  "w-full h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen && "rotate-45 translate-y-1.5"
                )} />
                <span className={cn(
                  "w-full h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen && "opacity-0"
                )} />
                <span className={cn(
                  "w-full h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen && "-rotate-45 -translate-y-1.5"
                )} />
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <div className={cn(
            "pt-2 border-t",
            isHome ? "border-white/10" : "border-white/20"
          )}>
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                      isActive 
                        ? isHome
                          ? "text-[#0a0a0a] bg-white/90"
                          : "text-[#c9a962] bg-[#c9a962]/10"
                        : isHome
                          ? "text-[#8a8a8a] hover:text-[#0a0a0a] hover:bg-white/90"
                          : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/50"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
