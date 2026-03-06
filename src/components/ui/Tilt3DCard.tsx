"use client"

import { useRef, useState, useCallback, type ReactNode, type CSSProperties } from "react"

interface Tilt3DCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  glareEnabled?: boolean
  scale?: number
}

export function Tilt3DCard({
  children,
  className = "",
  maxTilt = 12,
  glareEnabled = true,
  scale = 1.03,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const halfW = rect.width / 2
      const halfH = rect.height / 2
      const relX = (e.clientX - rect.left - halfW) / halfW
      const relY = (e.clientY - rect.top - halfH) / halfH

      setTilt({ x: relX * maxTilt, y: -relY * maxTilt })
      setGlarePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    },
    [maxTilt]
  )

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setTilt({ x: 0, y: 0 })
    setGlarePos({ x: 50, y: 50 })
  }, [])

  const containerStyle: CSSProperties = {
    perspective: "800px",
    transformStyle: "preserve-3d",
  }

  const cardStyle: CSSProperties = {
    transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale3d(${isHovering ? scale : 1}, ${isHovering ? scale : 1}, 1)`,
    transition: isHovering
      ? "transform 0.12s ease-out"
      : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
    transformStyle: "preserve-3d",
    willChange: "transform",
  }

  const glareStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    zIndex: 40,
    opacity: isHovering ? 1 : 0,
    transition: "opacity 0.3s ease-out",
    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 35%, transparent 65%)`,
    mixBlendMode: "overlay",
  }

  return (
    <div style={containerStyle} className={className}>
      <div
        ref={cardRef}
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
        {glareEnabled && <div style={glareStyle} />}
      </div>
    </div>
  )
}
