"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  if (pathname === "/") return null

  return (
    <footer className="mt-auto border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[13px] font-bold tracking-tight text-[#333]">
            BANNERLORD <span className="text-[10px] font-semibold tracking-[0.2em] text-[#222]">RANK</span>
          </span>
          <div className="flex items-center gap-5 text-[12px] text-[#333]">
            <Link href="/privacy" className="hover:text-[#888] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#888] transition-colors">Terms</Link>
            <span>by <span className="text-[#888] font-medium">Obelix</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
