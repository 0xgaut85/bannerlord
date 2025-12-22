"use client"

import Image from "next/image"

interface FlagProps {
  code: string | null | undefined
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = {
  sm: { width: 20, height: 15 },
  md: { width: 32, height: 24 },
  lg: { width: 48, height: 36 },
  xl: { width: 64, height: 48 },
}

// Map alternative flag names to their file names
const FLAG_ALIASES: Record<string, string> = {
  kazakhstan: "kazakhstan",
  liban: "liban",
  belarus: "belarus",
  // Standard ISO codes that might be used
  kz: "kz",
  lb: "lb",
  by: "by",
}

export function Flag({ code, size = "md", className = "" }: FlagProps) {
  // Default to EU flag if no code or invalid
  const rawCode = code?.toLowerCase() || "eu"
  // Use alias if exists, otherwise use the code directly
  const flagCode = FLAG_ALIASES[rawCode] || rawCode
  const { width, height } = sizes[size]
  
  return (
    <Image
      src={`/flags/${flagCode}.png`}
      alt={flagCode.toUpperCase()}
      width={width}
      height={height}
      className={`inline-block object-contain ${className}`}
      onError={(e) => {
        // Fallback to EU flag if image not found
        const target = e.target as HTMLImageElement
        target.src = "/flags/eu.png"
      }}
    />
  )
}



