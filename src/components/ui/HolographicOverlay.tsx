"use client"

export function HolographicOverlay() {
  return (
    <>
      {/* Rainbow prismatic gradient layer */}
      <div
        className="absolute inset-0 holo-bg pointer-events-none z-[5] rounded-[inherit]"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Conic rainbow refraction */}
      <div
        className="absolute inset-0 pointer-events-none z-[6] rounded-[inherit]"
        style={{
          background: "conic-gradient(from 0deg, #ff000018, #ffaa0018, #ffff0018, #00ff0018, #00ffff18, #0000ff18, #ff00ff18, #ff000018)",
          backgroundSize: "100% 100%",
          animation: "holoShift 8s linear infinite",
          mixBlendMode: "color-dodge",
        }}
      />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 holo-shimmer pointer-events-none z-[7] rounded-[inherit]" />
    </>
  )
}
