"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CutCornerButtonProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

const C = 10

export function CutCornerButton({ children, active, onClick, className }: CutCornerButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const pts = w > 0
    ? `${C},0.5 ${w - 0.5},0.5 ${w - 0.5},${h - C} ${w - C},${h - 0.5} 0.5,${h - 0.5} 0.5,${C}`
    : ""

  const clipPath = `polygon(${C}px 0, 100% 0, 100% calc(100% - ${C}px), calc(100% - ${C}px) 100%, 0 100%, 0 ${C}px)`

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn("relative group whitespace-nowrap", className)}
      style={{ clipPath }}
    >
      <span
        className={cn(
          "block px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all duration-200",
          active
            ? "bg-white text-black"
            : "bg-white/[0.02] text-[#555] group-hover:text-white group-hover:bg-white/[0.05]"
        )}
      >
        {children}
      </span>

      {/* Dashed SVG border for inactive state */}
      {!active && pts && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ clipPath }}>
          <polygon
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-200 group-hover:stroke-[rgba(255,255,255,0.3)]"
          />
        </svg>
      )}
    </button>
  )
}
