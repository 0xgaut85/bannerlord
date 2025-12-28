"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

// Navigation structure with categories
const navigationCategories = [
  {
    name: "Ranking",
    items: [
      { name: "Current Ranking", href: "/community" },
      { name: "Curated Ranking", href: "/curated" },
      { name: "All-Time Ranking", href: "/alltime" },
    ]
  },
  {
    name: "Rate",
    items: [
      { name: "Rate", href: "/rate" },
      { name: "Q&A", href: "/qa" },
    ]
  },
  {
    name: "Modifications",
    items: [
      { name: "Edit", href: "/edit-player" },
      { name: "Admin", href: "/admin" },
    ]
  },
  {
    name: "Others",
    items: [
      { name: "Stats", href: "/stats" },
      { name: "History", href: "/history" },
      { name: "Team Builder", href: "/team-builder" },
    ]
  },
]

// Flat navigation for mobile
const flatNavigation = navigationCategories.flatMap(cat => cat.items)

// Dropdown component
function NavDropdown({ 
  category, 
  isHome, 
  pathname 
}: { 
  category: typeof navigationCategories[0]
  isHome: boolean
  pathname: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if any item in this category is active
  const hasActiveItem = category.items.some(item => pathname === item.href)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        className={cn(
          "px-4 py-2 text-sm font-medium tracking-tight rounded-lg transition-all duration-200 flex items-center gap-1",
          hasActiveItem
            ? isHome
              ? "text-[#0a0a0a] bg-white/90"
              : "text-[#c9a962] bg-[#c9a962]/10"
            : isHome
              ? "text-[#8a8a8a] hover:text-[#0a0a0a] hover:bg-white/90"
              : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white/50"
        )}
      >
        {category.name}
        <svg 
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute top-full left-0 mt-1 py-2 min-w-[180px] rounded-xl shadow-xl border transition-all duration-200 origin-top",
        isHome 
          ? "bg-white/95 backdrop-blur-md border-white/20" 
          : "bg-white border-gray-200",
        isOpen 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}>
        {category.items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-[#c9a962] bg-[#c9a962]/10"
                  : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-gray-100"
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  
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
          
          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:flex items-center gap-1">
            {navigationCategories.map((category) => (
              <NavDropdown 
                key={category.name}
                category={category}
                isHome={isHome}
                pathname={pathname}
              />
            ))}
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
        
        {/* Mobile Navigation with Accordion */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-[600px] pb-4" : "max-h-0"
        )}>
          <div className={cn(
            "pt-2 border-t",
            isHome ? "border-white/10" : "border-white/20"
          )}>
            <div className="flex flex-col gap-1">
              {navigationCategories.map((category) => (
                <div key={category.name}>
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.name ? null : category.name
                    )}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200",
                      isHome
                        ? "text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-white/90"
                        : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50"
                    )}
                  >
                    {category.name}
                    <svg 
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        expandedCategory === category.name && "rotate-180"
                      )} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Category Items */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    expandedCategory === category.name ? "max-h-[300px]" : "max-h-0"
                  )}>
                    {category.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "block pl-8 pr-4 py-2.5 text-sm font-medium transition-all duration-200",
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
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
