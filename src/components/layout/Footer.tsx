"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  
  // Hide footer on home page (it has its own integrated footer)
  if (pathname === "/") {
    return null
  }
  
  return (
    <footer className="mt-auto">
      <div className="divider" />
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-[#2d2d2d]">
              Bannerlord
            </span>
            <span className="text-xs font-medium text-[#8a8a8a] tracking-widest uppercase">
              Ranking
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
            <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">
              Terms
            </Link>
            <span>
              Crafted by <span className="font-medium text-[#c9a962]">Obelix</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
