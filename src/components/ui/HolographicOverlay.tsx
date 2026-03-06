"use client"

export function HolographicOverlay() {
  return (
    <>
      {/* Ruby conic gradient — deep red rotation */}
      <div
        className="absolute inset-0 ruby-conic pointer-events-none z-[5] rounded-[inherit]"
        style={{ mixBlendMode: "color-dodge", opacity: 0.35 }}
      />

      {/* Radial ruby light catch */}
      <div
        className="absolute inset-0 ruby-radial pointer-events-none z-[6] rounded-[inherit]"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Secondary deeper red layer */}
      <div
        className="absolute inset-0 pointer-events-none z-[7] rounded-[inherit]"
        style={{
          background: "radial-gradient(ellipse at 60% 70%, rgba(220,40,60,0.2) 0%, rgba(139,0,0,0.1) 40%, transparent 70%)",
          mixBlendMode: "screen",
          animation: "rubyPulse 3s ease-in-out infinite",
        }}
      />

      {/* Noise grain */}
      <div
        className="absolute inset-0 ruby-noise pointer-events-none z-[8] rounded-[inherit]"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 ruby-shimmer pointer-events-none z-[9] rounded-[inherit]" />
    </>
  )
}
