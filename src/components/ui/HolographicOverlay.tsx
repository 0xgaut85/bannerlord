"use client"

export function HolographicOverlay() {
  return (
    <>
      {/* Metallic conic prismatic base — rotating rainbow refraction */}
      <div
        className="absolute inset-0 holo-conic pointer-events-none z-[5] rounded-[inherit]"
        style={{ mixBlendMode: "color-dodge", opacity: 0.45 }}
      />

      {/* Radial metallic light catch */}
      <div
        className="absolute inset-0 holo-radial pointer-events-none z-[6] rounded-[inherit]"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Secondary conic for depth — offset rotation */}
      <div
        className="absolute inset-0 pointer-events-none z-[7] rounded-[inherit]"
        style={{
          background: "conic-gradient(from 180deg at 40% 60%, rgba(120,200,255,0.3), rgba(200,120,255,0.2), rgba(255,200,120,0.3), rgba(120,255,200,0.2), rgba(120,200,255,0.3))",
          mixBlendMode: "screen",
          animation: "holoRotate 12s linear infinite reverse",
        }}
      />

      {/* Noise grain for metallic texture */}
      <div
        className="absolute inset-0 holo-noise pointer-events-none z-[8] rounded-[inherit]"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Primary shimmer sweep */}
      <div className="absolute inset-0 holo-shimmer pointer-events-none z-[9] rounded-[inherit]" />

      {/* Secondary shimmer for extra sparkle */}
      <div className="absolute inset-0 holo-shimmer-2 pointer-events-none z-[10] rounded-[inherit]" style={{ overflow: "hidden" }} />
    </>
  )
}
