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

export function Flag({ code, size = "md", className = "" }: FlagProps) {
  // Default to EU flag if no code or invalid
  const flagCode = code?.toLowerCase() || "eu"
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

